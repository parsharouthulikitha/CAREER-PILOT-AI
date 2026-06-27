import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for external frontends like Netlify
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const PORT = 3000;

// Initialize Gemini SDK with telemetry User-Agent
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for generic text generation if API key is present
async function generateSimpleText(prompt: string, systemInstruction?: string): Promise<string> {
  if (!geminiApiKey) {
    return "Gemini API key is not configured. Please set GEMINI_API_KEY in secrets/secrets panel.";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text || "";
  } catch (error: any) {
    console.error("Gemini text generation error:", error);
    return `Error generating content: ${error.message || error}`;
  }
}

// User Persistence JSON Database
const USERS_FILE = path.join(process.cwd(), "users.json");

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save users:", e);
  }
}

// Auth endpoints
app.post("/api/auth/register", (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = loadUsers();
  const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const newUser = {
    uid: "usr_" + Date.now() + Math.random().toString(36).substr(2, 4),
    email,
    password,
    displayName: displayName || email.split("@")[0],
    photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || email)}`,
    isAdmin: email.toLowerCase().includes("admin") || email.toLowerCase() === "parsharothuvarma@gmail.com"
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = loadUsers();
  const user = users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!geminiApiKey });
});

// 2. Chat Coach Endpoint
app.post("/api/career-coach", async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const profileContext = userProfile
    ? `User Profile:
- Name: ${userProfile.displayName || "User"}
- Education: ${userProfile.education || "Not specified"}
- Experience: ${userProfile.experience || "Not specified"}
- Current Skills: ${userProfile.skills || "Not specified"}
- Dream Role: ${userProfile.dreamRole || "Not specified"} at ${userProfile.dreamCompany || "Not specified"}
- Goals: ${userProfile.careerGoals || "Not specified"}`
    : "No profile context provided.";

  const systemInstruction = `You are CareerPilot AI, an elite personal Career Coach & Interview Expert.
Your style is highly encouraging, professional, and full of clear, actionable advice.
Provide bullet points where helpful. Guide the user step-by-step through their questions.
Use the following user background to personalize your suggestions if relevant:
${profileContext}`;

  // Formulate chat context
  // Map messages to contents format: each item has role 'user' or 'model' and parts.
  const formattedContents = messages.map((m: any) => {
    return {
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    };
  });

  try {
    if (!geminiApiKey) {
      return res.json({
        text: "Hi there! I am CareerPilot AI. (API Key not set in secrets, showing simulated advice) To help you transition into your dream role, I recommend focusing on building key projects, tailoring your resume, and practicing the STAR technique for behavioral questions.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Coach chat error:", err);
    res.status(500).json({ error: err.message || "Failed to generate coaching response." });
  }
});

// 3. Resume Analyzer
app.post("/api/analyze-resume", async (req, res) => {
  const { resumeText, targetRole } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: "Resume text is required." });
  }

  const prompt = `Analyze this resume against the target role: "${targetRole || "General Professional"}".
Provide a comprehensive evaluation including:
- formatting rating and comments
- ATS compatibility evaluation
- Grammar issues
- Missing sections
- Weak action verbs and replacement suggestions
- Keyword optimization suggestions
- An overall ATS score between 0 and 100
- 3 key actionable improvement suggestions
- An optimized, formatted version of the resume in Markdown layout

Resume Content:
${resumeText}`;

  try {
    if (!geminiApiKey) {
      // Return simulated rich output
      return res.json({
        score: 75,
        formatting: "Good layout but margin sizes could be optimized to keep it single-page. Ensure typography scale is consistent.",
        atsCompatibility: "Moderate. Standard headings used. Some tables or multi-column layouts might confuse older ATS parses.",
        grammar: "No major grammatical issues found, but verify the consistency of past/present tense usage across job roles.",
        missingSections: "Missing a dedicated Projects section which is critical for demonstrating hands-on technical skills.",
        weakVerbs: "Found weak verbs: 'Responsible for', 'Helped', 'Handled'. Change to 'Spearheaded', 'Optimized', 'Orchestrated' respectively.",
        keywordOptimization: `Missing high-frequency keywords for "${targetRole || "the role"}": 'Systems design', 'Strategic planning', 'Metrics-driven development', 'Cross-functional delivery'.`,
        suggestions: "1. Add a Projects section with 2 major accomplishments.\n2. Upgrade passive verbs to active accomplishments with quantifiable results.\n3. Integrate missing keywords throughout your experience summaries.",
        optimizedResumeText: `# Optimized Resume Preview\n\n**Professional Summary**\nResult-oriented specialist with deep experience driving target projects...\n\n**Core Skills**\n* Standard Technical & Behavioral Skills\n* Key Industry tools\n\n**Professional Experience**\n* Spearheaded collaborative sprint teams to reduce processing latency by 20%.\n* Orchestrated cross-functional deployments...`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            formatting: { type: Type.STRING },
            atsCompatibility: { type: Type.STRING },
            grammar: { type: Type.STRING },
            missingSections: { type: Type.STRING },
            weakVerbs: { type: Type.STRING },
            keywordOptimization: { type: Type.STRING },
            suggestions: { type: Type.STRING },
            optimizedResumeText: { type: Type.STRING },
          },
          required: [
            "score",
            "formatting",
            "atsCompatibility",
            "grammar",
            "missingSections",
            "weakVerbs",
            "keywordOptimization",
            "suggestions",
            "optimizedResumeText",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Resume analysis error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze resume." });
  }
});

// 4. Mock Interview - Generate Questions
app.post("/api/mock-interview/generate-questions", async (req, res) => {
  const { role, mode, type } = req.body;

  const prompt = `Generate a list of 5 interview questions for a "${role || "Software Engineer"}" interview.
Difficulty level: ${mode || "Intermediate"}.
Question type: ${type || "Technical"}.
Provide real, industry-representative questions. Return them as a structured list with brief sample answers and ideal answers for reference.`;

  try {
    if (!geminiApiKey) {
      // Mocked questions
      const mockQuestions = [
        {
          id: "q1",
          question: `Can you explain how you would design a scalable rate limiter for an API endpoint?`,
          idealAnswer: "Explain Token Bucket/Leaky Bucket algorithms, Redis for atomic operations, and custom headers for limit status.",
        },
        {
          id: "q2",
          question: `What are the trade-offs of using Microservices vs. Monolithic architecture?`,
          idealAnswer: "Trade-offs include deploy speed, fault isolation, operational complexity, network latency, and transactional boundary overhead.",
        },
        {
          id: "q3",
          question: "How do you handle difficult teammates or constructive disagreements on design decisions?",
          idealAnswer: "Focus on technical facts, empathy, compromise, standard process consensus, and aligning behind the final team decisions.",
        },
        {
          id: "q4",
          question: "How does asynchronous programming work in your primary language, and what is event loop exhaustion?",
          idealAnswer: "Discuss event loops, callbacks, promises, async/await, and blocking operations preventing other event runs.",
        },
        {
          id: "q5",
          question: "What is your process for debugging a complex performance regression in a production environment?",
          idealAnswer: "Establish baseline, consult metrics/logs, profile resources (CPU, Memory, I/O), replicate in sandbox, isolate commits, and deploy incremental fixes.",
        },
      ];
      return res.json({ questions: mockQuestions });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  idealAnswer: { type: Type.STRING },
                },
                required: ["id", "question", "idealAnswer"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Generate questions error:", err);
    res.status(500).json({ error: err.message || "Failed to generate interview questions." });
  }
});

// 5. Mock Interview - Evaluate Answer
app.post("/api/mock-interview/evaluate-answer", async (req, res) => {
  const { question, answer, role, mode, type } = req.body;

  const prompt = `Evaluate the following user answer to an interview question:
Question: "${question}"
User's Answer: "${answer}"
Role Context: "${role}"
Difficulty level: "${mode}"
Question type: "${type}"

Evaluate the answer and provide:
- confidenceScore (0 to 100)
- clarityScore (0 to 100)
- correctnessScore (0 to 100)
- detailedFeedback (detailed professional feedback on what they did well and what is missing)
- suggestedAnswer (an outstanding model answer demonstrating how they should answer)
- starMethodEvaluation (if Behavioral/Situational type, map the answer to Situation, Task, Action, Result and give specific STAR feedback. For other question types, provide general STAR alignment feedback)`;

  try {
    if (!geminiApiKey) {
      return res.json({
        confidenceScore: 82,
        clarityScore: 78,
        correctnessScore: 80,
        detailedFeedback: "You explained the core concept well. However, you could make it stronger by providing a specific real-world example of how you implemented this in your past projects. Ensure you cover potential bottlenecks as well.",
        suggestedAnswer: "To design a scalable rate limiter, I would utilize the sliding window counter algorithm stored in a fast caching layer like Redis. I would define rate limit rules globally or per-endpoint, check tokens on entry synchronously, return HTTP status 429 upon exhaustion, and include rate-limit headers (X-RateLimit-Limit, Remaining, Reset) in the response.",
        starMethodEvaluation: "Situation: Discussed api limits. Task: Safe rate-limits. Action: Stored keys in caching servers. Result: High-performance routing without exhausting the DB. Feedback: Great work on explaining the actions, but emphasize the metric results more.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidenceScore: { type: Type.INTEGER },
            clarityScore: { type: Type.INTEGER },
            correctnessScore: { type: Type.INTEGER },
            detailedFeedback: { type: Type.STRING },
            suggestedAnswer: { type: Type.STRING },
            starMethodEvaluation: { type: Type.STRING },
          },
          required: [
            "confidenceScore",
            "clarityScore",
            "correctnessScore",
            "detailedFeedback",
            "suggestedAnswer",
            "starMethodEvaluation",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Evaluate answer error:", err);
    res.status(500).json({ error: err.message || "Failed to evaluate answer." });
  }
});

// 6. Career Roadmap
app.post("/api/career-roadmap", async (req, res) => {
  const { topic } = req.body; // e.g. "Frontend", "Backend", "Cybersecurity", etc.

  const prompt = `Generate a detailed 3-tier career roadmap (Beginner, Intermediate, Advanced) for learning "${topic || "Full Stack Development"}".
Each level must include:
- A title or focus
- 3 detailed learning items/topics with descriptions
- Recommended projects (at least 2 with descriptions)
- Essential industry certifications to target
- A practice schedule recommendation

Provide a short learning estimate / timeline as well.`;

  try {
    if (!geminiApiKey) {
      return res.json({
        title: `${topic || "Full Stack"} Career Roadmap`,
        timeline: "6 to 9 Months (15-20 hours/week)",
        steps: [
          {
            level: "Beginner",
            focus: "Foundational Standards & Core Elements",
            topics: [
              "Core programming fundamentals and language principles.",
              "Version control systems, repositories, and standard CLI commands.",
              "Basic data structures, algorithms, and modular design.",
            ],
            projects: [
              "Responsive Static Portal: Build a multi-page portal detailing structured docs.",
              "Command Line Organizer: Create an offline task system in node/python with basic storage.",
            ],
            certifications: ["CompTIA IT Fundamentals+", "AWS Certified Cloud Practitioner"],
            practiceSchedule: "Spend 2 hours daily, focusing 70% on coding exercises and 30% on reading.",
          },
          {
            level: "Intermediate",
            focus: "Advanced Frameworks & Database Engineering",
            topics: [
              "Advanced component logic, state machines, and API interactions.",
              "Relational vs Non-relational databases, design rules, indexing, and ORMs.",
              "Asynchronous processes, service architecture, and test-driven development.",
            ],
            projects: [
              "Collaborative Web Workspace: Full-stack dashboard with real-time updates and user dashboards.",
              "Inventory REST API: Secure service layer with full verification and database backup.",
            ],
            certifications: ["Oracle Certified Professional Java SE", "Google Associate Cloud Engineer"],
            practiceSchedule: "Work on structured project modules 3-4 days a week, keeping a dev log.",
          },
          {
            level: "Advanced",
            focus: "Cloud Architecture, DevOps, & Scalability",
            topics: [
              "Containerization, CI/CD orchestration pipelines, and microservice infrastructure.",
              "High availability system designs, caching proxies, and global CDNs.",
              "Advanced security engineering, OAuth integration, and telemetry observability.",
            ],
            projects: [
              "High-Scale Event Broker: Build an elastic streaming service utilizing background queue pipelines.",
              "Multi-tenant Enterprise Manager: SaaS application with automated deployment structures.",
            ],
            certifications: ["AWS Certified Solutions Architect - Professional", "Google Professional Cloud Architect"],
            practiceSchedule: "Spend 10 hours a week on systems architecture designs and mock-ups, 5 hours reviewing legacy repositories.",
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            timeline: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practiceSchedule: { type: Type.STRING },
                },
                required: ["level", "focus", "topics", "projects", "certifications", "practiceSchedule"],
              },
            },
          },
          required: ["title", "timeline", "steps"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Career roadmap error:", err);
    res.status(500).json({ error: err.message || "Failed to generate roadmap." });
  }
});

// 7. Skill Gap Analysis
app.post("/api/skill-gap-analysis", async (req, res) => {
  const { currentSkills, dreamCompany, dreamRole } = req.body;

  const prompt = `Perform a comprehensive skill gap analysis for a professional targeting the following goal:
- Dream Company: ${dreamCompany || "Any Elite Company"}
- Dream Role: ${dreamRole || "Software Engineer / Product"}
- Current Skills: ${currentSkills || "Basic programming, communication"}

Identify:
- A lists of currently matching/validated skills
- 5 missing skills that are essential to be successful at the target dream company/role
- A concrete learning roadmap with estimated milestones
- Estimated total completion timeline in weeks or months`;

  try {
    if (!geminiApiKey) {
      return res.json({
        matchingSkills: currentSkills ? currentSkills.split(",").map((s: string) => s.trim()) : ["Core Logic"],
        missingSkills: ["System Design & Orchestration", "Distributed Caching (Redis/Memcached)", "CI/CD Pipeline Security", "Performance Profiling", "Advanced Algorithms & Optimization"],
        learningRoadmap: [
          { phase: "Phase 1: Foundations", timeline: "4 weeks", focus: "Data structures, complex algorithm logic and run-time analysis." },
          { phase: "Phase 2: System Architecture", timeline: "6 weeks", focus: "Load balancers, distributed databases, partition rules, and replica states." },
          { phase: "Phase 3: Production Release", timeline: "4 weeks", focus: "CI/CD setups, telemetry tracking, and container deployment security." },
        ],
        estimatedCompletion: "14 Weeks (around 3.5 Months)",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            learningRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  timeline: { type: Type.STRING },
                  focus: { type: Type.STRING },
                },
                required: ["phase", "timeline", "focus"],
              },
            },
            estimatedCompletion: { type: Type.STRING },
          },
          required: ["matchingSkills", "missingSkills", "learningRoadmap", "estimatedCompletion"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Skill gap analysis error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze skill gap." });
  }
});

// 8. Cover Letter Generator
app.post("/api/cover-letter", async (req, res) => {
  const { resumeText, jobDescription, company, role } = req.body;

  const prompt = `Draft a high-converting, professional, tailored cover letter for the following role:
- Role: ${role || "Target Professional Role"}
- Company: ${company || "Target Company"}
- Job Description:
${jobDescription || "Standard job requirements"}

Leverage the candidate's professional highlights from this resume context to customize the letters' arguments:
${resumeText || "Candidate experience in modern business execution, team collaboration, and metric accomplishments."}`;

  try {
    const text = await generateSimpleText(
      prompt,
      "You are an expert career copywriter. Write a highly compelling cover letter in standard professional email/letter format."
    );
    res.json({ text });
  } catch (err: any) {
    console.error("Cover letter error:", err);
    res.status(500).json({ error: err.message || "Failed to generate cover letter." });
  }
});

// 9. Job Match Analyzer
app.post("/api/job-match", async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  const prompt = `Match the candidate's resume text against this job description:
Job Description:
${jobDescription}

Resume Text:
${resumeText}

Analyze details and compute:
- Match percentage (0 to 100)
- Missing key words (list of words missing in the resume but key in the JD)
- Missing required skills
- Resume optimization suggestions (clear, actionable list)`;

  try {
    if (!geminiApiKey) {
      return res.json({
        matchPercentage: 68,
        missingKeywords: ["Microservices", "Docker", "SaaS Scale", "Service Discovery", "SLOs"],
        missingSkills: ["Kubernetes", "Redis cache patterns", "CI/CD tooling"],
        suggestions: [
          "Include a short subsection in your skills list targeting 'Infrastructure & Orchestration'.",
          "Modify your latest position description to highlight experience deploying containerized microservices.",
          "Add metrics stating how you managed system latency or service level objectives (SLOs) in production.",
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchPercentage: { type: Type.INTEGER },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["matchPercentage", "missingKeywords", "missingSkills", "suggestions"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Job match error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze job match." });
  }
});

// 10. AI Personality Assessment (Supports both /api/personality-assessment and /api/career-assessment/evaluate)
app.post(["/api/personality-assessment", "/api/career-assessment/evaluate"], async (req, res) => {
  const { answers, dreamRole } = req.body;

  const prompt = `Evaluate these 5 behavioral assessment choices made by a job candidate targeting the role of "${dreamRole || "General Professional"}":
${answers ? JSON.stringify(answers) : "No choices provided"}

Provide:
- persona: A specific, descriptive persona name (e.g. "System Architect Visionary", "Full-Stack Builder")
- dominantTrait: The same or similar trait name
- summary: A detailed visual/technical summary of their profile
- explanation: A detailed explanation of their profile
- compatibleRoles: A list of 3 highly suited job titles
- careerFits: The same list of suited job titles
- suggestedFocus: A specific action plan or study recommendation
- workplaceEnvironment: Ideal company workspace conditions
- communicationStyle: Detailed analysis of how they interact in teams`;

  try {
    if (!geminiApiKey) {
      return res.json({
        persona: "System Architect Visionary",
        dominantTrait: "Analytical Strategist",
        summary: "You excel at deep architectural reasoning, optimization problems, and scalable system structures.",
        explanation: "You demonstrate an exceptional focus on systematic problem solving, preferring logic, structure, and metric-backed findings.",
        compatibleRoles: ["AI Infrastructure Engineer", "Database Specialist", "Technical Lead"],
        careerFits: ["AI Infrastructure Engineer", "Database Specialist", "Technical Lead"],
        suggestedFocus: "Prioritize compilers, distributed consensus systems, and machine learning infrastructure models.",
        workplaceEnvironment: "Highly organized, data-driven workspaces with clear metrics and minimal ad-hoc distractions.",
        communicationStyle: "Clear, direct, concise, preferring reports, dashboards, and structured documentation.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            dominantTrait: { type: Type.STRING },
            summary: { type: Type.STRING },
            explanation: { type: Type.STRING },
            compatibleRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
            careerFits: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedFocus: { type: Type.STRING },
            workplaceEnvironment: { type: Type.STRING },
            communicationStyle: { type: Type.STRING },
          },
          required: [
            "persona",
            "dominantTrait",
            "summary",
            "explanation",
            "compatibleRoles",
            "careerFits",
            "suggestedFocus",
            "workplaceEnvironment",
            "communicationStyle",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Personality assessment error:", err);
    res.status(500).json({ error: err.message || "Failed to assess personality." });
  }
});

// 11. Salary Prediction / Guidance (Supports both /api/salary-prediction and /api/salary-predictor)
app.post(["/api/salary-prediction", "/api/salary-predictor"], async (req, res) => {
  const { role, location, experienceLevel, experience } = req.body;
  const targetRole = role || "Software Engineer";
  const targetLocation = location || "Remote / USA";
  const targetExp = experienceLevel || experience || "Mid-Level";

  const prompt = `Predict a realistic salary range and compensation breakdown for:
- Role: ${targetRole}
- Location: ${targetLocation}
- Experience Level: ${targetExp}

Provide:
- low: an integer representing the lower range of annual salary in USD (e.g. 95000)
- lowRange: a string representation of the low range (e.g. "95,000")
- high: an integer representing the higher range of annual salary in USD (e.g. 140000)
- highRange: a string representation of the high range (e.g. "140,000")
- median: an integer representing the median annual salary in USD (e.g. 118000)
- medianRange: a string representation of the median range (e.g. "118,000")
- bonus: a string describing the benefits breakdown (equity, bonus, insurance)
- benefitsBreakdown: the same benefits breakdown string
- growthIndex: a short string describing the market growth trend (e.g. "High (+12% YoY)")
- salaryNegotiationTips: a list of 3 key strategies customized for this level`;

  try {
    if (!geminiApiKey) {
      return res.json({
        low: 95000,
        lowRange: "95,000",
        high: 140000,
        highRange: "140,000",
        median: 118000,
        medianRange: "118,000",
        bonus: "10% annual performance bonus, $15,000 equity vesting over 4 years, comprehensive medical coverage, and 401(k) matching up to 4%.",
        benefitsBreakdown: "10% annual performance bonus, $15,000 equity vesting over 4 years, comprehensive medical coverage, and 401(k) matching up to 4%.",
        growthIndex: "High (+12% YoY)",
        salaryNegotiationTips: [
          "Leverage competitive market rates with local cost of living metrics.",
          "Do not disclose salary history; instead focus negotiations on value addition and specialized skill premiums.",
          "Always counter the first offer, emphasizing your certified credentials and direct project matches.",
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            low: { type: Type.INTEGER },
            lowRange: { type: Type.STRING },
            high: { type: Type.INTEGER },
            highRange: { type: Type.STRING },
            median: { type: Type.INTEGER },
            medianRange: { type: Type.STRING },
            bonus: { type: Type.STRING },
            benefitsBreakdown: { type: Type.STRING },
            growthIndex: { type: Type.STRING },
            salaryNegotiationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "low",
            "lowRange",
            "high",
            "highRange",
            "median",
            "medianRange",
            "bonus",
            "benefitsBreakdown",
            "growthIndex",
            "salaryNegotiationTips"
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Salary prediction error:", err);
    res.status(500).json({ error: err.message || "Failed to predict salary guidance." });
  }
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

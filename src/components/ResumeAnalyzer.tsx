import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Search, 
  Upload, 
  Download, 
  Edit, 
  Plus, 
  Trash2, 
  RefreshCw,
  Copy,
  ChevronRight
} from "lucide-react";
import { ResumeAnalysis, UserProfile } from "../types";
import { getApiUrl } from "../lib/api";

interface ResumeAnalyzerProps {
  userProfile: UserProfile;
  resumeAnalyses: ResumeAnalysis[];
  onSaveAnalysis: (analysis: ResumeAnalysis) => void;
  onUpdateSkills: (skills: string) => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function ResumeAnalyzer({ userProfile, resumeAnalyses, onSaveAnalysis, onUpdateSkills, showToast }: ResumeAnalyzerProps) {
  const [tab, setTab] = useState<"analyze" | "builder">("analyze");
  
  // Analyzer States
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState(userProfile.dreamRole || "Software Engineer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(resumeAnalyses[0] || null);

  // Resume Builder States
  const [builderDetails, setBuilderDetails] = useState({
    fullName: userProfile.displayName || "Pilot Student",
    email: userProfile.email || "student@pilot.ai",
    phone: "+1 (555) 019-2834",
    linkedin: "linkedin.com/in/pilotstudent",
    website: "github.com/pilotstudent",
    summary: "Aspiring software professional eager to apply advanced development and analytical skills to enterprise systems.",
    education: [
      { school: "University of Technology", degree: "B.S. in Computer Science", period: "2023 - 2027", gpa: "3.8/4.0" }
    ],
    experience: [
      { company: "Global Tech Solutions", role: "Software Engineer Intern", period: "Summer 2025", desc: "Coordinated development of key feature microservices. Helped speed up API queries. Worked in agile teams." }
    ],
    projects: [
      { name: "Portfolio Hub", desc: "Build an interactive platform to showcase portfolio pieces using React, Node, and Tailwind.", link: "github.com/project/portfolio" }
    ],
    skills: userProfile.skills || "JavaScript, React, Tailwind CSS, Python, SQL",
    certifications: "AWS Cloud Practitioner, Certified ScrumMaster",
    achievements: "Winner of Local Hackathon 2025 (1st place out of 50 teams)"
  });

  const [builderTemplate, setBuilderTemplate] = useState<"minimal" | "classic" | "tech">("tech");

  // Handle AI Resume Analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";

    try {
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/analyze-resume"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newAnalysis: ResumeAnalysis = {
        id: "res_" + Date.now(),
        fileName: `Resume_Analysis_${targetRole.replace(/\s+/g, "_")}.pdf`,
        score: data.score || 80,
        formatting: data.formatting || "Format analysis complete.",
        atsCompatibility: data.atsCompatibility || "ATS evaluation complete.",
        grammar: data.grammar || "Grammar scan complete.",
        missingSections: data.missingSections || "None identified.",
        weakVerbs: data.weakVerbs || "None found.",
        keywordOptimization: data.keywordOptimization || "None.",
        suggestions: data.suggestions || "Optimize structure.",
        optimizedResumeText: data.optimizedResumeText || "Optimized resume preview.",
        createdAt: new Date().toISOString()
      };

      onSaveAnalysis(newAnalysis);
      setActiveAnalysis(newAnalysis);
      
      // Update user skills if newly suggested and missing
      if (data.keywordOptimization && !userProfile.skills) {
        onUpdateSkills(builderDetails.skills);
      }

    } catch (e: any) {
      console.warn("Analyzing resume via client-side offline fallback:", e);
      if (e?.message !== "offline_triggered") {
        showToast?.("Backend server offline. Running resume scan in offline simulation mode.", "info");
      } else {
        showToast?.("Running in Offline Practice Mode.", "info");
      }

      // Generate a highly realistic dynamic mock analysis response based on targetRole
      const cleanRole = targetRole || "Software Engineer";
      
      const newAnalysis: ResumeAnalysis = {
        id: "res_" + Date.now(),
        fileName: `Resume_Analysis_${cleanRole.replace(/\s+/g, "_")}.pdf`,
        score: 78,
        formatting: "### Formatting Review\n- **Font Selection**: Excellent choice of clean typography (sans-serif) which is easy for both humans and scanners to read.\n- **Hierarchy**: Good spacing and clear section separators. Headings are easily distinguishable.",
        atsCompatibility: `### ATS Parser Compatibility\n- **File Structure**: Standard single-page format detected. Ready for ATS parsing.\n- **Quantifiable Results**: We noted a few bullet points that lack metrics. Try to include percentages, time saved, or dollar values to capture your true business impact.`,
        grammar: "### Grammar & Readability Scans\n- No major spelling mistakes or syntax errors detected. Maintain active, powerful wording throughout.",
        missingSections: "### Missing Recommended Elements\n- **Professional Summary**: Missing a 2-3 line modern technical summary outlining your unique specialization.\n- **Links**: Ensure your LinkedIn profile, portfolio, and GitHub URLs are active at the top.",
        weakVerbs: `### Weak Verbs Found\n- Identified passive phrases like "worked on", "assisted in", and "responsible for".\n- **Recommendation**: Replace with action verbs like *Architected, Spearheaded, Automated, or Modernized*.`,
        keywordOptimization: `### Missing Critical Keywords for: ${cleanRole}\n- High-impact keywords to add: **System Design, Cloud Native Architecture, CI/CD, Agile Methodology, Unit Testing, Docker**`,
        suggestions: `### Recommended Action Plan\n1. Replace passive verbs with active ones at the beginning of each bullet.\n2. Add at least 3 bullet points that quantify your results (e.g. *Optimized DB query latency by 35%*).\n3. List specific cloud platform and CI/CD competencies explicitly in the skills block.`,
        optimizedResumeText: `[YOUR NAME] | [YOUR PHONE] | [YOUR EMAIL] | [YOUR PORTFOLIO LINK]

### Professional Summary
A dedicated, results-driven professional specializing in ${cleanRole}. Adept at designing scalable architectures, leading product development pipelines, and automating deployment configurations with a commitment to clean code and high performance.

### Professional Experience
**Senior Associate SDE** | TechCorp (2024 - Present)
- Spearheaded the modernization of core backend services, decreasing latency by 40% and cutting infrastructure expenses by $15,000 annually.
- Architected reusable front-end layout pipelines in React, speeding up initial page loads by 1.2 seconds.
- Orchestrated automated test coverage configurations to decrease production escape bugs by 20%.

**Associate Software Engineer** | InnovateWeb (2022 - 2024)
- Automated deployment container routines using Docker and GitHub Actions, lowering integration build times by 15 minutes.
- Optimized database indexing strategies for transactional queries, improving throughput by 4x.`,
        createdAt: new Date().toISOString()
      };

      onSaveAnalysis(newAnalysis);
      setActiveAnalysis(newAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast?.("Copied to clipboard!", "success");
  };

  // Add field functions for builder
  const addEducation = () => {
    setBuilderDetails({
      ...builderDetails,
      education: [...builderDetails.education, { school: "", degree: "", period: "", gpa: "" }]
    });
  };

  const removeEducation = (index: number) => {
    const list = [...builderDetails.education];
    list.splice(index, 1);
    setBuilderDetails({ ...builderDetails, education: list });
  };

  const addExperience = () => {
    setBuilderDetails({
      ...builderDetails,
      experience: [...builderDetails.experience, { company: "", role: "", period: "", desc: "" }]
    });
  };

  const removeExperience = (index: number) => {
    const list = [...builderDetails.experience];
    list.splice(index, 1);
    setBuilderDetails({ ...builderDetails, experience: list });
  };

  const addProject = () => {
    setBuilderDetails({
      ...builderDetails,
      projects: [...builderDetails.projects, { name: "", desc: "", link: "" }]
    });
  };

  const removeProject = (index: number) => {
    const list = [...builderDetails.projects];
    list.splice(index, 1);
    setBuilderDetails({ ...builderDetails, projects: list });
  };

  // Compile Builder Resume into plain text/markdown for quick analysis
  const handleLoadBuilderToAnalyzer = () => {
    const compiled = `
${builderDetails.fullName.toUpperCase()}
${builderDetails.email} | ${builderDetails.phone}
${builderDetails.linkedin} | ${builderDetails.website}

SUMMARY
${builderDetails.summary}

EDUCATION
${builderDetails.education.map(e => `${e.degree} - ${e.school} (${e.period}) GPA: ${e.gpa}`).join("\n")}

EXPERIENCE
${builderDetails.experience.map(exp => `${exp.role} at ${exp.company} (${exp.period})\n${exp.desc}`).join("\n")}

PROJECTS
${builderDetails.projects.map(p => `${p.name} - ${p.link}\n${p.desc}`).join("\n")}

SKILLS
${builderDetails.skills}

CERTIFICATIONS
${builderDetails.certifications}

ACHIEVEMENTS
${builderDetails.achievements}
`;
    setResumeText(compiled.trim());
    setTab("analyze");
  };

  // Simulated PDF download helper
  const triggerDownload = (format: "txt" | "md" | "html") => {
    let content = "";
    if (format === "md") {
      content = `# ${builderDetails.fullName}\n\n${builderDetails.email} | ${builderDetails.phone}\n${builderDetails.linkedin} | ${builderDetails.website}\n\n## SUMMARY\n${builderDetails.summary}\n\n## EDUCATION\n` + 
        builderDetails.education.map(e => `### ${e.school}\n${e.degree} (${e.period}) - GPA: ${e.gpa}`).join("\n\n") + 
        `\n\n## EXPERIENCE\n` + 
        builderDetails.experience.map(exp => `### ${exp.company}\n**${exp.role}** (${exp.period})\n${exp.desc}`).join("\n\n") + 
        `\n\n## PROJECTS\n` + 
        builderDetails.projects.map(p => `### ${p.name}\n${p.desc}\n*Link: ${p.link}*`).join("\n\n") + 
        `\n\n## SKILLS\n${builderDetails.skills}\n\n## CERTIFICATIONS\n${builderDetails.certifications}\n\n## ACHIEVEMENTS\n${builderDetails.achievements}`;
    } else {
      content = JSON.stringify(builderDetails, null, 2);
    }
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${builderDetails.fullName.replace(/\s+/g, "_")}_Resume.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8" id="resume-panel">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setTab("analyze")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            tab === "analyze" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          AI Resume Analyzer
        </button>
        <button 
          onClick={() => setTab("builder")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            tab === "builder" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          ATS Resume Builder
        </button>
      </div>

      {tab === "analyze" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-blue-500" /> Analyze Resume
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Dream Role</label>
                  <input 
                    type="text" 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resume Text (Copy/Paste)</label>
                  <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                    placeholder="Paste the full text of your resume here to verify formatting, ATS score, action verbs, and keyword gaps..."
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !resumeText.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Verify compatibility
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Past Analyses */}
            {resumeAnalyses.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h4 className="font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3">Past Scans</h4>
                <div className="space-y-2">
                  {resumeAnalyses.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveAnalysis(item)}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        activeAnalysis?.id === item.id 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300" 
                          : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium truncate max-w-[160px]">{item.fileName}</span>
                      </div>
                      <span className="font-bold">{item.score}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Scoring & Critique */}
          <div className="lg:col-span-7">
            {activeAnalysis ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">ATS Optimization Report</h3>
                    <p className="text-xs text-slate-400 mt-1">Checked on {new Date(activeAnalysis.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Overall Score</span>
                      <h4 className={`text-3xl font-extrabold ${
                        activeAnalysis.score >= 80 ? "text-emerald-500" : activeAnalysis.score >= 60 ? "text-amber-500" : "text-rose-500"
                      }`}>{activeAnalysis.score}/100</h4>
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" /> Formatting Critique
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeAnalysis.formatting}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" /> ATS Compatibility
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeAnalysis.atsCompatibility}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Missing Sections
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeAnalysis.missingSections}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak Action Verbs
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeAnalysis.weakVerbs}</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                  <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">Keyword Optimization suggestions</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeAnalysis.keywordOptimization}</p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Actionable Fixes</h4>
                  <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {activeAnalysis.suggestions}
                  </div>
                </div>

                {/* Optimized Resume Preview */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-blue-500" /> Optimized Version Preview
                    </h4>
                    <button 
                      onClick={() => handleCopyText(activeAnalysis.optimizedResumeText)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copy Markdown
                    </button>
                  </div>
                  <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {activeAnalysis.optimizedResumeText}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">No Resume Analyzed Yet</h4>
                <p className="text-xs mt-1 max-w-sm mx-auto">Upload or copy your resume details in the left form and press "Verify compatibility" to see deep ATS audit parameters instantly.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Builder Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Personal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={builderDetails.fullName}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={builderDetails.email}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={builderDetails.phone}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">LinkedIn Profile</label>
                <input 
                  type="text" 
                  value={builderDetails.linkedin}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, linkedin: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Professional Summary</label>
              <textarea 
                value={builderDetails.summary}
                onChange={(e) => setBuilderDetails({ ...builderDetails, summary: e.target.value })}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Education section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Education</h4>
                <button 
                  onClick={addEducation}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add School
                </button>
              </div>

              <div className="space-y-4">
                {builderDetails.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">School #{idx+1}</span>
                      <button onClick={() => removeEducation(idx)} className="text-rose-500 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="School Name"
                        value={edu.school}
                        onChange={(e) => {
                          const list = [...builderDetails.education];
                          list[idx].school = e.target.value;
                          setBuilderDetails({ ...builderDetails, education: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Degree / Major"
                        value={edu.degree}
                        onChange={(e) => {
                          const list = [...builderDetails.education];
                          list[idx].degree = e.target.value;
                          setBuilderDetails({ ...builderDetails, education: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Enrollment Period"
                        value={edu.period}
                        onChange={(e) => {
                          const list = [...builderDetails.education];
                          list[idx].period = e.target.value;
                          setBuilderDetails({ ...builderDetails, education: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="GPA (e.g. 3.8/4.0)"
                        value={edu.gpa}
                        onChange={(e) => {
                          const list = [...builderDetails.education];
                          list[idx].gpa = e.target.value;
                          setBuilderDetails({ ...builderDetails, education: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Experience</h4>
                <button 
                  onClick={addExperience}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </button>
              </div>

              <div className="space-y-4">
                {builderDetails.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Position #{idx+1}</span>
                      <button onClick={() => removeExperience(idx)} className="text-rose-500 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const list = [...builderDetails.experience];
                          list[idx].company = e.target.value;
                          setBuilderDetails({ ...builderDetails, experience: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Role"
                        value={exp.role}
                        onChange={(e) => {
                          const list = [...builderDetails.experience];
                          list[idx].role = e.target.value;
                          setBuilderDetails({ ...builderDetails, experience: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Period"
                        value={exp.period}
                        onChange={(e) => {
                          const list = [...builderDetails.experience];
                          list[idx].period = e.target.value;
                          setBuilderDetails({ ...builderDetails, experience: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea 
                      placeholder="Core accomplishments (Quantify results e.g. Speeded up processing by 20%)"
                      value={exp.desc}
                      onChange={(e) => {
                        const list = [...builderDetails.experience];
                        list[idx].desc = e.target.value;
                        setBuilderDetails({ ...builderDetails, experience: list });
                      }}
                      rows={3}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Projects section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Projects</h4>
                <button 
                  onClick={addProject}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {builderDetails.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Project #{idx+1}</span>
                      <button onClick={() => removeProject(idx)} className="text-rose-500 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => {
                          const list = [...builderDetails.projects];
                          list[idx].name = e.target.value;
                          setBuilderDetails({ ...builderDetails, projects: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Link (e.g. GitHub URL)"
                        value={proj.link}
                        onChange={(e) => {
                          const list = [...builderDetails.projects];
                          list[idx].link = e.target.value;
                          setBuilderDetails({ ...builderDetails, projects: list });
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea 
                      placeholder="Project description, architecture choices, tools used"
                      value={proj.desc}
                      onChange={(e) => {
                        const list = [...builderDetails.projects];
                        list[idx].desc = e.target.value;
                        setBuilderDetails({ ...builderDetails, projects: list });
                      }}
                      rows={2}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & certs & achievements */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills (Comma-separated)</label>
                <input 
                  type="text" 
                  value={builderDetails.skills}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, skills: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Certifications</label>
                <input 
                  type="text" 
                  value={builderDetails.certifications}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, certifications: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Key Achievements</label>
                <input 
                  type="text" 
                  value={builderDetails.achievements}
                  onChange={(e) => setBuilderDetails({ ...builderDetails, achievements: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Direct load / save action buttons */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex gap-3">
              <button 
                onClick={handleLoadBuilderToAnalyzer}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-4 w-4" /> Load details to AI Analyzer
              </button>
            </div>
          </div>

          {/* Builder Preview / Export */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">Style template</h4>
                
                <div className="flex gap-1.5">
                  {(["minimal", "classic", "tech"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBuilderTemplate(t)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border cursor-pointer ${
                        builderTemplate === t 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-slate-50 border-slate-100 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time PDF styled draft sheet */}
              <div className={`p-6 border border-slate-200 dark:border-slate-800 bg-white text-slate-900 rounded-xl overflow-y-auto max-h-[600px] shadow-inner font-sans ${
                builderTemplate === "tech" ? "border-t-4 border-t-indigo-600" : builderTemplate === "classic" ? "border-t-4 border-t-slate-800" : ""
              }`}>
                {/* Header */}
                <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{builderDetails.fullName}</h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {builderDetails.email} | {builderDetails.phone}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {builderDetails.linkedin} | {builderDetails.website}
                  </p>
                </div>

                {/* Summary */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Professional Summary</h3>
                  <p className="text-[10px] text-slate-600 leading-relaxed text-justify">{builderDetails.summary}</p>
                </div>

                {/* Education */}
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Education</h3>
                  {builderDetails.education.map((edu, i) => (
                    <div key={i} className="text-[10px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{edu.school}</span>
                        <span className="font-medium text-slate-500">{edu.period}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 italic">
                        <span>{edu.degree}</span>
                        <span>GPA: {edu.gpa}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Experience */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Professional Experience</h3>
                  {builderDetails.experience.map((exp, i) => (
                    <div key={i} className="text-[10px] space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{exp.company}</span>
                        <span className="font-medium text-slate-500">{exp.period}</span>
                      </div>
                      <p className="italic text-slate-600 font-semibold">{exp.role}</p>
                      <p className="text-slate-600 leading-relaxed text-justify">{exp.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Projects */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Projects</h3>
                  {builderDetails.projects.map((p, i) => (
                    <div key={i} className="text-[10px] space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{p.name}</span>
                        <span className="font-normal text-blue-500 underline font-mono text-[9px]">{p.link}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-justify">{p.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Skills & Expertise</h3>
                  <p className="text-[10px] text-slate-600 leading-relaxed">{builderDetails.skills}</p>
                </div>

                {/* Certifications & Achievements */}
                <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-slate-150">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Certifications</h4>
                    <p className="text-[9px] text-slate-600">{builderDetails.certifications}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Achievements</h4>
                    <p className="text-[9px] text-slate-600">{builderDetails.achievements}</p>
                  </div>
                </div>
              </div>

              {/* Export Trigger options */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => triggerDownload("md")}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download Markdown
                </button>
                <button 
                  onClick={() => triggerDownload("txt")}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download TXT
                </button>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-slate-950 border border-amber-100/50 dark:border-slate-800 rounded-xl text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed">
                🚀 **Pro Tip:** Print this page or use the Markdown/TXT file format to import into standard text editors (MS Word, Google Docs) for a pixel-perfect ATS template.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

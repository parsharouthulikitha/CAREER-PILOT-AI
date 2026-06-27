export interface UserProfile {
  userId?: string;
  uid?: string;
  email: string;
  displayName: string;
  photoUrl: string;
  education: string;
  experience: string;
  skills: string;
  dreamCompany: string;
  dreamRole: string;
  careerGoals: string;
  streak: number;
  points: number;
  level: number;
  isAdmin?: boolean;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  idealAnswer: string;
  userAnswer?: string;
  feedback?: string;
  confidenceScore?: number;
  clarityScore?: number;
  correctnessScore?: number;
  suggestedAnswer?: string;
  starMethodEvaluation?: string;
}

export interface MockInterviewSession {
  id: string;
  role: string;
  mode: "Beginner" | "Intermediate" | "Expert";
  type: "Technical" | "Behavioral" | "HR" | "Situational";
  status: "active" | "completed";
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  overallScore?: number;
  strengths?: string;
  weaknesses?: string;
  improvements?: string;
  createdAt: string;
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  score: number;
  formatting: string;
  atsCompatibility: string;
  grammar: string;
  missingSections: string;
  weakVerbs: string;
  keywordOptimization: string;
  suggestions: string;
  optimizedResumeText: string;
  createdAt: string;
}

export interface LearningRoadmapStep {
  level: string;
  focus: string;
  topics: string[];
  projects: string[];
  certifications: string[];
  practiceSchedule: string;
}

export interface GeneratedRoadmap {
  id: string;
  title: string;
  timeline: string;
  steps: LearningRoadmapStep[];
  createdAt: string;
}

export interface CoverLetterRecord {
  id: string;
  company: string;
  jobDescription: string;
  generatedText: string;
  createdAt: string;
}

export interface JobMatchResult {
  id: string;
  jobTitle: string;
  company: string;
  matchPercentage: number;
  missingKeywords: string[];
  missingSkills: string[];
  suggestions: string[];
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  createdAt: string;
}

export interface SkillGapResult {
  matchingSkills: string[];
  missingSkills: string[];
  learningRoadmap: { phase: string; timeline: string; focus: string }[];
  estimatedCompletion: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  starterCode: { [key: string]: string };
  testCases: { input: string; output: string }[];
}

export interface PersonalityAssessmentQuestion {
  id: number;
  question: string;
  options: { value: string; label: string }[];
}

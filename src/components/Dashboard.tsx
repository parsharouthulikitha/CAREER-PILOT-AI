import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Video, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Zap,
  Target
} from "lucide-react";
import { UserProfile, MockInterviewSession, ResumeAnalysis } from "../types";
import { getApiUrl } from "../lib/api";

interface DashboardProps {
  userProfile: UserProfile;
  interviews: MockInterviewSession[];
  resumes: ResumeAnalysis[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ userProfile, interviews, resumes, onNavigate }: DashboardProps) {
  const [tip, setTip] = useState<string>("Tailor your resume for every role by matching active keywords from the job description.");
  const [loadingTip, setLoadingTip] = useState(false);

  // Compute stats
  const latestInterview = interviews[0];
  const interviewReadiness = latestInterview ? latestInterview.overallScore || 0 : 45;
  const latestResume = resumes[0];
  const resumeScore = latestResume ? latestResume.score || 0 : 55;

  // Compute skill coverage based on user's skills length or standard values
  const skillsCount = userProfile.skills ? userProfile.skills.split(",").length : 0;
  const skillsScore = Math.min(40 + skillsCount * 8, 95);

  const dailyGoals = [
    { id: 1, text: "Analyze resume with ATS optimization", done: resumes.length > 0 },
    { id: 2, text: "Practice 1 AI mock interview round", done: interviews.length > 0 },
    { id: 3, text: "Read today's career challenge tip", done: true },
  ];

  const badges = [
    { name: "Early Adopter", desc: "Joined CareerPilot Beta", icon: Sparkles, color: "from-blue-500 to-indigo-500", active: true },
    { name: "First Draft", desc: "Analyzed your first resume", icon: FileText, color: "from-purple-500 to-pink-500", active: resumes.length > 0 },
    { name: "Under Fire", desc: "Completed a mock interview", icon: Video, color: "from-amber-500 to-orange-500", active: interviews.length > 0 },
    { name: "Streak Master", desc: "Maintain 3-day streak", icon: Flame, color: "from-red-500 to-yellow-500", active: userProfile.streak >= 3 },
  ];

  const fetchDailyTip = async () => {
    setLoadingTip(true);
    const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";
    try {
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/career-coach"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { sender: "user", text: "Give me one direct, highly actionable 2-sentence tip for standing out in technical or behavioral interviews today." }
          ]
        })
      });
      const data = await res.json();
      if (data.text) {
        setTip(data.text);
      }
    } catch (e) {
      console.warn("Fetching daily career tip via client-side offline fallback:", e);
      const fallbackTips = [
        "In technical coding, describe your brute-force algorithm first to show dynamic analytical thinking, then optimize the time complexity.",
        "Always research the exact tech stack of your target firm using LinkedIn profiles of their current engineers before you enter the interview room.",
        "In behavioral responses, dedicate at least 40% of your time to explaining the concrete quantifiable results of your actions.",
        "Include active, powerful verbs like 'Spearheaded' or 'Automated' instead of passive ones like 'Responsible for' on your resume ATS bulking."
      ];
      setTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
    } finally {
      setLoadingTip(false);
    }
  };

  useEffect(() => {
    fetchDailyTip();
  }, []);

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 backdrop-blur-xl border border-white/10 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-purple-200 border border-white/5">
              <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" /> Ready to soar higher
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-sans tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Welcome back, {userProfile.displayName || "Pilot"}!
            </h1>
            <p className="text-slate-300 max-w-xl text-xs md:text-sm">
              Your target role is <span className="font-semibold text-white underline decoration-purple-400 decoration-2">{userProfile.dreamRole || "Software Engineer"}</span> at <span className="font-semibold text-white">{userProfile.dreamCompany || "Target Company"}</span>. Let's practice and land that offer!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="text-center px-2 border-r border-white/10">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-2xl">
                <Flame className="h-6 w-6 fill-current" />
                <span>{userProfile.streak}</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Day Streak</p>
            </div>
            <div className="text-center px-2 border-r border-white/10">
              <div className="text-purple-300 font-bold text-2xl">
                <span>{userProfile.points}</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">XP Points</p>
            </div>
            <div className="text-center px-2">
              <div className="text-blue-300 font-bold text-2xl">
                <span>Lvl {userProfile.level}</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Pilot Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="score-overview-grid">
        {/* Card 1 */}
        <div className="relative glass-panel rounded-3xl p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Interview Readiness</span>
              <span className="bg-white/5 border border-white/10 text-blue-300 rounded-xl p-2.5">
                <Video className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{interviewReadiness}%</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +8%
              </span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${interviewReadiness}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">Based on your recent mock interview responses and grading details.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <button 
              onClick={() => onNavigate("mock-interview")} 
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              Start Mock Interview <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative glass-panel rounded-3xl p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">ATS Resume Rating</span>
              <span className="bg-white/5 border border-white/10 text-purple-300 rounded-xl p-2.5">
                <FileText className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{resumeScore}%</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> New Scan
              </span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${resumeScore}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">ATS compatibility, syntax structure, strong verbs, and keyword alignment score.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <button 
              onClick={() => onNavigate("resume")} 
              className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
            >
              Optimize Resume <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative glass-panel rounded-3xl p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Skills Alignment Score</span>
              <span className="bg-white/5 border border-white/10 text-teal-300 rounded-xl p-2.5">
                <Layers className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{skillsScore}%</span>
              <span className="text-xs text-indigo-300 font-medium">{skillsCount} verified</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full rounded-full" style={{ width: `${skillsScore}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">Targeting your matching skills versus industry criteria for {userProfile.dreamRole || "Software Engineer"}.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <button 
              onClick={() => onNavigate("gaps")} 
              className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer"
            >
              Analyze Skill Gaps <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge & Weekly Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Challenge & AI Career Tip */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 text-white rounded-xl p-2.5 shadow-md shadow-indigo-500/10">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">Daily AI Career Strategy</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Fresh daily tip powered by CareerPilot AI</p>
                </div>
              </div>
              <button 
                onClick={fetchDailyTip}
                disabled={loadingTip}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer disabled:opacity-50 px-3 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                {loadingTip ? "Regenerating..." : "Ask Gemini For Tip"}
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute top-[-10px] left-0 text-indigo-500/30 text-5xl font-serif">“</div>
              <p className="text-slate-200 pl-6 text-sm leading-relaxed italic font-medium">
                {tip}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate("coach")}
              className="glass-button-primary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" /> Ask Career Coach Chat
            </button>
            <button 
              onClick={() => onNavigate("assessments")}
              className="glass-button-secondary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              AI Personality Assessment
            </button>
          </div>
        </div>

        {/* Goals Checklist */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Target className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Today's Focus Target</h3>
            </div>
            
            <div className="space-y-4">
              {dailyGoals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {goal.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-400/10" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-white/20"></div>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs ${goal.done ? "line-through text-slate-500" : "text-slate-200"} font-semibold leading-relaxed`}>
                      {goal.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-amber-400 animate-bounce" />
                <div>
                  <p className="text-xs font-extrabold text-white">Weekly Achievement</p>
                  <p className="text-[9px] text-slate-400">Complete all goals to score +150 XP</p>
                </div>
              </div>
              <span className="text-xs bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-slate-200 font-bold font-mono">2/3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Gamification Badges */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm">
          <Award className="h-5 w-5 text-amber-400" /> Pilot Achievement Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="badges-grid">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx} 
                className={`relative rounded-2xl p-4 text-center border transition-all duration-300 ${
                  badge.active 
                    ? "bg-white/5 border-white/10 hover:bg-white/10" 
                    : "bg-white/[0.02] border-dashed border-white/5 opacity-40"
                }`}
              >
                <div className={`mx-auto mb-3 h-10 w-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white shadow-md shadow-black/10`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-xs text-white">{badge.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">{badge.desc}</p>
                {badge.active && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Target, 
  Building, 
  ChevronRight, 
  CheckCircle, 
  BookOpen, 
  Calendar,
  Layers,
  RefreshCw
} from "lucide-react";
import { SkillGapResult, UserProfile } from "../types";
import { getApiUrl } from "../lib/api";

interface SkillGapProps {
  userProfile: UserProfile;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function SkillGap({ userProfile, showToast }: SkillGapProps) {
  const [dreamCompany, setDreamCompany] = useState(userProfile.dreamCompany || "Google");
  const [dreamRole, setDreamRole] = useState(userProfile.dreamRole || "Software Engineer");
  const [currentSkills, setCurrentSkills] = useState(userProfile.skills || "JavaScript, React, Python");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gapResult, setGapResult] = useState<SkillGapResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";

    try {
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/skill-gap-analysis"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSkills, dreamCompany, dreamRole })
      });
      const data = await res.json();
      setGapResult(data);
    } catch (e: any) {
      console.warn("Analyzing skills matrix via client-side offline fallback:", e);
      if (e?.message !== "offline_triggered") {
        showToast?.("Backend server offline. Running matrix analysis in offline simulation mode.", "info");
      }

      // Predefined gaps based on dreamCompany and dreamRole
      const cleanCompany = dreamCompany || "Target Tech Firm";
      const cleanRole = dreamRole || "Senior Developer";

      const fallbackResult: SkillGapResult = {
        matchingSkills: (currentSkills ? currentSkills.split(",") : ["JavaScript", "React"]).map(s => s.trim()),
        missingSkills: ["Advanced System Design", "Cloud Native (AWS/GCP)", "CI/CD Pipelines", "Containerization (Docker)", "Distributed Caching (Redis)"],
        learningRoadmap: [
          { phase: "Phase 1: Deep Core Systems", timeline: "Weeks 1-4", focus: `Master Scalability and Advanced Architecture for ${cleanRole} at ${cleanCompany}` },
          { phase: "Phase 2: Docker & Automation", timeline: "Weeks 5-8", focus: "Automate packaging and delivery configurations using Docker containers and CD setups" },
          { phase: "Phase 3: Redis & Performance", timeline: "Weeks 9-12", focus: "Integrate distributed memory structures like Redis to decrease response and load delays" }
        ],
        estimatedCompletion: "3 Months (approx. 10 hours per week)"
      };

      setGapResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="skill-gap-panel">
      {/* Parameters Form */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Target className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Target Skill Gap Analyzer</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dream Target Company</label>
            <input 
              type="text" 
              value={dreamCompany}
              onChange={(e) => setDreamCompany(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              placeholder="e.g. Netflix, Stripe, Google"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dream Job Title / Role</label>
            <input 
              type="text" 
              value={dreamRole}
              onChange={(e) => setDreamRole(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              placeholder="e.g. AI Engineer, Product Manager"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your Current Skills (Comma-separated)</label>
            <textarea 
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              placeholder="JavaScript, React, Tailwind, SQL, Python"
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !dreamRole || !dreamCompany}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Comparing Skills Matrix...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Compare Skill Gaps
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Deck */}
      <div className="lg:col-span-7">
        {gapResult ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Skills Gap Report</h3>
                <p className="text-xs text-slate-400">Targeting {gapResult.estimatedCompletion} study schedule</p>
              </div>
              <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl px-3 py-1 font-bold text-xs">AI Compared</span>
            </div>

            {/* Matching skills vs Missing skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-4 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Validated Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {gapResult.matchingSkills.map((s, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-rose-50/40 dark:bg-rose-950/10 p-4 border border-rose-100/50 dark:border-rose-900/30 rounded-xl">
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Layers className="h-4 w-4" /> Gaps & Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {gapResult.missingSkills.map((s, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 text-[10px] text-rose-600 dark:text-rose-400 font-bold px-2.5 py-1 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1">
                <Calendar className="h-4.5 w-4.5 text-blue-500" /> Milestone Learning Plan
              </h4>

              <div className="relative border-l border-indigo-100 dark:border-slate-800 pl-4 space-y-6">
                {gapResult.learningRoadmap.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Node */}
                    <div className="absolute top-1.5 -left-[22.5px] h-3.5 w-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900"></div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{step.phase}</span>
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] px-1.5 py-0.5 rounded">
                          {step.timeline}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Estimated Completion Period</span>
              <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-1">{gapResult.estimatedCompletion}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm text-slate-400">
            <Layers className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Run Skills Gap Analysis</h4>
            <p className="text-xs mt-1 max-w-sm mx-auto">Input your dream target company, dream role, and current skills list to view high-priority missing items and structured study milestones.</p>
          </div>
        )}
      </div>

    </div>
  );
}

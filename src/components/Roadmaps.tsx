import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Map, 
  Check, 
  Plus, 
  Layers, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { GeneratedRoadmap, UserProfile, LearningRoadmapStep } from "../types";
import { getApiUrl } from "../lib/api";

interface RoadmapsProps {
  userProfile: UserProfile;
  roadmaps: GeneratedRoadmap[];
  onSaveRoadmap: (roadmap: GeneratedRoadmap) => void;
  onAddPoints: (points: number) => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function Roadmaps({ userProfile, roadmaps, onSaveRoadmap, onAddPoints, showToast }: RoadmapsProps) {
  const [selectedTrack, setSelectedTrack] = useState("Full Stack Development");
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track standard available structures
  const standardTracks = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Data Science & Analytics",
    "AI/ML Engineering",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps Engineering",
    "UI/UX Design"
  ];

  // Active roadmap on focus
  const [activeRoadmap, setActiveRoadmap] = useState<GeneratedRoadmap | null>(roadmaps[0] || null);
  const [checkedSteps, setCheckedSteps] = useState<{ [key: string]: boolean }>({});

  const handleGenerateRoadmap = async (trackName: string) => {
    setIsGenerating(true);
    const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";

    try {
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/career-roadmap"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trackName })
      });
      const data = await res.json();
      
      const newRoadmap: GeneratedRoadmap = {
        id: "rd_" + Date.now(),
        title: data.title || `${trackName} Roadmap`,
        timeline: data.timeline || "6 Months",
        steps: data.steps || [],
        createdAt: new Date().toISOString()
      };

      onSaveRoadmap(newRoadmap);
      setActiveRoadmap(newRoadmap);
      onAddPoints(50); // XP Reward

    } catch (e: any) {
      console.warn("Generating roadmap via client-side offline fallback:", e);
      if (e?.message !== "offline_triggered") {
        showToast?.("Backend server offline. Generating learning plan in offline simulation mode.", "info");
      }

      // Predefined steps based on track
      let roadmapSteps: LearningRoadmapStep[] = [
        {
          level: "Month 1: Fundamentals & Tooling",
          focus: `Build core competencies in ${trackName} environments.`,
          topics: [
            "Official documentation review",
            "Structured linting and formatting setups",
            "Lightweight proof-of-concept components"
          ],
          projects: [
            "Modular UI Component Playground",
            "Responsive Interactive Cards"
          ],
          certifications: [
            `${trackName} Foundations Certification`
          ],
          practiceSchedule: "3 hours per day, focusing on error isolation and unit tests."
        },
        {
          level: "Month 2: High Level Implementations",
          focus: "Tackle medium-to-complex application logic and custom integrations.",
          topics: [
            "Modular state management systems",
            "Interactive dashboard rendering",
            "Third-party RESTful integrations"
          ],
          projects: [
            "Analytical Performance Dashboard",
            "E-commerce product grids"
          ],
          certifications: [
            `Certified ${trackName} Specialist`
          ],
          practiceSchedule: "4 hours per day, focusing on custom hooks and async request caching."
        },
        {
          level: "Month 3: Performance, Scaling & Delivery",
          focus: "Deploy to production platforms, optimize asset delivery, and polish security structures.",
          topics: [
            "Load testing and render optimization",
            "Docker workspace configurations",
            "CI/CD release workflows"
          ],
          projects: [
            "Enterprise-scale distributed application build",
            "Custom static site generator"
          ],
          certifications: [
            `Professional ${trackName} Deployment Associate`
          ],
          practiceSchedule: "2 hours per day, focusing on security audits and bundle size optimization."
        }
      ];

      const newRoadmap: GeneratedRoadmap = {
        id: "rd_" + Date.now(),
        title: `${trackName} Mastery Plan`,
        timeline: "3 Months",
        steps: roadmapSteps,
        createdAt: new Date().toISOString()
      };

      onSaveRoadmap(newRoadmap);
      setActiveRoadmap(newRoadmap);
      onAddPoints(50);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStep = (key: string) => {
    const isChecked = !checkedSteps[key];
    setCheckedSteps({ ...checkedSteps, [key]: isChecked });
    if (isChecked) {
      onAddPoints(15); // Small completion point reward
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="roadmaps-panel">
      {/* Track Selector & Generators */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Map className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Learning Plans</h3>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {standardTracks.map((track) => (
              <button
                key={track}
                onClick={() => {
                  setSelectedTrack(track);
                  handleGenerateRoadmap(track);
                }}
                disabled={isGenerating}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold block transition-all cursor-pointer ${
                  selectedTrack === track 
                    ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 text-indigo-700 dark:text-indigo-300" 
                    : "bg-slate-50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          {/* Custom generation form */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Or Build Custom Track</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Kotlin Android development"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (customTopic.trim()) {
                    setSelectedTrack(customTopic);
                    handleGenerateRoadmap(customTopic);
                    setCustomTopic("");
                  }
                }}
                disabled={isGenerating || !customTopic.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Generated Roadmap logs */}
        {roadmaps.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Saved Roadmaps</h4>
            <div className="space-y-2">
              {roadmaps.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveRoadmap(item)}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition-all cursor-pointer ${
                    activeRoadmap?.id === item.id 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 font-bold" 
                      : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="truncate max-w-[180px]">{item.title}</span>
                  <span className="font-mono text-[9px] text-slate-400">{item.timeline}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Roadmap Tree Render */}
      <div className="lg:col-span-8">
        {isGenerating ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-24 text-center shadow-sm text-slate-400 h-full flex flex-col justify-center items-center">
            <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Formulating Learning Roadmap...</h4>
            <p className="text-xs mt-1 max-w-sm">Generating 3-tier modules, specific projects, and recommended industry certifications.</p>
          </div>
        ) : activeRoadmap ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-indigo-500 font-bold uppercase tracking-widest mb-1">
                <Sparkles className="h-3 w-3" /> CareerPilot Custom Blueprint
              </span>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg">{activeRoadmap.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Estimated Duration: {activeRoadmap.timeline}</p>
            </div>

            {/* Stages Grid (Beginner, Intermediate, Advanced) */}
            <div className="space-y-6">
              {activeRoadmap.steps.map((step, index) => (
                <div key={index} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider ${
                        step.level === "Beginner" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                        step.level === "Intermediate" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400" :
                        "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400"
                      }`}>{step.level}</span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">{step.focus}</h4>
                    </div>
                  </div>

                  {/* Topics List with Interactive Checkbox checklist */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syllabus Checkpoint</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.topics.map((topic, tIdx) => {
                        const stepKey = `${activeRoadmap.id}_${index}_${tIdx}`;
                        const isChecked = !!checkedSteps[stepKey];
                        return (
                          <div 
                            key={tIdx} 
                            onClick={() => handleToggleStep(stepKey)}
                            className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer transition-all ${
                              isChecked 
                                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900 text-slate-500 line-through" 
                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="mt-0.5">
                              {isChecked ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                              ) : (
                                <div className="h-4.5 w-4.5 rounded-full border border-slate-300 dark:border-slate-700"></div>
                              )}
                            </div>
                            <span className="text-xs leading-relaxed font-medium">{topic}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Projects and Certs info rows */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="space-y-1.5">
                      <h5 className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Milestone Projects</h5>
                      <ul className="list-disc pl-4 space-y-1 text-slate-500">
                        {step.projects.map((proj, pIdx) => (
                          <li key={pIdx} className="leading-relaxed">{proj}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <h5 className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Certifications to Target</h5>
                      <ul className="list-disc pl-4 space-y-1 text-slate-500">
                        {step.certifications.map((cert, cIdx) => (
                          <li key={cIdx} className="leading-relaxed">{cert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] text-slate-400 italic">
                      🎯 **Practice Schedule:** {step.practiceSchedule}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm text-slate-400">
            <Map className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Select Track to View Roadmap</h4>
            <p className="text-xs mt-1 max-w-sm mx-auto">Choose one of the standard career tracks on the left or type your custom topic to generate a detailed 3-tier study syllabus, projects, and schedules instantly.</p>
          </div>
        )}
      </div>

    </div>
  );
}

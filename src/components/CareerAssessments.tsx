import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  RefreshCw,
  Zap,
  CheckCircle
} from "lucide-react";
import { UserProfile } from "../types";
import { getApiUrl } from "../lib/api";

interface CareerAssessmentsProps {
  userProfile: UserProfile;
  onAddPoints: (points: number) => void;
}

export default function CareerAssessments({ userProfile, onAddPoints }: CareerAssessmentsProps) {
  // Assessment Questionnaire state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  // Salary Predictor inputs
  const [salaryRole, setSalaryRole] = useState(userProfile.dreamRole || "Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-level (2-5 yrs)");
  const [locationRegion, setLocationRegion] = useState("San Francisco Bay Area");
  const [isPredictingSalary, setIsPredictingSalary] = useState(false);
  const [predictedSalary, setPredictedSalary] = useState<any>(null);

  const questions = [
    {
      q: "What describes your problem-solving style?",
      options: [
        "Analyzing technical details, performance benchmarks, and complex math code",
        "Structuring products, analyzing customer loops, and managing roadmap priorities",
        "Designing polished interfaces, drawing wireframes, and managing visual themes",
        "Configuring security systems, deploying servers, and testing penetration vectors"
      ]
    },
    {
      q: "Which team dynamic do you thrive in?",
      options: [
        "Collaborative brainstorms, leading product workshops",
        "Solo focused execution, diving deep into technical modules",
        "Mentoring juniors, optimizing team deployment structures",
        "Presenting analytics, drawing reports, communicating to executives"
      ]
    },
    {
      q: "What type of technical artifacts excite you?",
      options: [
        "Highly complex compiler optimizations or database query structures",
        "Customer journey boards, Figma wireframes, and user interviews",
        "CI/CD deployment logs, Kubernetes orchestrations, and VPC configurations",
        "Predictive neural nets, custom embedding layers, and data cleaning scripts"
      ]
    }
  ];

  const handleSelectOption = (opt: string) => {
    const nextAnswers = [...answers, opt];
    setAnswers(nextAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Evaluate Assessment Results
      evaluateAssessment(nextAnswers);
    }
  };

  const evaluateAssessment = async (finalAnswers: string[]) => {
    setIsEvaluating(true);
    const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";
    try {
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/career-assessment/evaluate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, dreamRole: userProfile.dreamRole })
      });
      const data = await res.json();
      setAssessmentResult(data);
      onAddPoints(75); // Award dynamic points
    } catch (e) {
      console.warn("Evaluating assessment via client-side offline fallback:", e);
      // Mock result fallback
      setAssessmentResult({
        persona: "System Architect Visionary",
        summary: "You excel at deep architectural reasoning, optimization problems, and scalable system structures.",
        compatibleRoles: ["AI Infrastructure Engineer", "Database Specialist", "Technical Lead"],
        suggestedFocus: "Prioritize compilers, distributed consensus systems, and machine learning infrastructure models."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePredictSalary = async () => {
    setIsPredictingSalary(true);
    const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";
    try {
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/salary-predictor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: salaryRole, experience: experienceLevel, location: locationRegion })
      });
      const data = await res.json();
      setPredictedSalary(data);
    } catch (e) {
      console.warn("Predicting salary via client-side offline fallback:", e);
      setPredictedSalary({
        low: 120000,
        median: 145000,
        high: 185000,
        bonus: "10% - 15% annual bonus + RSU refreshers",
        growthIndex: "High (+12% YoY)"
      });
    } finally {
      setIsPredictingSalary(false);
    }
  };

  const handleResetAssessment = () => {
    setCurrentStep(0);
    setAnswers([]);
    setAssessmentResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="assessments-panel">
      {/* Career Persona Assessment Panel Left */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[500px]">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Career Persona Assessment</h3>
          </div>

          {isEvaluating ? (
            <div className="text-center py-20 space-y-4 font-mono text-xs text-slate-400">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
              <p>Evaluating compatibility vectors and persona parameters...</p>
            </div>
          ) : assessmentResult ? (
            /* RESULTS CARD */
            <div className="space-y-4 text-xs">
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-slate-850 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">Your Career Persona</span>
                <h4 className="text-lg font-black text-indigo-800 dark:text-indigo-300 mt-1">{assessmentResult.persona}</h4>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-[9px] mb-1">Aesthetic Profile</h5>
                <p className="text-slate-500 leading-relaxed leading-normal">{assessmentResult.summary}</p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-[9px] mb-1.5">Top Compatible Role Tracks</h5>
                <div className="flex flex-wrap gap-1.5">
                  {assessmentResult.compatibleRoles?.map((r: string, idx: number) => (
                    <span key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-[10px] font-medium text-slate-600">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-indigo-600 uppercase tracking-widest text-[9px] mb-1">Skill Recommendations</h5>
                <p className="text-slate-500 leading-relaxed">{assessmentResult.suggestedFocus}</p>
              </div>
            </div>
          ) : (
            /* ACTIVE QUESTION SELECTION */
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Question {currentStep + 1} of {questions.length}</span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base leading-relaxed">{questions[currentStep].q}</h4>
              </div>

              <div className="space-y-2">
                {questions[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 border border-slate-100 dark:border-slate-850 hover:border-indigo-100 dark:hover:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all cursor-pointer flex gap-3 items-start"
                  >
                    <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-5 w-5 rounded-md flex items-center justify-center font-mono text-[10px] text-slate-500 font-bold flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed mt-0.5">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {assessmentResult && (
          <button 
            onClick={handleResetAssessment}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
          >
            Retake Persona Assessment
          </button>
        )}
      </div>

      {/* Salary Predictor Panel Right */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[500px]">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Dynamic AI Salary Predictor</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
                <input 
                  type="text" 
                  value={salaryRole}
                  onChange={(e) => setSalaryRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Experience Tier</label>
                <select 
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Entry-level (0-2 yrs)">Entry-level (0-2 yrs)</option>
                  <option value="Mid-level (2-5 yrs)">Mid-level (2-5 yrs)</option>
                  <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                  <option value="Lead/Director (8+ yrs)">Lead/Director (8+ yrs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Location / Region</label>
              <select 
                value={locationRegion}
                onChange={(e) => setLocationRegion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="San Francisco Bay Area">San Francisco Bay Area</option>
                <option value="New York Metro Area">New York Metro Area</option>
                <option value="Seattle / Redmond">Seattle / Redmond</option>
                <option value="London Metro Area">London Metro Area</option>
                <option value="Bengaluru / India Hub">Bengaluru / India Hub</option>
                <option value="Remote Global Hub">Remote Global Hub</option>
              </select>
            </div>

            {/* Render Predicted details */}
            {predictedSalary && (
              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-slate-850 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Base Salary Range</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{predictedSalary.growthIndex} Growth</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded">
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">Low</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">${predictedSalary.low?.toLocaleString()}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-emerald-100 p-2 rounded">
                    <span className="text-[8px] font-mono text-emerald-600 block uppercase font-bold">Median</span>
                    <span className="font-black text-emerald-600">${predictedSalary.median?.toLocaleString()}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded">
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">High</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">${predictedSalary.high?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
                  📊 **Equity & Bonus Package:** {predictedSalary.bonus}
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handlePredictSalary}
          disabled={isPredictingSalary}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPredictingSalary ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin inline mr-1" />
              Scanning salary databases...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 inline mr-1" />
              Predict Market Base Salary
            </>
          )}
        </button>
      </div>

    </div>
  );
}

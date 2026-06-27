import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Download, 
  Layers, 
  RefreshCw,
  Mail,
  ArrowRight
} from "lucide-react";
import { JobMatchResult, UserProfile, CoverLetterRecord } from "../types";

interface JobMatchProps {
  userProfile: UserProfile;
  jobMatches: JobMatchResult[];
  onSaveJobMatch: (record: JobMatchResult) => void;
  onSaveCoverLetter: (record: CoverLetterRecord) => void;
}

export default function JobMatch({ userProfile, jobMatches, onSaveJobMatch, onSaveCoverLetter }: JobMatchProps) {
  // Input states
  const [jobTitle, setJobTitle] = useState(userProfile.dreamRole || "Software Engineer");
  const [company, setCompany] = useState(userProfile.dreamCompany || "Target Company");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState(userProfile.skills ? `Skills: ${userProfile.skills}\nEducation: ${userProfile.education}` : "");

  // Output states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeMatch, setActiveMatch] = useState<JobMatchResult | null>(jobMatches[0] || null);
  
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const handleAnalyzeJobMatch = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste the job description first!");
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription })
      });
      const data = await res.json();

      const newMatch: JobMatchResult = {
        id: "match_" + Date.now(),
        jobTitle,
        company,
        matchPercentage: data.matchPercentage || 70,
        missingKeywords: data.missingKeywords || [],
        missingSkills: data.missingSkills || [],
        suggestions: data.suggestions || [],
        createdAt: new Date().toISOString()
      };

      onSaveJobMatch(newMatch);
      setActiveMatch(newMatch);

    } catch (e) {
      console.error(e);
      alert("Error matching job description. Please verify connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, company, role: jobTitle })
      });
      const data = await res.json();
      setGeneratedLetter(data.text);

      const record: CoverLetterRecord = {
        id: "cl_" + Date.now(),
        company,
        jobDescription,
        generatedText: data.text,
        createdAt: new Date().toISOString()
      };
      onSaveCoverLetter(record);

    } catch (e) {
      console.error(e);
      alert("Error generating cover letter. Please try again.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="job-match-panel">
      
      {/* Input panel left */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
          <Mail className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Match & Cover Letter Builder</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Company</label>
              <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                placeholder="e.g. OpenAI"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                placeholder="e.g. PM, SDE"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Description (Paste)</label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              placeholder="Paste the full job description or requirements summary..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your Resume Details (Optional override)</label>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              placeholder="Provide simple highlights / skills to compare with target JD..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleAnalyzeJobMatch}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Analyze JD Match
                </>
              )}
            </button>

            <button 
              onClick={handleGenerateCoverLetter}
              disabled={isGeneratingCoverLetter || !jobDescription.trim()}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingCoverLetter ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Draft Cover Letter
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Deck right */}
      <div className="lg:col-span-7 space-y-6">
        {activeMatch ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Match Analysis for {activeMatch.company}</h3>
                <p className="text-xs text-slate-400">{activeMatch.jobTitle}</p>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Match Score</span>
                <span className="text-xl font-extrabold text-blue-600">{activeMatch.matchPercentage}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-50/40 dark:bg-rose-950/10 p-4 border border-rose-100/50 dark:border-rose-900/30 rounded-xl space-y-2">
                <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-1">
                  {activeMatch.missingKeywords.length === 0 ? (
                    <span className="text-slate-400 italic">No major keyword gaps!</span>
                  ) : (
                    activeMatch.missingKeywords.map((k, idx) => (
                      <span key={idx} className="bg-white dark:bg-slate-900 border border-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {k}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-amber-50/40 dark:bg-amber-950/10 p-4 border border-amber-100/50 dark:border-amber-900/30 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Missing Required Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {activeMatch.missingSkills.length === 0 ? (
                    <span className="text-slate-400 italic">Skills matrix completely aligned.</span>
                  ) : (
                    activeMatch.missingSkills.map((s, idx) => (
                      <span key={idx} className="bg-white dark:bg-slate-900 border border-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Resume Optimization checklist</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                {activeMatch.suggestions.map((s, idx) => (
                  <li key={idx} className="leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm text-slate-400">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-xs">Awaiting Match Comparison</h4>
            <p className="text-[10px] mt-1 max-w-xs mx-auto">Paste a target job description in the left panel to scan match metrics, missing keywords, and detailed bullet optimization tips.</p>
          </div>
        )}

        {/* Tailored Cover Letter output panel */}
        {(generatedLetter || isGeneratingCoverLetter) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" /> AI Drafted Cover Letter
              </h4>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCopyText(generatedLetter)}
                  disabled={!generatedLetter}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <Copy className="h-3 w-3" /> Copy Draft
                </button>
              </div>
            </div>

            {isGeneratingCoverLetter ? (
              <div className="p-12 text-center text-slate-400 space-y-3 font-mono text-xs">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                <p>Gemini is tailoring paragraphs around your accomplishments...</p>
              </div>
            ) : (
              <textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                rows={12}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-serif text-xs leading-relaxed focus:outline-none"
              />
            )}
          </div>
        )}
      </div>

    </div>
  );
}

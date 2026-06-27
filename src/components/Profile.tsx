import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  Target, 
  CheckCircle,
  Sparkles
} from "lucide-react";

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function Profile({ userProfile, onUpdateProfile, showToast }: ProfileProps) {
  const [displayName, setDisplayName] = useState(userProfile.displayName || "");
  const [education, setEducation] = useState(userProfile.education || "");
  const [experience, setExperience] = useState(userProfile.experience || "");
  const [skills, setSkills] = useState(userProfile.skills || "");
  const [dreamCompany, setDreamCompany] = useState(userProfile.dreamCompany || "");
  const [dreamRole, setDreamRole] = useState(userProfile.dreamRole || "");
  const [careerGoals, setCareerGoals] = useState(userProfile.careerGoals || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: UserProfile = {
        ...userProfile,
        displayName,
        education,
        experience,
        skills,
        dreamCompany,
        dreamRole,
        careerGoals
      };
      await onUpdateProfile(updated);
      showToast?.("Profile updated successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast?.("Error saving profile details.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm max-w-3xl mx-auto space-y-8" id="profile-settings-panel">
      <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-600 bg-slate-100">
          <img 
            src={userProfile.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
            alt="Profile Avatar"
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{userProfile.displayName || "Pilot Student"}</h2>
          <p className="text-xs text-slate-400">{userProfile.email}</p>
          <div className="flex gap-2 justify-center sm:justify-start mt-2">
            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
              Lvl {userProfile.level} Pilot
            </span>
            <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
              Streak: {userProfile.streak} days
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Display Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Education Background</label>
            <div className="relative">
              <input 
                type="text" 
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. BS Computer Science"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              />
              <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Experience Summary</label>
            <div className="relative">
              <input 
                type="text" 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 2 years as Frontend Analyst"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              />
              <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dream Target Company</label>
              <input 
                type="text" 
                value={dreamCompany}
                onChange={(e) => setDreamCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dream Role / Title</label>
              <input 
                type="text" 
                value={dreamRole}
                onChange={(e) => setDreamRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your Skills (Comma separated)</label>
            <textarea 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
              placeholder="e.g. JavaScript, Python, React, AWS"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Career Objectives & Future Goals</label>
        <textarea 
          value={careerGoals}
          onChange={(e) => setCareerGoals(e.target.value)}
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
          placeholder="Aiming to land a SDE position at Google to architect reliable systems..."
        />
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
        >
          {isSaving ? "Saving details..." : "Save Profile Details"}
        </button>
      </div>
    </div>
  );
}

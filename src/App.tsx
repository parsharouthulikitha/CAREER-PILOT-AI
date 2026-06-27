import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  Video, 
  MessageSquare, 
  Layers, 
  Map, 
  Mail, 
  History, 
  HelpCircle, 
  User, 
  Shield, 
  LogOut,
  Menu,
  X,
  Award,
  Zap,
  ChevronDown
} from "lucide-react";

// Import custom built components
import Dashboard from "./components/Dashboard";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import MockInterview from "./components/MockInterview";
import CareerCoach from "./components/CareerCoach";
import SkillGap from "./components/SkillGap";
import Roadmaps from "./components/Roadmaps";
import JobMatch from "./components/JobMatch";
import InterviewHistory from "./components/InterviewHistory";
import CareerAssessments from "./components/CareerAssessments";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import AuthScreen from "./components/AuthScreen";

import { 
  UserProfile, 
  MockInterviewSession, 
  ResumeAnalysis, 
  GeneratedRoadmap, 
  JobMatchResult, 
  CoverLetterRecord,
  CoachMessage 
} from "./types";

import {
  setGuestUserActive,
  getInterviews,
  getResumeAnalyses,
  getRoadmaps,
  getJobMatches,
  getCoverLetters,
  getCoachSessions,
  saveInterview,
  saveResumeAnalysis,
  saveRoadmap,
  saveJobMatch,
  saveCoverLetter,
  saveCoachSession,
  updateProfile
} from "./lib/firebase";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  // Self-clearing toast timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Core Entity States (Synchronized)
  const [interviews, setInterviews] = useState<MockInterviewSession[]>([]);
  const [resumes, setResumes] = useState<ResumeAnalysis[]>([]);
  const [roadmaps, setRoadmaps] = useState<GeneratedRoadmap[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatchResult[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterRecord[]>([]);
  const [coachSessions, setCoachSessions] = useState<any[]>([]);

  // Load local state or initialize guest profiles on start
  useEffect(() => {
    const savedUser = localStorage.getItem("careerpilot_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Error loading cached user profile:", e);
      }
    }
  }, []);

  // Synchronize database loading on user change
  useEffect(() => {
    if (currentUser) {
      const isGuest = currentUser.uid.startsWith("guest");
      setGuestUserActive(isGuest);
      
      getInterviews().then(setInterviews).catch(err => console.error("Error loading interviews:", err));
      getResumeAnalyses().then(setResumes).catch(err => console.error("Error loading resumes:", err));
      getRoadmaps().then(setRoadmaps).catch(err => console.error("Error loading roadmaps:", err));
      getJobMatches().then(setJobMatches).catch(err => console.error("Error loading job matches:", err));
      getCoverLetters().then(setCoverLetters).catch(err => console.error("Error loading cover letters:", err));
      getCoachSessions().then(setCoachSessions).catch(err => console.error("Error loading coach sessions:", err));
    } else {
      setInterviews([]);
      setResumes([]);
      setRoadmaps([]);
      setJobMatches([]);
      setCoverLetters([]);
      setCoachSessions([]);
    }
  }, [currentUser]);

  const handleUpdateProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem("careerpilot_user", JSON.stringify(updated));
    updateProfile(updated).catch(err => console.error("Error updating profile in DB:", err));
  };

  const handleAddPoints = (points: number) => {
    if (!currentUser) return;
    const newXP = (currentUser.points || 0) + points;
    const currentLevel = currentUser.level || 1;
    const nextLevelXP = currentLevel * 1000;
    
    let updatedLevel = currentLevel;
    let finalXP = newXP;

    if (newXP >= nextLevelXP) {
      updatedLevel += 1;
      finalXP = newXP - nextLevelXP;
    }

    const updated: UserProfile = {
      ...currentUser,
      points: finalXP,
      level: updatedLevel
    };

    handleUpdateProfile(updated);
  };

  const handleLoginSuccess = (user: any) => {
    const profile: UserProfile = {
      uid: user.uid || "usr_" + Date.now(),
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoUrl: user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      level: 1,
      points: 120,
      streak: 3,
      dreamRole: "Software Engineer",
      dreamCompany: "Google",
      skills: "React, Node.js, JavaScript, Python, SQL",
      education: "BS in Computer Science",
      experience: "Junior Developer, 1 yr",
      careerGoals: "Aiming to build scalable systems at world-class technology hubs.",
      isAdmin: user.isAdmin || user.email.includes("admin") || user.email === "parsharothuvarma@gmail.com"
    };

    setCurrentUser(profile);
    localStorage.setItem("careerpilot_user", JSON.stringify(profile));
  };

  const handleGuestMode = () => {
    const guestProfile: UserProfile = {
      uid: "guest_" + Date.now(),
      email: "guest@careerpilot.ai",
      displayName: "Guest Candidate",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      level: 1,
      points: 450,
      streak: 5,
      dreamRole: "AI Engineer",
      dreamCompany: "OpenAI",
      skills: "Python, TensorFlow, React, TypeScript, SQL",
      education: "Self-taught Developer",
      experience: "Associate Engineer, 2 yrs",
      careerGoals: "Land a role modeling real-world LLM frameworks and tooling.",
      isAdmin: true // Allow Admin panel visible for direct exploration!
    };

    setCurrentUser(guestProfile);
    localStorage.setItem("careerpilot_user", JSON.stringify(guestProfile));
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("careerpilot_user");
    setActiveTab("dashboard");
  };

  // State handlers to bubble up modifications from sub-panels
  const handleSaveInterview = (session: MockInterviewSession) => {
    setInterviews([session, ...interviews]);
    saveInterview(session).catch(err => console.error("Error saving interview to DB:", err));
  };

  const handleSaveResumeAnalysis = (analysis: ResumeAnalysis) => {
    setResumes([analysis, ...resumes]);
    saveResumeAnalysis(analysis).catch(err => console.error("Error saving resume to DB:", err));
  };

  const handleSaveRoadmap = (roadmap: GeneratedRoadmap) => {
    setRoadmaps([roadmap, ...roadmaps]);
    saveRoadmap(roadmap).catch(err => console.error("Error saving roadmap to DB:", err));
  };

  const handleSaveJobMatch = (match: JobMatchResult) => {
    setJobMatches([match, ...jobMatches]);
    saveJobMatch(match).catch(err => console.error("Error saving job match to DB:", err));
  };

  const handleSaveCoverLetter = (letter: CoverLetterRecord) => {
    setCoverLetters([letter, ...coverLetters]);
    saveCoverLetter(letter).catch(err => console.error("Error saving cover letter to DB:", err));
  };

  const handleSaveCoachSession = (sessionId: string, messages: CoachMessage[]) => {
    const filtered = coachSessions.filter(s => s.sessionId !== sessionId);
    const sessionData = { sessionId, messages, createdAt: new Date().toISOString() };
    setCoachSessions([sessionData, ...filtered]);
    saveCoachSession(sessionId, messages).catch(err => console.error("Error saving coach session to DB:", err));
  };

  if (!currentUser) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess}
        onGuestMode={handleGuestMode}
        showToast={showToast}
      />
    );
  }

  // Navigation Items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "resume", label: "Resume Analyser", icon: FileText },
    { id: "mock-interview", label: "Mock Interview", icon: Video },
    { id: "coach", label: "Career Coach", icon: MessageSquare },
    { id: "gaps", label: "Skills Matrix", icon: Layers },
    { id: "roadmaps", label: "Learning Roadmaps", icon: Map },
    { id: "job-match", label: "Match & Letters", icon: Mail },
    { id: "history", label: "Progress History", icon: History },
    { id: "assessments", label: "Assessments & Salary", icon: HelpCircle },
    { id: "profile", label: "My Profile", icon: User },
  ];

  if (currentUser.isAdmin) {
    navItems.push({ id: "admin", label: "Admin Desk", icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex font-sans relative overflow-hidden" id="main-viewport-container">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Sidebar navigation */}
      <aside className={`w-64 bg-[#0B0F19]/40 backdrop-blur-xl border-r border-white/10 text-slate-300 flex-shrink-0 flex flex-col justify-between fixed h-full z-40 lg:sticky top-0 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex-1 flex flex-col justify-between pt-6 pb-4 relative z-10">
          <div className="space-y-6">
            {/* Sidebar Logo */}
            <div className="px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">CareerPilot AI</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar menu lists */}
            <nav className="space-y-1.5 px-3">
              {navItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      activeTab === item.id 
                        ? "bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-md font-bold" 
                        : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <IconComp className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar bottom block */}
          <div className="px-4 pt-4 border-t border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 backdrop-blur-lg border border-white/5 rounded-2xl">
              <img 
                src={currentUser.photoUrl} 
                alt="Profile Avatar"
                className="h-8 w-8 rounded-full border-2 border-purple-500 object-cover"
              />
              <div className="min-w-0">
                <p className="font-bold text-white truncate text-[11px]">{currentUser.displayName}</p>
                <p className="text-[9px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <button 
              onClick={handleSignOut}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/10 bg-[#0B0F19]/30 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-black text-white text-sm md:text-base capitalize tracking-tight">
              {activeTab === "gaps" ? "Skills Matrix Compare" : activeTab.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Points and level progress indicators */}
            <div className="hidden md:flex items-center gap-3 text-xs">
              <div className="text-right space-y-0.5">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Level {currentUser.level} Pilot</span>
                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, ((currentUser.points || 0) / ((currentUser.level || 1) * 1000)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-xl flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-mono font-bold text-amber-300">{currentUser.streak} Day Streak</span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                <img 
                  src={currentUser.photoUrl} 
                  alt="Profile Avatar"
                  className="h-8 w-8 rounded-full object-cover border border-purple-500/50"
                />
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl py-2 z-50 text-xs"
                  >
                    <button 
                      onClick={() => {
                        setActiveTab("profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-slate-200 font-semibold cursor-pointer"
                    >
                      My Profile
                    </button>
                    {currentUser.isAdmin && (
                      <button 
                        onClick={() => {
                          setActiveTab("admin");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 text-slate-200 font-semibold cursor-pointer"
                      >
                        Admin Control Panel
                      </button>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-400 font-semibold cursor-pointer border-t border-white/5 mt-1"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content View Space */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && (
                <div id="dashboard-panel">
                  <Dashboard 
                    userProfile={currentUser}
                    interviews={interviews}
                    resumes={resumes}
                    onNavigate={setActiveTab}
                  />
                </div>
              )}

              {activeTab === "resume" && (
                <div id="resume-panel">
                  <ResumeAnalyzer 
                    userProfile={currentUser}
                    resumeAnalyses={resumes}
                    onSaveAnalysis={handleSaveResumeAnalysis}
                    onUpdateSkills={(newSkills) => {
                      const updated = { ...currentUser, skills: newSkills };
                      handleUpdateProfile(updated);
                    }}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeTab === "mock-interview" && (
                <div id="mock-interview-panel">
                  <MockInterview 
                    userProfile={currentUser}
                    onSaveInterview={handleSaveInterview}
                    onAddPoints={handleAddPoints}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeTab === "coach" && (
                <div id="coach-panel">
                  <CareerCoach 
                    userProfile={currentUser}
                    onSaveSession={handleSaveCoachSession}
                    coachSessions={coachSessions}
                  />
                </div>
              )}

              {activeTab === "gaps" && (
                <div id="gap-panel">
                  <SkillGap 
                    userProfile={currentUser}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeTab === "roadmaps" && (
                <div id="roadmap-panel">
                  <Roadmaps 
                    userProfile={currentUser}
                    roadmaps={roadmaps}
                    onSaveRoadmap={handleSaveRoadmap}
                    onAddPoints={handleAddPoints}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeTab === "job-match" && (
                <div id="job-match-panel">
                  <JobMatch 
                    userProfile={currentUser}
                    jobMatches={jobMatches}
                    onSaveJobMatch={handleSaveJobMatch}
                    onSaveCoverLetter={handleSaveCoverLetter}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeTab === "history" && (
                <div id="history-panel">
                  <InterviewHistory 
                    interviews={interviews}
                    resumes={resumes}
                  />
                </div>
              )}

              {activeTab === "assessments" && (
                <div id="assessment-panel">
                  <CareerAssessments 
                    userProfile={currentUser}
                    onAddPoints={handleAddPoints}
                  />
                </div>
              )}

              {activeTab === "profile" && (
                <div id="profile-panel">
                  <Profile 
                    userProfile={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                    showToast={showToast}
                  />
                </div>
              )}

              {activeTab === "admin" && currentUser.isAdmin && (
                <div id="admin-panel">
                  <AdminDashboard />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Dynamic Floating Toast Notification overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full px-4"
          >
            <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
              toast.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200" 
                : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/30 text-rose-200"
                : "bg-indigo-950/90 border-indigo-500/30 text-indigo-200"
            }`}>
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



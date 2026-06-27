import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use the database ID from firebase-applet-config.json explicitly to connect to the custom Firestore instance
const dbId = (firebaseConfig as any).firestoreDatabaseId || "ai-studio-69b2de29-ab54-4ff3-b92e-5d5040ef2a14";
const db = getFirestore(app, dbId);

// Test connection on boot (required by framework)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client is offline. App will use cached or simulated state.");
    } else {
      console.log("Firebase connection checked. Standard hybrid mode fallback active.");
    }
  }
}
testConnection();

export { auth, db };

// Fallback LocalStorage Keys
const KEYS = {
  USER_PROFILE: "careerpilot_user_profile",
  INTERVIEWS: "careerpilot_interviews",
  RESUMES: "careerpilot_resumes",
  COACH_SESSIONS: "careerpilot_coach_sessions",
  ROADMAPS: "careerpilot_roadmaps",
  COVER_LETTERS: "careerpilot_cover_letters",
  JOB_MATCHES: "careerpilot_job_matches",
  STREAK: "careerpilot_streak",
  POINTS: "careerpilot_points"
};

// Types
import { 
  UserProfile, 
  MockInterviewSession, 
  ResumeAnalysis, 
  GeneratedRoadmap, 
  CoverLetterRecord, 
  JobMatchResult, 
  CoachMessage 
} from "../types";

// Default Profile for guest
const DEFAULT_GUEST_PROFILE: UserProfile = {
  userId: "guest",
  email: "guest@careerpilot.ai",
  displayName: "Guest Pilot",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  education: "BS Computer Science (In Progress)",
  experience: "Junior Developer Intern at TechCorp",
  skills: "JavaScript, React, Tailwind CSS, Python, SQL",
  dreamCompany: "Google",
  dreamRole: "Software Engineer",
  careerGoals: "Aiming to land a full-time software engineering role at a top-tier tech firm and lead technical architectures.",
  streak: 3,
  points: 450,
  level: 2
};

// Helper to load LocalStorage array
function loadLocalArray<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Helper to save LocalStorage array
function saveLocalArray<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

// Global state / listeners
let currentUser: FirebaseUser | null = null;
let guestUserActive = true;

export function setGuestUserActive(val: boolean) {
  guestUserActive = val;
}

// Auth Operations
export async function registerWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
  guestUserActive = false;
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const u = userCredential.user;
  
  const profile: UserProfile = {
    userId: u.uid,
    email: u.email || email,
    displayName: name || "New Career Pilot",
    photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "CP")}`,
    education: "",
    experience: "",
    skills: "",
    dreamCompany: "",
    dreamRole: "",
    careerGoals: "",
    streak: 1,
    points: 100,
    level: 1
  };

  // Save to Firestore
  await setDoc(doc(db, "users", u.uid), profile);
  return profile;
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  guestUserActive = false;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const u = userCredential.user;

  // Retrieve Profile
  const d = await getDoc(doc(db, "users", u.uid));
  if (d.exists()) {
    return d.data() as UserProfile;
  } else {
    // Create new profile if missing
    const profile: UserProfile = {
      userId: u.uid,
      email: u.email || email,
      displayName: u.displayName || "Career Pilot",
      photoUrl: u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.displayName || "CP")}`,
      education: "",
      experience: "",
      skills: "",
      dreamCompany: "",
      dreamRole: "",
      careerGoals: "",
      streak: 1,
      points: 100,
      level: 1
    };
    await setDoc(doc(db, "users", u.uid), profile);
    return profile;
  }
}

export function enableGuestMode(): UserProfile {
  guestUserActive = true;
  // Initialize default guest profile if not exists
  const localProfile = localStorage.getItem(KEYS.USER_PROFILE);
  if (!localProfile) {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(DEFAULT_GUEST_PROFILE));
    return DEFAULT_GUEST_PROFILE;
  }
  return JSON.parse(localProfile) as UserProfile;
}

export async function signOutUser() {
  if (!guestUserActive) {
    await firebaseSignOut(auth);
  }
  guestUserActive = true;
}

// User Profile Update
export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  if (guestUserActive || !auth.currentUser) {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    return profile;
  } else {
    const uRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(uRef, profile, { merge: true });
    return profile;
  }
}

// Mock Interviews Data Store
export async function saveInterview(interview: MockInterviewSession): Promise<MockInterviewSession> {
  if (guestUserActive || !auth.currentUser) {
    const list = loadLocalArray<MockInterviewSession>(KEYS.INTERVIEWS);
    const index = list.findIndex(i => i.id === interview.id);
    if (index >= 0) {
      list[index] = interview;
    } else {
      list.push(interview);
    }
    saveLocalArray(KEYS.INTERVIEWS, list);
    return interview;
  } else {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid, "interviews", interview.id);
    await setDoc(ref, interview);
    return interview;
  }
}

export async function getInterviews(): Promise<MockInterviewSession[]> {
  if (guestUserActive || !auth.currentUser) {
    return loadLocalArray<MockInterviewSession>(KEYS.INTERVIEWS);
  } else {
    const uid = auth.currentUser.uid;
    const ref = collection(db, "users", uid, "interviews");
    const snapshot = await getDocs(ref);
    const list: MockInterviewSession[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as MockInterviewSession);
    });
    // Sort by date newest
    return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Resume Review Store
export async function saveResumeAnalysis(analysis: ResumeAnalysis): Promise<ResumeAnalysis> {
  if (guestUserActive || !auth.currentUser) {
    const list = loadLocalArray<ResumeAnalysis>(KEYS.RESUMES);
    list.push(analysis);
    saveLocalArray(KEYS.RESUMES, list);
    return analysis;
  } else {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid, "resumes", analysis.id);
    await setDoc(ref, analysis);
    return analysis;
  }
}

export async function getResumeAnalyses(): Promise<ResumeAnalysis[]> {
  if (guestUserActive || !auth.currentUser) {
    return loadLocalArray<ResumeAnalysis>(KEYS.RESUMES);
  } else {
    const uid = auth.currentUser.uid;
    const ref = collection(db, "users", uid, "resumes");
    const snapshot = await getDocs(ref);
    const list: ResumeAnalysis[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as ResumeAnalysis);
    });
    return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Learning Roadmap Store
export async function saveRoadmap(roadmap: GeneratedRoadmap): Promise<GeneratedRoadmap> {
  if (guestUserActive || !auth.currentUser) {
    const list = loadLocalArray<GeneratedRoadmap>(KEYS.ROADMAPS);
    list.push(roadmap);
    saveLocalArray(KEYS.ROADMAPS, list);
    return roadmap;
  } else {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid, "roadmaps", roadmap.id);
    await setDoc(ref, roadmap);
    return roadmap;
  }
}

export async function getRoadmaps(): Promise<GeneratedRoadmap[]> {
  if (guestUserActive || !auth.currentUser) {
    return loadLocalArray<GeneratedRoadmap>(KEYS.ROADMAPS);
  } else {
    const uid = auth.currentUser.uid;
    const ref = collection(db, "users", uid, "roadmaps");
    const snapshot = await getDocs(ref);
    const list: GeneratedRoadmap[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as GeneratedRoadmap);
    });
    return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Cover Letter Store
export async function saveCoverLetter(record: CoverLetterRecord): Promise<CoverLetterRecord> {
  if (guestUserActive || !auth.currentUser) {
    const list = loadLocalArray<CoverLetterRecord>(KEYS.COVER_LETTERS);
    list.push(record);
    saveLocalArray(KEYS.COVER_LETTERS, list);
    return record;
  } else {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid, "coverLetters", record.id);
    await setDoc(ref, record);
    return record;
  }
}

export async function getCoverLetters(): Promise<CoverLetterRecord[]> {
  if (guestUserActive || !auth.currentUser) {
    return loadLocalArray<CoverLetterRecord>(KEYS.COVER_LETTERS);
  } else {
    const uid = auth.currentUser.uid;
    const ref = collection(db, "users", uid, "coverLetters");
    const snapshot = await getDocs(ref);
    const list: CoverLetterRecord[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as CoverLetterRecord);
    });
    return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Job Match Records
export async function saveJobMatch(record: JobMatchResult): Promise<JobMatchResult> {
  if (guestUserActive || !auth.currentUser) {
    const list = loadLocalArray<JobMatchResult>(KEYS.JOB_MATCHES);
    list.push(record);
    saveLocalArray(KEYS.JOB_MATCHES, list);
    return record;
  } else {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid, "jobMatches", record.id);
    await setDoc(ref, record);
    return record;
  }
}

export async function getJobMatches(): Promise<JobMatchResult[]> {
  if (guestUserActive || !auth.currentUser) {
    return loadLocalArray<JobMatchResult>(KEYS.JOB_MATCHES);
  } else {
    const uid = auth.currentUser.uid;
    const ref = collection(db, "users", uid, "jobMatches");
    const snapshot = await getDocs(ref);
    const list: JobMatchResult[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as JobMatchResult);
    });
    return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Coach Conversations
export async function saveCoachSession(sessionId: string, messages: CoachMessage[]): Promise<any> {
  const data = { sessionId, messages, createdAt: new Date().toISOString() };
  if (guestUserActive || !auth.currentUser) {
    const list = loadLocalArray<any>(KEYS.COACH_SESSIONS);
    const index = list.findIndex(s => s.sessionId === sessionId);
    if (index >= 0) {
      list[index] = data;
    } else {
      list.push(data);
    }
    saveLocalArray(KEYS.COACH_SESSIONS, list);
    return data;
  } else {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid, "coachSessions", sessionId);
    await setDoc(ref, data);
    return data;
  }
}

export async function getCoachSessions(): Promise<any[]> {
  if (guestUserActive || !auth.currentUser) {
    return loadLocalArray<any>(KEYS.COACH_SESSIONS);
  } else {
    const uid = auth.currentUser.uid;
    const ref = collection(db, "users", uid, "coachSessions");
    const snapshot = await getDocs(ref);
    const list: any[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data());
    });
    return list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

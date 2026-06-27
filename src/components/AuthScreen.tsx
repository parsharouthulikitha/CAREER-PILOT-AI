import React, { useState } from "react";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  ArrowRight,
  Shield,
  HelpCircle
} from "lucide-react";
import { getApiUrl } from "../lib/api";

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  onGuestMode: () => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function AuthScreen({ onLoginSuccess, onGuestMode, showToast }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      const msg = "Please fill out all fields.";
      setLocalError(msg);
      showToast?.(msg, "error");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegistering ? { email, password, displayName } : { email, password };
      
      const res = await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.status === 200 || res.status === 201) {
        showToast?.(isRegistering ? "Registration successful!" : "Login successful!", "success");
        onLoginSuccess(data.user);
      } else {
        const msg = data.error || "Authentication failed. Please check credentials.";
        setLocalError(msg);
        showToast?.(msg, "error");
      }
    } catch (e) {
      console.error(e);
      const msg = "Error contacting the authorization server. Proceeding in Guest mode fallback is recommended.";
      setLocalError(msg);
      showToast?.(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden" id="auth-screen-canvas">
      {/* Background ambient glowing nodes */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-indigo-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-purple-500/10 blur-3xl rounded-full"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          {/* Logo element */}
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">CareerPilot AI</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">Interview coaching, resume ATS alignment, and dynamic skills roadmap advisor.</p>
        </div>

        {localError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs rounded-xl flex items-center justify-between gap-2">
            <span>{localError}</span>
            <button type="button" onClick={() => setLocalError(null)} className="text-rose-400 hover:text-rose-200 cursor-pointer font-bold">×</button>
          </div>
        )}

        <form onSubmit={handleStandardAuth} className="space-y-4 text-xs">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Sarah Connor"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Minimum 6 characters"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : isRegistering ? "Create Career Account" : "Access Career Dashboard"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="relative text-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 font-mono uppercase tracking-widest">Or</span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onGuestMode}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            Continue as Guest (No registration required)
          </button>

          <div className="text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
            >
              {isRegistering ? "Already have an account? Sign In" : "New candidate? Build custom Career Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

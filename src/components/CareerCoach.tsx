import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  TrendingUp, 
  Check, 
  Plus, 
  Trash2,
  RefreshCw
} from "lucide-react";
import { CoachMessage, UserProfile } from "../types";
import { getApiUrl } from "../lib/api";

interface CareerCoachProps {
  userProfile: UserProfile;
  onSaveSession: (sessionId: string, messages: CoachMessage[]) => void;
  coachSessions: any[];
}

export default function CareerCoach({ userProfile, onSaveSession, coachSessions }: CareerCoachProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "init",
      text: `Hello! I am CareerPilot AI, your elite personal career guide. I have reviewed your profile targeting "${userProfile.dreamRole || "Software Engineer"}" at "${userProfile.dreamCompany || "Target Company"}". Ask me anything about career switching, resume tailoring, skills, salary negotiation, or career roadmaps!`,
      sender: "ai",
      createdAt: new Date().toISOString()
    }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("session_" + Date.now());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const suggestions = [
    "What core skills are missing from my resume for my target role?",
    "Give me step-by-step strategies to negotiate a higher base salary.",
    "Explain how to structure responses using the STAR methodology.",
    "How can I smoothly transition from another track into AI Engineering?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: CoachMessage = {
      id: "msg_" + Date.now(),
      text,
      sender: "user",
      createdAt: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const offlineMode = typeof window !== "undefined" && localStorage.getItem("is_offline_mode") === "true";
      if (offlineMode) {
        throw new Error("offline_triggered");
      }

      const res = await fetch(getApiUrl("/api/career-coach"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          userProfile
        })
      });
      const data = await res.json();
      
      const aiMsg: CoachMessage = {
        id: "msg_ai_" + Date.now(),
        text: data.text || "Sorry, I am having trouble connecting to my cognitive networks. Let's try again shortly.",
        sender: "ai",
        createdAt: new Date().toISOString()
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      onSaveSession(activeSessionId, finalMessages);

    } catch (e: any) {
      console.warn("Generating career coach response via client-side offline fallback:", e);
      
      // Offline fallback responses based on keywords
      let responseText = "I am operating in Offline Standalone Mode. I can still help you with career coaching tips! Try asking me about 'resume advice', 'interview tips', 'salary negotiation', or 'skills mapping'.";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("resume") || lowerText.includes("cv") || lowerText.includes("ats")) {
        responseText = `To build an ATS-compliant resume, follow these core pillars:
1. **Clear Hierarchy**: Use simple, standard sections (Summary, Experience, Projects, Skills, Education). Avoid two-column formats as some parsers misalign them.
2. **Quantify Impact**: Use the Google Resume Formula: *Accomplished [X] as measured by [Y], by doing [Z]*.
3. **Keyword Matching**: Incorporate hard technical keywords directly from the job description naturally into your bullet points.`;
      } else if (lowerText.includes("interview") || lowerText.includes("question") || lowerText.includes("mock")) {
        responseText = `Excel in technical and behavioral interviews using these strategies:
1. **Behavioral (STAR Method)**: Structure your stories using Situation, Task, Action, and Result. Make the 'Result' highly measurable.
2. **Technical/Coding**: Discuss your thought process out loud before coding. Talk about brute-force methods first, then analyze time/space complexity before refining your algorithm.
3. **System Design**: Establish scope, design high-level components (API Gateway, Load Balancer, DB, Cache), and talk about reliability/scaling trade-offs.`;
      } else if (lowerText.includes("salary") || lowerText.includes("negotiat") || lowerText.includes("offer") || lowerText.includes("money")) {
        responseText = `When negotiating an offer:
1. **Never Give the First Number**: Politely ask for their budget first (e.g., "I'd love to learn more about the complete range of compensation you have budgeted for this role").
2. **Establish Your Value**: Reference your unique skill alignments and previous performance records.
3. **Get It In Writing**: Always ask for the complete offer details in writing before making a decision. Keep negotiations positive and collaborative.`;
      } else if (lowerText.includes("skill") || lowerText.includes("learn") || lowerText.includes("gaps") || lowerText.includes("roadmap")) {
        responseText = `To bridge your skill gaps:
1. **Identify the Delta**: Compare your current skills against high-frequency keywords in job descriptions at your dream companies.
2. **Build Capstones**: Don't just watch videos. Build a real, deployed, full-stack application that solves a real business problem.
3. **Contribute**: Contribute to open-source or write technical articles to prove your domain expertise.`;
      }

      const aiMsg: CoachMessage = {
        id: "msg_ai_" + Date.now(),
        text: responseText,
        sender: "ai",
        createdAt: new Date().toISOString()
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      onSaveSession(activeSessionId, finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  // Start new chat session
  const handleNewSession = () => {
    const newId = "session_" + Date.now();
    setActiveSessionId(newId);
    setMessages([
      {
        id: "init",
        text: `Hello! Let's start a fresh coaching consultation session. Ask me anything to help structure your "${userProfile.dreamRole || "Software Engineer"}" career track.`,
        sender: "ai",
        createdAt: new Date().toISOString()
      }
    ]);
  };

  // Switch to historic session
  const handleLoadSession = (session: any) => {
    setActiveSessionId(session.sessionId);
    setMessages(session.messages);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="career-coach-panel">
      {/* Sessions History sidebar */}
      <div className="lg:col-span-3 space-y-4">
        <button 
          onClick={handleNewSession}
          className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Start New Consult
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Consult Sessions</h4>
          
          {coachSessions.length === 0 ? (
            <p className="text-[10px] text-slate-400 p-2 italic text-center">No previous consult logs found.</p>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {coachSessions.map((session, idx) => {
                const previewText = session.messages[1]?.text || "New Consult Session";
                return (
                  <button
                    key={session.sessionId}
                    onClick={() => handleLoadSession(session)}
                    className={`w-full text-left p-3 rounded-xl border text-[11px] font-medium block truncate transition-all cursor-pointer ${
                      activeSessionId === session.sessionId 
                        ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-bold" 
                        : "bg-slate-50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[9px] text-slate-400 font-mono">
                      <MessageSquare className="h-3 w-3" />
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="truncate block">{previewText}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main chat terminal */}
      <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[650px] justify-between">
        {/* Chat Bubbles scroll space */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2" id="chat-messages-scroll">
          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user" 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-850 rounded-bl-none shadow-sm"
                }`}
              >
                {m.sender === "ai" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-indigo-500 font-bold uppercase tracking-widest mb-1.5 block">
                    <Sparkles className="h-3 w-3" /> CareerPilot AI
                  </span>
                )}
                <div className="whitespace-pre-line text-sm leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl rounded-bl-none text-xs text-slate-400 inline-flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                <span>CareerPilot AI is formulating advice...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Grid */}
        {messages.length === 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Quick Suggested Consult Questions</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="p-3 text-left bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 hover:border-indigo-100 dark:hover:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all cursor-pointer flex gap-2 items-start"
                >
                  <HelpCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form Box */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Type your career or interview negotiation query..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

      </div>
    </div>
  );
}

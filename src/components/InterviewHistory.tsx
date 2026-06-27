import React from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  Video, 
  FileText, 
  CheckCircle, 
  Award,
  Clock
} from "lucide-react";
import { MockInterviewSession, ResumeAnalysis } from "../types";

interface InterviewHistoryProps {
  interviews: MockInterviewSession[];
  resumes: ResumeAnalysis[];
}

export default function InterviewHistory({ interviews, resumes }: InterviewHistoryProps) {
  
  // Create progression data
  const progressData = interviews.map((item, idx) => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    score: item.overallScore || 0,
    role: item.role
  })).reverse();

  // Mock progression if empty
  const defaultProgress = [
    { date: "June 1", score: 55 },
    { date: "June 10", score: 65 },
    { date: "June 18", score: 72 },
    { date: "June 25", score: 85 }
  ];

  const activeData = progressData.length > 0 ? progressData : defaultProgress;

  return (
    <div className="space-y-8" id="history-container">
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Readiness progression Line */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Interview Readiness Progression
            </h3>
            <p className="text-[10px] text-slate-400">Score progress over recent practice milestones (%)</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4F46E5" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice distribution bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" /> Career Milestones Growth
            </h3>
            <p className="text-[10px] text-slate-400">Total documents, analyzes, and interviews saved</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Mock Interviews", count: interviews.length > 0 ? interviews.length : 3, fill: "#4F46E5" },
                { name: "Resume Scans", count: resumes.length > 0 ? resumes.length : 4, fill: "#EC4899" },
                { name: "Skills Analyzed", count: 8, fill: "#10B981" }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History table lists */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Milestone History Log</h3>

        {interviews.length === 0 ? (
          <p className="text-xs text-slate-400 text-center p-8 italic">No mock interview history recorded yet. Complete an interview to see data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3">Practice Target / Role</th>
                  <th className="p-3">Interview Mode</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {interviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.role}</td>
                    <td className="p-3">{item.mode}</td>
                    <td className="p-3">
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right font-black text-slate-800 dark:text-slate-200">{item.overallScore || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

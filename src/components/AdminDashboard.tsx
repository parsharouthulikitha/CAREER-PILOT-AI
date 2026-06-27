import React, { useState } from "react";
import { 
  Users, 
  Video, 
  FileText, 
  TrendingUp, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  Trash2, 
  Sparkles,
  BarChart2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const [users, setUsers] = useState([
    { id: "u1", name: "Sarah Connor", email: "sarah@cyberdyne.io", role: "Software Engineer", score: 88, status: "Active" },
    { id: "u2", name: "Bruce Wayne", email: "bruce@waynecorp.com", role: "Product Manager", score: 94, status: "Active" },
    { id: "u3", name: "Tony Stark", email: "tony@starkindustries.com", role: "AI Specialist", score: 98, status: "Active" },
    { id: "u4", name: "Peter Parker", email: "peter@dailybugle.com", role: "Marketing Intern", score: 72, status: "Review Required" },
    { id: "u5", name: "Clark Kent", email: "clark@dailyplanet.com", role: "Writer / HR Specialist", score: 82, status: "Active" }
  ]);

  const [activeTab, setActiveTab] = useState<"users" | "analytics" | "logs">("analytics");

  // Track interview sessions
  const mockSystemInterviews = [
    { id: "i1", user: "Bruce Wayne", role: "Product Manager", type: "Behavioral", score: 94, date: "June 26" },
    { id: "i2", user: "Tony Stark", role: "AI Specialist", type: "Technical", score: 98, date: "June 25" },
    { id: "i3", user: "Sarah Connor", role: "Software Engineer", type: "Technical", score: 88, date: "June 24" },
    { id: "i4", user: "Peter Parker", role: "Marketing Intern", type: "HR Round", score: 72, date: "June 23" }
  ];

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B"];

  const usageStats = [
    { name: "Mon", calls: 450 },
    { name: "Tue", calls: 520 },
    { name: "Wed", calls: 610 },
    { name: "Thu", calls: 580 },
    { name: "Fri", calls: 640 },
    { name: "Sat", calls: 380 },
    { name: "Sun", calls: 410 }
  ];

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-8" id="admin-dashboard-panel">
      {/* Admin header alert */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">Admin Control Panel Mode</h3>
            <p className="text-[10px] text-slate-400">Monitoring real-time API latency, user listings, and platform metrics.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(["analytics", "users", "logs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                activeTab === t 
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-850 dark:border-slate-800" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Total Platform Users</span>
              <h4 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{users.length + 150}</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Mock Exams Run</span>
              <h4 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">1,240</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Resumes Optimised</span>
              <h4 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">892</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">AI Token Cost API</span>
              <h4 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">$42.80</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Usage progression */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1">
                  <BarChart2 className="h-4 w-4 text-indigo-500" /> Platform API Utilization
                </h4>
                <p className="text-[10px] text-slate-400">Total processed prompt transactions / day</p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="calls" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target roles pie chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">Top Subscribed Tracks</h4>
                <p className="text-[10px] text-slate-400">Distribution ratio (%)</p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Full Stack", value: 45 },
                        { name: "AI/ML", value: 30 },
                        { name: "Cloud", value: 15 },
                        { name: "Product", value: 10 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">User Registry</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Dream Track</th>
                  <th className="p-3">Best Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3 font-medium">{u.role}</td>
                    <td className="p-3 font-bold text-indigo-600">{u.score}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        u.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>{u.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-rose-500 hover:text-rose-600 cursor-pointer p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Mock Interview Logs Feed</h3>

          <div className="space-y-4">
            {mockSystemInterviews.map((item) => (
              <div key={item.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.user}</span>
                    <span className="text-[10px] text-slate-400">for {item.role}</span>
                  </div>
                  <div className="text-slate-500 mt-1 flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" />
                    <span>Graded {item.type} round on {item.date}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

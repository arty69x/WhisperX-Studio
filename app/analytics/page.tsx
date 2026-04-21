"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import { TrendingUp, Users, Target, Clock, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { useProjectsStore } from "@/stores/projects";
import { useMemo } from "react";
import { motion } from "motion/react";

const PERFORMANCE = [
  { week: "W1", throughput: 20, velocity: 15 },
  { week: "W2", throughput: 45, velocity: 38 },
  { week: "W3", throughput: 30, velocity: 42 },
  { week: "W4", throughput: 60, velocity: 50 },
  { week: "W5", throughput: 80, velocity: 72 },
  { week: "W6", throughput: 55, velocity: 68 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AnalyticsPage() {
  const { projects, tasks } = useProjectsStore();

  const totalValue = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const teamEfficiency = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;

  const getMetricMatrix = useMemo(() => {
    return projects.map((p) => ({
      name: p.title.length > 15 ? p.title.substring(0, 15) + "..." : p.title,
      budget: p.budget,
      spent: p.spent,
      progress: p.progress
    }));
  }, [projects]);

  const taskDistData = useMemo(() => {
    return [
      { name: "Done", value: tasks.filter(t => t.status === "DONE").length, color: "#00e5a0" },
      { name: "Review", value: tasks.filter(t => t.status === "REVIEW").length, color: "#ffcc44" },
      { name: "In Progress", value: tasks.filter(t => t.status === "IN_PROGRESS").length, color: "#ff2d6b" },
      { name: "Todo", value: tasks.filter(t => t.status === "TODO").length, color: "rgba(255, 255, 255, 0.4)" },
    ];
  }, [tasks]);

  return (
    <motion.div 
      className="p-6 max-w-7xl mx-auto space-y-6 pb-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-4">
        <div>
          <p className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-2">Metrics Matrix</p>
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-[0.85]">ANALYTICS<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--pink)]">ENGINE</span></h2>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 shadow-lg">
          {["7D", "30D", "3M", "1Y"].map((t, idx) => (
            <button key={t} className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${idx === 1 ? "bg-gradient-to-r from-[var(--primary)] to-[var(--violet)] text-white shadow-lg" : "text-white/40 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* High Level Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 overflow-hidden relative border-white/10 rounded-[2rem] group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.05] group-hover:scale-150 transition-transform duration-500 bg-[var(--primary)]" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]"><TrendingUp size={20} /></div>
            <div className="flex items-center gap-1 text-[var(--ok)] font-black text-[9px] uppercase tracking-widest"><ArrowUpRight size={14} /> Active</div>
          </div>
          <div className="text-4xl font-black text-white mb-1 tracking-tighter relative z-10">฿ {(totalValue / 1000000).toFixed(1)}M</div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] relative z-10">Total Portfolio Value</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)]/30">
            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 1 }} className="h-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 overflow-hidden relative border-white/10 rounded-[2rem] group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.05] group-hover:scale-150 transition-transform duration-500 bg-[var(--violet)]" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--violet)]/10 flex items-center justify-center text-[var(--violet)]"><Users size={20} /></div>
            <div className="flex items-center gap-1 text-[var(--ok)] font-black text-[9px] uppercase tracking-widest"><ArrowUpRight size={14} /> +3.4%</div>
          </div>
          <div className="text-4xl font-black text-white mb-1 tracking-tighter relative z-10">{teamEfficiency}%</div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] relative z-10">Team Efficiency</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--violet)]/30">
            <motion.div initial={{ width: 0 }} animate={{ width: `${teamEfficiency}%` }} transition={{ delay: 0.6, duration: 1 }} className="h-full bg-[var(--violet)] shadow-[0_0_10px_var(--violet)]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 overflow-hidden relative border-white/10 rounded-[2rem] group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.05] group-hover:scale-150 transition-transform duration-500 bg-[var(--ok)]" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--ok)]/10 flex items-center justify-center text-[var(--ok)]"><Target size={20} /></div>
            <div className="flex items-center gap-1 text-[var(--info)] font-black text-[9px] uppercase tracking-widest"><Calendar size={14} /> Stable</div>
          </div>
          <div className="text-4xl font-black text-white mb-1 tracking-tighter relative z-10">{completedTasks} / {totalTasks}</div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] relative z-10">Tasks Delivered</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--ok)]/30">
            <motion.div initial={{ width: 0 }} animate={{ width: `${teamEfficiency}%` }} transition={{ delay: 0.7, duration: 1 }} className="h-full bg-[var(--ok)] shadow-[0_0_10px_var(--ok)]" />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Spending */}
        <GlassCard className="p-8 border-white/10 rounded-[2.5rem]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-[var(--primary)] rounded-full" />
            Budget Absorption Matrix
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMetricMatrix} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }} width={120} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{ backgroundColor: "#0d0018", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
                  labelStyle={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}
                  formatter={(value: number) => [`฿ ${value.toLocaleString()}`]}
                />
                <Bar dataKey="budget" fill="rgba(255,255,255,0.03)" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="spent" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Task Distribution */}
        <GlassCard className="p-8 border-white/10 rounded-[2.5rem]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-[var(--ok)] rounded-full" />
            Task Allocation
          </h3>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={taskDistData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {taskDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: "var(--glass-strong)", borderRadius: "12px", border: "1px solid var(--glass-border)", backdropFilter: "blur(10px)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 pr-10">
              {taskDistData.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: s.color, color: s.color }} />
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[var(--text)]">{s.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{s.value} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Velocity */}
        <GlassCard className="lg:col-span-2 p-8 border-white/10 rounded-[2.5rem]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-[var(--violet)] rounded-full" />
            Sprint Velocity (Last 6 Weeks)
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: "bold" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--glass-strong)", borderRadius: "16px", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}
                  itemStyle={{ fontSize: "14px", fontWeight: "bold", color: "white" }}
                  labelStyle={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: "bold" }}
                />
                <Line type="monotone" dataKey="throughput" stroke="var(--primary)" strokeWidth={4} dot={{ r: 5, fill: "var(--primary)", strokeWidth: 2, stroke: "#000" }} />
                <Area type="monotone" dataKey="velocity" stroke="var(--violet)" strokeWidth={3} fillOpacity={1} fill="url(#gVel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

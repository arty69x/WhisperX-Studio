"use client";

import GlassCard from "@/components/ui/GlassCard";
import { useProjectsStore } from "@/stores/projects";
import { useAppStore } from "@/stores/app";
import { fmtCurrency, fmtDate } from "@/lib/utils";
import { 
  TrendingUp, Users, Target, Clock, CheckCircle2, 
  ArrowUpRight, Plus, Calendar, Filter, MoreHorizontal, LayoutList
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { useMemo } from "react";
import { motion } from "motion/react";

const STATUS_COLORS: Record<string, string> = {
  "TODO": "var(--text-soft)",
  "IN_PROGRESS": "var(--primary)",
  "REVIEW": "var(--warn)",
  "DONE": "var(--ok)",
};

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

export default function Dashboard() {
  const { projects, tasks } = useProjectsStore();
  const { notifs } = useAppStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const pendingTasks = totalTasks - completedTasks;
  const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusData = useMemo(() => {
    return [
      { name: "To Do", count: tasks.filter(t => t.status === "TODO").length, color: STATUS_COLORS["TODO"] },
      { name: "In Progress", count: tasks.filter(t => t.status === "IN_PROGRESS").length, color: STATUS_COLORS["IN_PROGRESS"] },
      { name: "Review", count: tasks.filter(t => t.status === "REVIEW").length, color: STATUS_COLORS["REVIEW"] },
      { name: "Done", count: tasks.filter(t => t.status === "DONE").length, color: STATUS_COLORS["DONE"] },
    ];
  }, [tasks]);

  return (
    <motion.div 
      className="p-6 max-w-7xl mx-auto space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero / Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
        <div>
          <p className="text-sm font-medium text-white/40 mb-2 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.8] text-white">
            COLLECTIVE<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff2d6b] to-[#8b00ff]">SUMMARY</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active nodes</p>
            <p className="text-2xl font-black text-[#44d4ff]">{projects.length}</p>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="text-right">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Net Efficiency</p>
            <p className="text-2xl font-black text-[#00e5a0]">{efficiency}%</p>
          </div>
          <CreateProjectDialog>
            <Btn primary className="ml-4 font-black uppercase tracking-widest"><Plus size={16} className="mr-1" /> New Sequence</Btn>
          </CreateProjectDialog>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Tasks", val: totalTasks, change: "All", icon: LayoutList, c: "var(--primary)" },
          { label: "Pending tasks", val: pendingTasks, change: "WIP", icon: Clock, c: "var(--warn)" },
          { label: "Matrix Completed", val: completedTasks, change: "Done", icon: CheckCircle2, c: "var(--ok)" },
          { label: "Fleet status", val: "ONLINE", change: "8/12", icon: Users, c: "var(--violet)" },
        ].map((s, i) => (
          <GlassCard key={i} className="p-6 overflow-hidden relative border-white/10 hover:border-white/20 transition-all rounded-[2rem] group hover:-translate-y-1">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.05] group-hover:scale-150 transition-transform duration-500" style={{ background: s.c }} />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl" style={{ background: s.c + "22" }}>
                <s.icon size={20} style={{ color: s.c }} />
              </div>
              <span className="text-[10px] font-black text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-widest">{s.change}</span>
            </div>
            <div className="text-3xl font-black text-white mb-0.5 tracking-tighter">{s.val}</div>
            <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">{s.label}</div>
          </GlassCard>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[var(--text)]">Tasks by Status</h3>
          </div>
          <div className="flex-1 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: "bold" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <Tooltip 
                  cursor={{ fill: 'var(--glass-strong)', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: "var(--glass-strong)", borderRadius: "12px", border: "1px solid var(--glass-border)", backdropFilter: "blur(10px)" }}
                  itemStyle={{ fontSize: "14px", fontWeight: "bold", color: "white" }}
                  labelStyle={{ display: "none" }}
                  formatter={(value: number) => [`${value} Tasks`]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Notifications / Activity */}
        <GlassCard className="p-0 flex flex-col h-full overflow-hidden relative">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between relative z-10 bg-black/20 backdrop-blur-md">
            <h3 className="font-bold text-[var(--text)]">Recent Activity</h3>
            <button className="text-[var(--text-muted)] hover:text-[var(--text-soft)] transition-colors"><MoreHorizontal size={16} /></button>
          </div>
          <div className="p-2 overflow-auto max-h-[400px] relative z-10 relative">
            {notifs.map((n) => (
              <div key={n.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors group flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.type === "success" ? "var(--ok)" : n.type === "warning" ? "var(--warn)" : "var(--info)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text)]">{n.title}</p>
                  <p className="text-[11px] text-[var(--text-soft)] leading-tight mt-0.5">{n.msg}</p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 border-t border-[var(--glass-border)] relative z-10 bg-black/20 backdrop-blur-md">
            <Btn className="w-full text-xs" small>View All</Btn>
          </div>
        </GlassCard>
      </motion.div>

      {/* Projects Grid */}
      <motion.div variants={item}>
        <h3 className="font-bold text-[var(--text)] mb-4 px-1">Upcoming Deadlines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <GlassCard key={p.id} className="p-5 group hover:border-[var(--primary)]/30 transition-all hover:shadow-[0_0_30px_-5px_var(--primary)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ background: p.color }}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text)] leading-tight group-hover:text-[var(--primary)] transition-colors">{p.title}</h4>
                    <p className="text-xs text-[var(--text-soft)] mt-0.5">{p.description}</p>
                  </div>
                </div>
                <Badge label={p.progress + "%"} color={p.color} />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: Users, val: p.members.length, label: "Members" },
                  { icon: Calendar, val: fmtDate(p.deadline), label: "Deadline" },
                  { icon: TrendingUp, val: fmtCurrency(p.budget), label: "Budget" },
                ].map((item, i) => (
                  <div key={i} className="soft-card p-2 text-center rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                    <item.icon size={12} className="mx-auto mb-1 opacity-40 text-white" />
                    <div className="text-[10px] font-bold text-[var(--text)] truncate">{item.val}</div>
                    <div className="text-[8px] text-[var(--text-muted)] font-bold uppercase">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass)" }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: p.progress + "%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full" 
                    style={{ background: p.color }} 
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.members.map((m, i) => (
                    <div key={i} className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-a)] bg-slate-400 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ background: `linear-gradient(${135 + i * 45}deg, var(--primary), var(--pink))` }}>
                      {m[0]}
                    </div>
                  ))}
                </div>
                <Btn small className="group/btn">
                  Details <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Btn>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

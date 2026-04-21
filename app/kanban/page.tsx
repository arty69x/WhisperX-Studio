"use client";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import { useProjectsStore } from "@/stores/projects";
import { Search, Plus, Filter, Users, LayoutGrid, List } from "lucide-react";
import Btn from "@/components/ui/Btn";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "motion/react";

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

export default function KanbanPage() {
  const { projects, activeProjectId, setActiveProject } = useProjectsStore();
  const active = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <motion.div 
      className="h-full flex flex-col pt-6 overflow-hidden"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="px-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full shadow-lg shadow-black/40" style={{ background: active?.color }} />
            <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Project Vector</p>
          </div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{active?.title}</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">{active?.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
            <button className="p-2 rounded-full bg-white/10 text-white shadow-lg"><LayoutGrid size={16} /></button>
            <button className="p-2 rounded-full text-white/40 hover:text-white"><List size={16} /></button>
          </div>
          <Btn primary className="font-black"><Plus size={16} className="mr-1" /> Deploy Task</Btn>
        </div>
      </motion.div>

      <motion.div variants={item} className="px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {active?.members.map((m, i) => (
              <div key={i} className="w-10 h-10 rounded-full ring-4 ring-[#06000f] border border-white/10 flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-white/10 to-transparent shadow-lg" style={{ background: `linear-gradient(${135 + i * 45}deg, var(--primary), var(--violet))` }}>
                {m[0]}
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs text-white/50 focus-within:border-[var(--primary)] transition-all">
            <Search size={14} className="text-white/30" />
            <input type="text" placeholder="Filter matrix..." className="bg-transparent border-none outline-none w-48 font-bold placeholder:text-white/20" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mr-2">Linkage:</span>
          {projects.map((p) => (
            <button 
              key={p.id} 
              onClick={() => setActiveProject(p.id)}
              className={`w-7 h-7 rounded-xl transition-all border-2 ${activeProjectId === p.id ? "border-white/40 scale-110 shadow-lg shadow-black/40 ring-4 ring-white/5" : "border-transparent opacity-40 hover:opacity-100"}`}
              style={{ background: p.color }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex-1 overflow-hidden">
        <KanbanBoard projectId={activeProjectId || projects[0]?.id} />
      </motion.div>
    </motion.div>
  );
}

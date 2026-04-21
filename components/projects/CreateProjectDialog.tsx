"use client";

import { useState } from "react";
import { useProjectsStore, PROJECT_TEMPLATES } from "@/stores/projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import Btn from "@/components/ui/Btn";
import GInput from "@/components/ui/GInput";
import { Plus, Target, Layout, Rocket, Binary, Layers } from "lucide-react";
import { toast } from "sonner";

export default function CreateProjectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { addProject } = useProjectsStore();

  const handleCreate = () => {
    if (!title) {
      toast.error("Please provide a title");
      return;
    }
    
    addProject({
      title,
      description,
      color: "#00e5a0", // Default to neon mint
      progress: 0,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      members: ["You"],
      budget: 0,
      spent: 0,
    }, selectedTemplate || undefined);

    toast.success("Project sequence initialized");
    setOpen(false);
    setTitle("");
    setDescription("");
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#0d001a] border-[#1c1c1c] p-0 overflow-hidden">
        <div className="flex h-[480px]">
          {/* Sidebar: Templates */}
          <div className="w-64 bg-[#06000f] border-r border-[#1c1c1c] p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">Select Matrix</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${!selectedTemplate ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white' : 'border-transparent text-white/40 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <Layers size={16} />
                  <span className="text-xs font-bold">Blank Sequence</span>
                </div>
              </button>
              {PROJECT_TEMPLATES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${selectedTemplate === t.id ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white' : 'border-transparent text-white/40 hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{t.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{t.name}</div>
                      <div className="text-[9px] opacity-60 leading-tight mt-0.5">{t.description.slice(0, 30)}...</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Area: Form */}
          <div className="flex-1 p-8 flex flex-col">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black font-display italic uppercase tracking-tighter text-white">
                Initialize Project
              </DialogTitle>
              <p className="text-xs text-white/40 font-mono tracking-widest uppercase">NODE CONFIGURATION</p>
            </DialogHeader>

            <div className="space-y-6 flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Sequence Identifier</label>
                <GInput 
                  icon={Target} 
                  placeholder="e.g. Project Alpha Strike" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Mission Briefing</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:border-[var(--primary)] outline-none min-h-[100px] transition-all"
                  placeholder="Describe the project goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <Btn variant="secondary" onClick={() => setOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Abort</Btn>
              <Btn onClick={handleCreate} className="px-8 font-bold uppercase tracking-widest">Execute</Btn>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import * as Diff from "diff";
import GlassCard from "@/components/ui/GlassCard";
import Btn from "@/components/ui/Btn";
import { GitCompare, ArrowLeftRight, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const SAMPLE_A = `// version 1
const app = "TaskOS Pro";
console.log("Welcome to " + app);
const version = 1.0;`;

const SAMPLE_B = `// version 2.0
const app = "TaskOS Pro Platinum";
console.log("Welcome to " + app);
const version = 2.0;
const author = "PM Lead";`;

export default function DiffPage() {
  const [v1, setV1] = useState(SAMPLE_A);
  const [v2, setV2] = useState(SAMPLE_B);
  const [diffs, setDiffs] = useState<Diff.Change[]>([]);

  const compare = () => {
    const d = Diff.diffLines(v1, v2);
    setDiffs(d);
    toast.success("วิเคราะห์ความแตกต่างเสร็จสิ้น");
  };

  return (
    <motion.div 
      className="p-6 max-w-6xl mx-auto space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Code Diff / Merge Tool</h2>
          <p className="text-[var(--text-soft)] text-sm">เปรียบเทียบความแตกต่างระหว่างข้อความหรือโค้ดสองเวอร์ชัน</p>
        </div>
        <Btn primary onClick={compare}><GitCompare size={16} className="mr-1" /> เปรียบเทียบ</Btn>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Source Version (A)</label>
          <textarea 
            value={v1} 
            onChange={(e) => setV1(e.target.value)}
            className="w-full h-48 glass-input rounded-xl p-4 text-xs font-mono resize-none border-[var(--glass-border)]"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Target Version (B)</label>
          <textarea 
            value={v2} 
            onChange={(e) => setV2(e.target.value)}
            className="w-full h-48 glass-input rounded-xl p-4 text-xs font-mono resize-none border-[var(--glass-border)]"
            spellCheck={false}
          />
        </div>
      </motion.div>

      {diffs.length > 0 && (
        <motion.div variants={item}>
          <GlassCard className="p-0 overflow-hidden bg-black/10">
            <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-sm text-[var(--text)]">Analysis Result</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--ok)]" /><span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Added</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--err)]" /><span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Removed</span></div>
              </div>
            </div>
            <div className="p-6 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-[500px]">
              {diffs.map((part, i) => (
                <span key={i} className={cn(
                  "p-0.5",
                  part.added ? "bg-[var(--ok)]/20 text-[#2dd4bf] border-l-2 border-[var(--ok)]" : 
                  part.removed ? "bg-[var(--err)]/20 text-[#f87171] border-l-2 border-[var(--err)] line-through" : 
                  "text-[var(--text-soft)]"
                )}>
                  {part.value}
                </span>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--glass-border)] flex justify-end">
              <Btn small onClick={() => setDiffs([])}>ปิดผลลัพธ์</Btn>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}

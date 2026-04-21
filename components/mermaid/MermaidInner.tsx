"use client";

import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import GlassCard from "@/components/ui/GlassCard";
import Btn from "@/components/ui/Btn";
import { Copy, RefreshCw, Download, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const DEFAULT_CODE = `graph TD
    A[Start Project] --> B{Design Review}
    B -- Pass --> C[Development]
    B -- Fail --> D[Redesign]
    D --> B
    C --> E[Production]
    E --> F[End]`;

export default function MermaidInner() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svg, setSvg] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const render = async () => {
    try {
      const { svg } = await mermaid.render("mermaid-svg-" + Date.now().toString(), code);
      setSvg(svg);
    } catch (e) {
      console.error(e);
      toast.error("Invalid Mermaid Syntax");
    }
  };

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: "dark", securityLevel: "loose", fontFamily: "Inter" });
    const timer = setTimeout(() => {
      mermaid.render("mermaid-svg-" + Date.now().toString(), code)
        .then(({ svg }) => setSvg(svg))
        .catch(console.error);
    }, 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="h-full flex flex-col md:flex-row overflow-hidden bg-black/5"
    >
      <div className="w-full md:w-[400px] flex flex-col border-r border-[var(--glass-border)] glass">
        <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
          <h2 className="font-bold text-sm text-[var(--text)] flex items-center gap-2"><Zap size={14} className="text-[var(--warn)]" /> Mermaid Editor</h2>
          <Btn small onClick={render} primary><RefreshCw size={12} className="mr-1" /> Render</Btn>
        </div>
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-4 bg-transparent outline-none text-xs font-mono text-[var(--text)] leading-relaxed resize-none"
          spellCheck={false}
        />
        <div className="p-4 border-t border-[var(--glass-border)] flex gap-2">
          <Btn small className="flex-1" onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied to clipboard"); }}><Copy size={12} className="mr-1" /> Copy Code</Btn>
          <Btn small onClick={() => setCode(DEFAULT_CODE)} className="text-red-400">Reset</Btn>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8 dot-grid flex items-start justify-center">
        <GlassCard className="p-10 min-w-fit max-w-full">
          <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full" />
        </GlassCard>
      </div>
    </motion.div>
  );
}

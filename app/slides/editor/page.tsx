"use client";

import dynamic from "next/dynamic";
import { useSlidesStore } from "@/stores/slides";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Btn from "@/components/ui/Btn";
import { 
  ChevronLeft, LayoutTemplate, Type, Square, Circle, 
  Image as ImageIcon, Download, Share2, Play, 
  Maximize2, Save, Wand2 
} from "lucide-react";
import { exportSlidesToPDF, exportSlidesToPPTX } from "@/lib/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// Dynamic imports to avoid SSR issues with Konva
const SlideCanvas = dynamic(() => import("@/components/slides/SlideCanvas"), { ssr: false });
const SlidePanel = dynamic(() => import("@/components/slides/SlidePanel"), { ssr: false });
const SlideProps = dynamic(() => import("@/components/slides/SlideProps"), { ssr: false });

export default function SlideEditorPage() {
  const router = useRouter();
  const { decks, activeDeckId, activeSlideIdx, addEl } = useSlidesStore();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 48;
        setScale(Math.min(0.8, w / 1280));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const deck = decks.find((d) => d.id === activeDeckId);
  const slide = deck?.slides[activeSlideIdx];

  if (!mounted) return null;
  if (!deck || !slide) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-[var(--text-soft)]">ไม่พบข้อมูลโปรเจกต์สไลด์ หรือยังไม่ได้เลือกโครงการ</p>
          <Btn primary onClick={() => router.push("/slides")}>กลับไปยังรายการสไลด์</Btn>
        </div>
      </div>
    );
  }

  const handleExport = async (type: "pdf" | "pptx") => {
    toast.promise(
      type === "pdf" 
        ? exportSlidesToPDF(deck.slides, deck.title) 
        : exportSlidesToPPTX(deck.slides, deck.title),
      {
        loading: `กำลังสร้่างไฟล์ ${type.toUpperCase()}...`,
        success: `ดาวน์โหลดไฟล์ ${type.toUpperCase()} สำเร็จ`,
        error: "เกิดข้อผิดพลาดในการส่งออก"
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col overflow-hidden bg-black/10 dark:bg-black/40"
    >
      {/* Editor Top Bar */}
      <header className="h-14 glass border-b border-[var(--glass-border)] flex items-center px-4 gap-4 z-20">
        <button onClick={() => router.push("/slides")} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[var(--text)] truncate">{deck.title}</h1>
          <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
            Slide {activeSlideIdx + 1} of {deck.slides.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex glass rounded-full p-1.5 gap-2 mr-4">
            <button 
              onClick={() => addEl(deck.id, slide.id, { type: "text", x: 100, y: 100, width: 400, height: 80, text: "หัวข้อใหม่", fontSize: 40, fill: "#ffffff", fontWeight: "bold", rotation: 0, opacity: 1, fontFamily: "Inter", align: "left" })}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-soft)] hover:text-[var(--primary)] transition-all" title="Add Text">
              <Type size={16} />
            </button>
            <button 
              onClick={() => addEl(deck.id, slide.id, { type: "rect", x: 100, y: 100, width: 200, height: 200, fill: "#5a8dff", rotation: 0, opacity: 1 })}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-soft)] hover:text-[var(--primary)] transition-all" title="Add Shape">
              <Square size={16} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-soft)] hover:text-[var(--primary)] transition-all" title="Add Image">
              <ImageIcon size={16} />
            </button>
            <div className="w-px h-4 bg-[var(--glass-border)] self-center mx-1" />
            <button className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--violet)] transition-all" title="AI Magic">
              <Wand2 size={16} />
            </button>
          </div>
          
          <Btn small onClick={() => handleExport("pdf")}><Download size={14} className="mr-1" /> PDF</Btn>
          <Btn primary small onClick={() => handleExport("pptx")}><Download size={14} className="mr-1" /> PPTX</Btn>
          <Btn small className="bg-[var(--primary)] h-8 w-8 !p-0"><Play size={14} /></Btn>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <SlidePanel deckId={deck.id} />
        
        <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto dot-grid relative">
          <div className="relative group">
            <SlideCanvas deckId={deck.id} slide={slide} scale={scale} />
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"><Maximize2 size={16} /></button>
              <button className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"><Save size={16} /></button>
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 glass rounded-full px-4 py-2 border border-[var(--glass-border)]">
            <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">-</button>
            <span className="text-[10px] font-bold font-mono min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">+</button>
          </div>
        </div>

        <SlideProps deckId={deck.id} slideId={slide.id} />
      </div>
    </motion.div>
  );
}

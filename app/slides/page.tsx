"use client";

import { useSlidesStore } from "@/stores/slides";
import GlassCard from "@/components/ui/GlassCard";
import Btn from "@/components/ui/Btn";
import { Plus, Presentation, Calendar, Clock, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fmtDate } from "@/lib/utils";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SlidesListPage() {
  const { decks, addDeck, setActiveDeck } = useSlidesStore();
  const router = useRouter();

  const handleCreate = () => {
    const id = addDeck("Untitled Deck");
    setActiveDeck(id);
    router.push(`/slides/editor`);
  };

  return (
    <motion.div 
      className="p-6 max-w-6xl mx-auto space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-4">
        <div>
          <p className="text-xs font-black text-[#818cf8] uppercase tracking-[0.3em] mb-2">Visual Engine</p>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">SLIDE<br/><span className="text-white/20">STUDIO</span></h2>
        </div>
        <Btn primary onClick={handleCreate} className="font-black"><Plus size={16} className="mr-1" /> New Deck Sequence</Btn>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <GlassCard key={deck.id} className="group overflow-hidden flex flex-col h-full border-[var(--glass-border)]">
            <div 
              className="aspect-video w-full flex items-center justify-center p-6 cursor-pointer relative" 
              style={{ background: deck.slides[0]?.background || "var(--glass)" }}
              onClick={() => { setActiveDeck(deck.id); router.push(`/slides/editor`); }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
              <Presentation size={48} className="text-white/20 group-hover:scale-110 transition-transform" />
              <p className="absolute bottom-3 left-4 text-xs font-bold text-white/90 drop-shadow-md truncate w-[80%]">{deck.title}</p>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-[var(--text)] line-clamp-1">{deck.title}</h3>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-5">
                <div className="flex items-center gap-1"><Presentation size={10} /> {deck.slides.length} สไลด์</div>
                <div className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(deck.createdAt)}</div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <Btn 
                  small 
                  onClick={() => { setActiveDeck(deck.id); router.push(`/slides/editor`); }}
                  className="flex-1 mr-2"
                >
                  แก้ไข <ArrowRight size={11} className="ml-1" />
                </Btn>
                <button className="p-2 rounded-full text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}

        {/* Empty State / Create Card */}
        <button 
          onClick={handleCreate}
          className="aspect-[4/5] sm:aspect-auto rounded-2xl border-2 border-dashed border-[var(--glass-border)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--primary)]/20 group-hover:text-[var(--primary)] transition-colors">
            <Plus size={24} />
          </div>
          <p className="text-sm font-semibold text-[var(--text-muted)] group-hover:text-[var(--primary)]">สร้าง Presentation ใหม่</p>
        </button>
      </motion.div>
    </motion.div>
  );
}

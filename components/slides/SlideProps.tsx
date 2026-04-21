"use client";

import { useSlidesStore } from "@/stores/slides";
import GInput from "@/components/ui/GInput";
import * as Tabs from "@radix-ui/react-tabs";
import { AlignLeft, AlignCenter, AlignRight, Bold, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FONTS  = ["Inter", "System UI", "JetBrains Mono", "DM Sans", "Outfit", "Space Grotesk"];
const COLORS = ["#ffffff", "#5a8dff", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#1e1b4b", "#000000"];

export default function SlideProps({ deckId, slideId }: { deckId: string; slideId: string }) {
  const { decks, selectedElId, updateEl, deleteEl, setSelectedEl, updateSlide } = useSlidesStore();
  const deck = decks.find((d) => d.id === deckId);
  const slide = deck?.slides.find((s) => s.id === slideId);
  const el = slide?.elements.find((e) => e.id === selectedElId);

  if (!slide) return null;

  return (
    <div className="glass border-l border-[var(--glass-border)] w-64 flex-shrink-0 flex flex-col pt-3 overflow-hidden">
      <Tabs.Root defaultValue="element" className="flex-1 flex flex-col">
        <Tabs.List className="flex px-3 border-b border-[var(--glass-border)] gap-4 pb-2">
          <Tabs.Trigger value="element" className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] data-[state=active]:text-[var(--primary)] transition-colors">Element</Tabs.Trigger>
          <Tabs.Trigger value="page" className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] data-[state=active]:text-[var(--primary)] transition-colors">Page</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="element" className="p-4 overflow-auto space-y-4">
          {!el ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-[var(--text-muted)]">เลือกวัตถุบนสไลด์เพื่อแก้ไขคุณสมบัติ</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{el.type}</span>
                <button 
                  onClick={() => { deleteEl(deckId, slideId, el.id); setSelectedEl(null); }}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {el.type === "text" && (
                <div className="space-y-3">
                  <GInput label="Text Content" value={el.text || ""} onChange={(e) => updateEl(deckId, slideId, el.id, { text: e.target.value })} />
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Font Style</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select 
                        value={el.fontFamily} 
                        onChange={(e) => updateEl(deckId, slideId, el.id, { fontFamily: e.target.value })}
                        className="glass-input rounded-lg px-2 py-1.5 text-xs"
                      >
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <button 
                        onClick={() => updateEl(deckId, slideId, el.id, { fontWeight: el.fontWeight === "bold" ? "400" : "bold" })}
                        className={cn("glass rounded-lg flex items-center justify-center h-8", el.fontWeight === "bold" && "ring-1 ring-[var(--primary)]")}
                      >
                        <Bold size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {[
                        { icon: AlignLeft,   val: "left" }, 
                        { icon: AlignCenter, val: "center" }, 
                        { icon: AlignRight,  val: "right" }
                      ].map(a => (
                        <button key={a.val} onClick={() => updateEl(deckId, slideId, el.id, { align: a.val })}
                          className={cn("flex-1 glass rounded-lg h-8 flex items-center justify-center", el.align === a.val && "ring-1 ring-[var(--primary)]")}>
                          <a.icon size={13} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <GInput label="Width" type="number" value={Math.round(el.width)} onChange={(e) => updateEl(deckId, slideId, el.id, { width: +e.target.value })} />
                  <GInput label="Height" type="number" value={Math.round(el.height)} onChange={(e) => updateEl(deckId, slideId, el.id, { height: +e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">Fill Color</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLORS.map(c => (
                      <button 
                        key={c} 
                        onClick={() => updateEl(deckId, slideId, el.id, { fill: c })}
                        className={cn("w-full aspect-square rounded-md border border-white/20 transition-all", el.fill === c && "ring-2 ring-white scale-110 shadow-lg")}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Opacity ({Math.round(el.opacity * 100)}%)</label>
                  <input type="range" min="0" max="1" step="0.1" value={el.opacity} onChange={(e) => updateEl(deckId, slideId, el.id, { opacity: +e.target.value })} className="w-full accent-[var(--primary)]" />
                </div>
              </div>
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value="page" className="p-4 overflow-auto space-y-4">
          <GInput label="Slide Title" value={slide.title} onChange={(e) => updateSlide(deckId, slide.id, { title: e.target.value })} />
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Background Gradient</label>
            <textarea 
              value={slide.background} 
              onChange={(e) => updateSlide(deckId, slide.id, { background: e.target.value })}
              className="glass-input w-full rounded-xl px-3 py-2 text-[11px] font-mono h-24"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Presenter Notes</label>
            <textarea 
              value={slide.notes} 
              onChange={(e) => updateSlide(deckId, slide.id, { notes: e.target.value })}
              className="glass-input w-full rounded-xl px-3 py-2 text-xs h-32"
              placeholder="ข้อความสำหรับผู้นำเสนอ..."
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
      <div className="p-4 border-t border-[var(--glass-border)] bg-black/5">
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed italic text-center">
          * การเปลี่ยนแปลงจะถูกบันทึกอัตโนมัติใน Local Storage
        </p>
      </div>
    </div>
  );
}

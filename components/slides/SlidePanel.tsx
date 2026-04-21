"use client";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";
import { useSlidesStore } from "@/stores/slides";
import { cn } from "@/lib/utils";

function Thumb({ slide, index, isActive, onClick, deckId }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });
  const { deleteSlide } = useSlidesStore();
  
  return (
    <div 
      ref={setNodeRef} 
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes} 
      onClick={onClick}
      className={cn(
        "relative rounded-lg overflow-hidden cursor-pointer group mb-2 border-2 transition-all",
        isActive ? "border-[var(--primary)]" : "border-transparent hover:border-[var(--glass-border)]"
      )}
    >
      <div className="aspect-video rounded-lg flex items-end p-2" style={{ background: slide.background, minHeight: 56 }}>
        <p className="text-[9px] font-bold text-white/80 truncate w-full">{index + 1}. {slide.title}</p>
      </div>
      <div {...listeners} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 cursor-grab p-1 rounded text-white/70" style={{ background: "rgba(0,0,0,0.4)" }}>⠿</div>
      <button 
        onClick={(e) => { e.stopPropagation(); deleteSlide(deckId, slide.id); }}
        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1 rounded text-white" 
        style={{ background: "rgba(239,68,68,0.6)" }}
      >
        <Trash2 size={9} />
      </button>
    </div>
  );
}

export default function SlidePanel({ deckId }: { deckId: string }) {
  const { decks, activeSlideIdx, setActiveSlide, addSlide, reorderSlides } = useSlidesStore();
  const deck = decks.find((d) => d.id === deckId);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  
  if (!deck) return null;

  return (
    <div className="glass border-r border-[var(--glass-border)] w-44 flex-shrink-0 overflow-auto p-3">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            const from = deck.slides.findIndex((s) => s.id === active.id);
            const to   = deck.slides.findIndex((s) => s.id === over.id);
            reorderSlides(deckId, from, to);
          }
        }}
      >
        <SortableContext items={deck.slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {deck.slides.map((s, i) => (
            <Thumb 
              key={s.id} 
              slide={s} 
              index={i} 
              deckId={deckId}
              isActive={i === activeSlideIdx} 
              onClick={() => setActiveSlide(i)} 
            />
          ))}
        </SortableContext>
      </DndContext>
      <button 
        onClick={() => addSlide(deckId)}
        className="w-full mt-1 p-2 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] border border-dashed border-[var(--glass-border)] hover:border-[var(--primary)]/40 rounded-lg flex items-center justify-center gap-1 transition-colors"
      >
        <Plus size={11} />สไลด์ใหม่
      </button>
    </div>
  );
}

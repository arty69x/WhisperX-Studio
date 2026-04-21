import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import { randomId } from "@/lib/utils";

export type ElType = "text" | "rect" | "circle";

export interface SlideEl {
  id: string;
  type: ElType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fill?: string;
  align?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface Slide {
  id: string;
  title: string;
  background: string;
  elements: SlideEl[];
  notes: string;
}

export interface Deck {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

const mkEl = (type: ElType, overrides: Partial<SlideEl> = {}): SlideEl => ({
  id: randomId(),
  type,
  x: 100,
  y: 100,
  width: 400,
  height: 80,
  rotation: 0,
  opacity: 1,
  fontSize: 32,
  fill: "#ffffff",
  fontFamily: "Inter",
  fontWeight: "bold",
  align: "left",
  ...overrides,
});

const mkSlide = (title: string, bg: string, els: Partial<SlideEl>[] = []): Slide => ({
  id: randomId(),
  title,
  background: bg,
  notes: "",
  elements: els.map((e) => mkEl(e.type || "text", e)),
});

const DEMO_DECK: Deck = {
  id: "d1",
  title: "HA Digital Healthcare Portal — Proposal",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    mkSlide("Cover", "linear-gradient(135deg,#1e1b4b 0%,#4c1d95 100%)", [
      { type: "text", x: 80, y: 260, width: 960, height: 120, text: "HA Digital Healthcare Portal", fontSize: 60, fill: "#ffffff", fontWeight: "800" },
      { type: "text", x: 80, y: 400, width: 700, height: 50, text: "Digital Transformation Proposal  ·  3,000,000 THB  ·  210 Days", fontSize: 22, fill: "#c4b5fd", fontWeight: "400" },
      { type: "rect", x: 80, y: 220, width: 180, height: 6, fill: "#5a8dff", cornerRadius: 3 },
    ]),
    mkSlide("Overview", "linear-gradient(135deg,#312e81 0%,#5a8dff 100%)", [
      { type: "text", x: 80, y: 80, width: 500, height: 80, text: "Project Overview", fontSize: 48, fill: "#ffffff", fontWeight: "700" },
      { type: "text", x: 80, y: 190, width: 820, height: 420, text: "• 15 Integrated Modules\n• Budget: 3,000,000 THB\n• Timeline: 210 Days  ·  3 Phases\n• Team: 8 Specialists\n• ThaiD + Payment + ERP + Mobile", fontSize: 26, fill: "#e0e7ff", fontWeight: "400" },
    ]),
    mkSlide("Budget", "linear-gradient(135deg,#831843 0%,#ec4899 100%)", [
      { type: "text", x: 80, y: 80, width: 600, height: 80, text: "Investment Breakdown", fontSize: 48, fill: "#ffffff", fontWeight: "700" },
      { type: "rect", x: 80, y: 200, width: 380, height: 64, fill: "rgba(255,255,255,0.14)", cornerRadius: 14 },
      { type: "text", x: 100, y: 218, width: 340, height: 40, text: "Development      ฿ 1,800,000", fontSize: 20, fill: "#fce7f3", fontWeight: "400" },
      { type: "rect", x: 80, y: 284, width: 280, height: 64, fill: "rgba(255,255,255,0.14)", cornerRadius: 14 },
      { type: "text", x: 100, y: 302, width: 240, height: 40, text: "Design            ฿ 600,000", fontSize: 20, fill: "#fce7f3", fontWeight: "400" },
      { type: "rect", x: 80, y: 368, width: 340, height: 64, fill: "rgba(255,255,255,0.14)", cornerRadius: 14 },
      { type: "text", x: 100, y: 386, width: 300, height: 40, text: "Infrastructure    ฿ 600,000", fontSize: 20, fill: "#fce7f3", fontWeight: "400" },
    ]),
  ],
};

interface SlidesState {
  decks: Deck[];
  activeDeckId: string | null;
  activeSlideIdx: number;
  selectedElId: string | null;
  setActiveDeck: (id: string | null) => void;
  setActiveSlide: (idx: number) => void;
  setSelectedEl: (id: string | null) => void;
  addDeck: (title: string) => string;
  addSlide: (deckId: string) => void;
  deleteSlide: (deckId: string, slideId: string) => void;
  reorderSlides: (deckId: string, from: number, to: number) => void;
  addEl: (deckId: string, slideId: string, el: Omit<SlideEl, "id">) => void;
  updateEl: (deckId: string, slideId: string, elId: string, data: Partial<SlideEl>) => void;
  deleteEl: (deckId: string, slideId: string, elId: string) => void;
  updateSlide: (deckId: string, slideId: string, data: Partial<Slide>) => void;
}

export const useSlidesStore = create<SlidesState>()(
  persist(
    (set) => ({
      decks: [DEMO_DECK],
      activeDeckId: "d1",
      activeSlideIdx: 0,
      selectedElId: null,
      setActiveDeck: (id) => set({ activeDeckId: id, activeSlideIdx: 0, selectedElId: null }),
      setActiveSlide: (idx) => set({ activeSlideIdx: idx, selectedElId: null }),
      setSelectedEl: (id) => set({ selectedElId: id }),
      addDeck: (title) => {
        const id = randomId();
        const slide = mkSlide(title, "linear-gradient(135deg,#1e1b4b,#5a8dff)", [
          { type: "text", x: 80, y: 280, width: 960, height: 120, text: title, fontSize: 56, fill: "#ffffff", fontWeight: "800" },
        ]);
        set(
          produce((s: SlidesState) => {
            s.decks.push({ id, title, slides: [slide], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
          })
        );
        return id;
      },
      addSlide: (deckId) =>
        set(
          produce((s: SlidesState) => {
            s.decks.find((d) => d.id === deckId)?.slides.push(mkSlide("New Slide", "linear-gradient(135deg,#1e1b4b,#312e81)"));
          })
        ),
      deleteSlide: (deckId, slideId) =>
        set(
          produce((s: SlidesState) => {
            const d = s.decks.find((d) => d.id === deckId);
            if (d) d.slides = d.slides.filter((sl) => sl.id !== slideId);
          })
        ),
      reorderSlides: (deckId, from, to) =>
        set(
          produce((s: SlidesState) => {
            const d = s.decks.find((d) => d.id === deckId);
            if (!d) return;
            const [item] = d.slides.splice(from, 1);
            d.slides.splice(to, 0, item);
          })
        ),
      addEl: (deckId, slideId, el) =>
        set(
          produce((s: SlidesState) => {
            s.decks
              .find((d) => d.id === deckId)
              ?.slides.find((sl) => sl.id === slideId)
              ?.elements.push({ ...el, id: randomId() });
          })
        ),
      updateEl: (deckId, slideId, elId, data) =>
        set(
          produce((s: SlidesState) => {
            const sl = s.decks.find((d) => d.id === deckId)?.slides.find((sl) => sl.id === slideId);
            const el = sl?.elements.find((e) => e.id === elId);
            if (el) Object.assign(el, data);
          })
        ),
      deleteEl: (deckId, slideId, elId) =>
        set(
          produce((s: SlidesState) => {
            const sl = s.decks.find((d) => d.id === deckId)?.slides.find((sl) => sl.id === slideId);
            if (sl) sl.elements = sl.elements.filter((e) => e.id !== elId);
          })
        ),
      updateSlide: (deckId, slideId, data) =>
        set(
          produce((s: SlidesState) => {
            const sl = s.decks.find((d) => d.id === deckId)?.slides.find((sl) => sl.id === slideId);
            if (sl) Object.assign(sl, data);
          })
        ),
    }),
    { name: "taskos-pro-slides-v1" }
  )
);

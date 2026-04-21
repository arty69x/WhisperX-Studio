"use client";

import { useRef, useEffect } from "react";
import { Stage, Layer, Text, Rect, Transformer } from "react-konva";
import { useSlidesStore, type SlideEl } from "@/stores/slides";

const W = 1280, H = 720;

function TextEl({ el, isSelected, onSelect, deckId, slideId }: any) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const { updateEl } = useSlidesStore();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text 
        ref={shapeRef} 
        id={el.id} 
        x={el.x} 
        y={el.y} 
        width={el.width} 
        height={el.height}
        text={el.text || ""} 
        fontSize={el.fontSize || 28} 
        fill={el.fill || "#fff"}
        fontFamily={el.fontFamily || "Inter"} 
        fontStyle={el.fontWeight === "800" || el.fontWeight === "bold" ? "bold" : "normal"}
        align={el.align || "left"} 
        opacity={el.opacity || 1} 
        rotation={el.rotation || 0}
        draggable 
        onClick={onSelect}
        onDragEnd={(e: any) => updateEl(deckId, slideId, el.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e: any) => {
          const n = shapeRef.current;
          updateEl(deckId, slideId, el.id, {
            x: n.x(),
            y: n.y(),
            width: Math.max(20, n.width() * n.scaleX()),
            height: Math.max(20, n.height() * n.scaleY()),
            rotation: n.rotation()
          });
          n.scaleX(1);
          n.scaleY(1);
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled />}
    </>
  );
}

function RectEl({ el, isSelected, onSelect, deckId, slideId }: any) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const { updateEl } = useSlidesStore();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect 
        ref={shapeRef} 
        id={el.id} 
        x={el.x} 
        y={el.y} 
        width={el.width} 
        height={el.height}
        fill={el.fill || "#5a8dff"} 
        stroke={el.stroke} 
        strokeWidth={el.strokeWidth}
        cornerRadius={el.cornerRadius || 0} 
        opacity={el.opacity || 1} 
        rotation={el.rotation || 0}
        draggable 
        onClick={onSelect}
        onDragEnd={(e: any) => updateEl(deckId, slideId, el.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e: any) => {
          const n = shapeRef.current;
          updateEl(deckId, slideId, el.id, {
            x: n.x(),
            y: n.y(),
            width: Math.max(20, n.width() * n.scaleX()),
            height: Math.max(20, n.height() * n.scaleY()),
            rotation: n.rotation()
          });
          n.scaleX(1);
          n.scaleY(1);
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled />}
    </>
  );
}

export default function SlideCanvas({ deckId, slide, scale = 1 }: { deckId: string; slide: any; scale?: number }) {
  const { selectedElId, setSelectedEl, deleteEl } = useSlidesStore();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElId) {
        if ((e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          deleteEl(deckId, slide.id, selectedElId);
          setSelectedEl(null);
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [selectedElId, deckId, slide.id, deleteEl, setSelectedEl]);

  return (
    <div className="rounded-xl overflow-hidden slide-shadow" style={{ width: W * scale, height: H * scale, background: slide.background }}>
      <Stage 
        width={W * scale} 
        height={H * scale} 
        scaleX={scale} 
        scaleY={scale}
        onMouseDown={(e: any) => { if (e.target === e.target.getStage()) setSelectedEl(null); }}
      >
        <Layer>
          {slide.elements.map((el: SlideEl) => {
            const props = { el, isSelected: selectedElId === el.id, deckId, slideId: slide.id, onSelect: () => setSelectedEl(el.id) };
            if (el.type === "text") return <TextEl key={el.id} {...props} />;
            if (el.type === "rect") return <RectEl key={el.id} {...props} />;
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}

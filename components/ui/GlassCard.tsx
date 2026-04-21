"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface P { 
  children: ReactNode; 
  className?: string; 
  onClick?: () => void; 
  soft?: boolean; 
  hover?: boolean; 
}

export default function GlassCard({ children, className, onClick, soft = false, hover = false }: P) {
  return (
    <div 
      onClick={onClick} 
      className={cn(
        soft ? "soft-card" : "glass-card", 
        "rounded-2xl transition-all", 
        onClick && "cursor-pointer", 
        hover && "hover:brightness-105 hover:scale-[1.005]", 
        className
      )}
    >
      {children}
    </div>
  );
}

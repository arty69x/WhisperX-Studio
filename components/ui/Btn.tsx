"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface P extends ButtonHTMLAttributes<HTMLButtonElement> { 
  children: ReactNode; 
  primary?: boolean; 
  danger?: boolean; 
  small?: boolean; 
}

export default function Btn({ children, primary, danger, small, className = "", ...rest }: P) {
  return (
    <button 
      {...rest} 
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-black uppercase tracking-widest rounded-xl border transition-all active:scale-95",
        small ? "px-3 py-1.5 text-[9px]" : "px-5 py-2.5 text-[11px]",
        primary ? "text-white border-transparent shadow-lg shadow-[#ff2d6b]/40 ring-1 ring-white/20" : 
        danger ? "text-red-400 border-red-400/30 hover:bg-red-400/10" : 
        "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20",
        rest.disabled && "opacity-40 pointer-events-none",
        className
      )} 
      style={primary ? { background: "linear-gradient(135deg, #ff2d6b, #c026d3)" } : undefined}
    >
      {children}
    </button>
  );
}

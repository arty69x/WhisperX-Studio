"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type P = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export default function GInput({ label, className, ...rest }: P) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{label}</label>}
      <input {...rest} className={cn("w-full glass-input rounded-xl px-4 py-2.5 text-sm", className)} />
    </div>
  );
}

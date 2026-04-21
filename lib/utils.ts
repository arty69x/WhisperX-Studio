import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("th-TH", { 
    style: "currency", 
    currency: "THB", 
    maximumFractionDigits: 0 
  }).format(v);

export const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("th-TH", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  }).format(new Date(d));

export const randomId = () => Math.random().toString(36).slice(2, 10);

export const safeJson = <T,>(s: string, fb: T): T => { 
  try { 
    return JSON.parse(s) as T; 
  } catch { 
    return fb; 
  } 
};

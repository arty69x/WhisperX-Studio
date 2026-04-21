"use client";

import { Bell, Search, Command, Moon, Sun, Menu } from "lucide-react";
import { useAppStore } from "@/stores/app";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/kanban": "Kanban Board",
  "/slides": "Slide Studio",
  "/editor": "Rich Editor",
  "/analytics": "Analytics",
  "/flow": "Flow Builder",
  "/mermaid": "Mermaid",
  "/topology": "Topology",
  "/ai": "AI Agent",
  "/ocr": "OCR",
  "/diff": "Diff / Merge",
  "/settings": "Settings",
  "/slides/editor": "Slide Editor",
};

export default function TopBar() {
  const { setCmdkOpen, setSidebarOpen, notifs, theme, setTheme } = useAppStore();
  const pathname = usePathname();
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-white/10 bg-[#0d0018]/50 backdrop-blur-md flex items-center px-8 gap-6 shrink-0 z-30">
      <button onClick={() => setSidebarOpen(true)} className="md:hidden touch-target">
        <Menu size={20} className="text-[var(--text-soft)]" />
      </button>
      <h1 className="text-sm font-black text-white uppercase tracking-[0.2em] hidden md:block">{TITLES[pathname] || "TaskOS"}</h1>
      <div className="flex-1 flex justify-center">
        <button onClick={() => setCmdkOpen(true)} className="w-full max-w-md bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 text-xs text-[var(--text-muted)] hover:border-[var(--primary)]/50 transition-all">
          <Search size={14} className="text-white/30" />
          <span>Search the knowledge matrix...</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-0.5 text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">
            <Command size={8} />K
          </kbd>
        </button>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#00e5a0]/10 border border-[#00e5a0]/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse"></div>
          <span className="text-[10px] font-black text-[#00e5a0] uppercase">SYS ONLINE</span>
        </div>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all">
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="relative">
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all">
            <Bell size={18} />
          </button>
          {unread > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff2d6b] rounded-full border-2 border-[#06000f]"></span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff2d6b] to-[#8b00ff] flex items-center justify-center text-xs font-black ring-1 ring-white/20">P</div>
      </div>
    </header>
  );
}

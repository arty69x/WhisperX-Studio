"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, LayoutDashboard, Columns, Presentation, BarChart3, Workflow, GitBranch, BrainCircuit, ScanText, GitCompare, FileText, Network, Settings } from "lucide-react";
import { useAppStore } from "@/stores/app";

const ROUTES = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kanban", label: "Kanban Board", icon: Columns },
  { href: "/slides", label: "Slide Studio", icon: Presentation },
  { href: "/editor", label: "Rich Editor", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/flow", label: "Flow Builder", icon: Workflow },
  { href: "/mermaid", label: "Mermaid Diagrams", icon: GitBranch },
  { href: "/topology", label: "Network Topology", icon: Network },
  { href: "/ai", label: "AI Agent", icon: BrainCircuit },
  { href: "/ocr", label: "OCR Tool", icon: ScanText },
  { href: "/diff", label: "Diff / Merge", icon: GitCompare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function CommandPalette() {
  const { cmdkOpen, setCmdkOpen } = useAppStore();
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen(!cmdkOpen);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [cmdkOpen, setCmdkOpen]);

  const filtered = ROUTES.filter((r) => r.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog.Root open={cmdkOpen} onOpenChange={setCmdkOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} />
        <Dialog.Content className="fixed top-[18%] left-1/2 -translate-x-1/2 w-full max-w-md glass rounded-2xl z-50 overflow-hidden">
          <Command>
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] px-4 py-3">
              <Search size={15} className="text-[var(--text-muted)]" />
              <Command.Input value={q} onValueChange={setQ} className="flex-1 bg-transparent outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]" placeholder="ค้นหาทุกอย่าง..." autoFocus />
            </div>
            <Command.List className="max-h-64 overflow-auto p-2">
              {filtered.map((r) => (
                <Command.Item key={r.href} onSelect={() => { router.push(r.href); setCmdkOpen(false); setQ(""); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 cursor-pointer text-[var(--text-soft)] hover:text-[var(--text)] transition-colors">
                  <r.icon size={14} className="text-[var(--primary)]" />
                  <span className="text-sm">{r.label}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">{r.href}</span>
                </Command.Item>
              ))}
              {filtered.length === 0 && <div className="p-6 text-center text-sm text-[var(--text-muted)]">ไม่พบ &quot;{q}&quot;</div>}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Columns, Presentation, BarChart3, Workflow,
  GitBranch, BrainCircuit, ScanText, GitCompare, FileText,
  Network, Settings, Sparkles, ChevronRight, LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectsStore } from "@/stores/projects";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, User as UserIcon } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  { href: "/kanban", label: "Kanban Board", icon: Columns, group: "Main" },
  { href: "/slides", label: "Slide Studio", icon: Presentation, group: "Create" },
  { href: "/editor", label: "Rich Editor", icon: FileText, group: "Create" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, group: "Insight" },
  { href: "/flow", label: "Flow Builder", icon: Workflow, group: "Insight" },
  { href: "/mermaid", label: "Mermaid", icon: GitBranch, group: "Insight" },
  { href: "/canvas", label: "Node Designer", icon: Network, group: "Insight" },
  { href: "/ai", label: "AI Agent", icon: BrainCircuit, group: "AI" },
  { href: "/ocr", label: "OCR", icon: ScanText, group: "AI" },
  { href: "/diff", label: "Diff / Merge", icon: GitCompare, group: "AI" },
  { href: "/settings", label: "Settings", icon: Settings, group: "System" },
];

const GROUPS = ["Main", "Create", "Insight", "AI", "System"];

export default function Sidebar() {
  const pathname = usePathname();
  const { projects, activeProjectId } = useProjectsStore();
  const { user, profile, logout } = useAuth();
  const active = projects.find((p) => p.id === activeProjectId);

  return (
    <aside className="hidden md:flex flex-col w-[var(--sidebar-w)] bg-[#0d0018]/80 backdrop-blur-xl border-r border-white/10 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2d6b] to-[#8b00ff] flex items-center justify-center shadow-lg shadow-[#ff2d6b]/20">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <div className="text-lg font-black tracking-tight text-white uppercase leading-tight">TASKOS</div>
          <div className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase">NEXUS PRO v2</div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 overflow-auto py-4">
        {GROUPS.map((group) => {
          const items = NAV.filter((n) => n.group === group);
          const groupColor = group === "Main" ? "#ff2d6b" : group === "Create" ? "#818cf8" : group === "Insight" ? "#00e5a0" : "#44d4ff";
          return (
            <div key={group} className="mb-6 px-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: groupColor }}>{group}</p>
              <div className="space-y-1">
                {items.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                  return (
                    <Link key={href} href={href} className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                      isActive 
                        ? "bg-white/10 border border-white/10 text-white font-semibold" 
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    )}>
                      <Icon size={16} className={cn(isActive && "text-[var(--primary)]")} />
                      <span>{label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto opacity-40" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        {/* Active project */}
        {active && (
          <div className="mt-2 pt-3 border-t border-[var(--glass-border)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] px-3 mb-2">Active Project</p>
            <div className="soft-card rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: active.color }} />
                <p className="text-xs font-semibold text-[var(--text)] truncate">{active.title}</p>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: active.progress + "%", background: active.color }} />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{active.progress}% complete</p>
            </div>
          </div>
        )}
      </nav>
      {/* User */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        {user ? (
          <div className="soft-card rounded-xl p-3 flex items-center gap-3">
            <Link href="/profile" className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-[var(--primary)] to-[var(--pink)]">
              {profile?.displayName?.[0] || user.email?.[0]?.toUpperCase()}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text)] truncate">{profile?.displayName || "Agent"}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</div>
            </div>
            <button onClick={logout} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-[var(--secondary)] transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--primary)]/20 transition-all">
            <LogIn size={14} />
            <span>Identify</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

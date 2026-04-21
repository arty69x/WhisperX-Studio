"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Columns, Presentation, BarChart3, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/kanban", icon: Columns, label: "Kanban" },
  { href: "/slides", icon: Presentation, label: "Slides" },
  { href: "/analytics", icon: BarChart3, label: "Charts" },
  { href: "/ai", icon: BrainCircuit, label: "AI" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--glass-border)] z-40 pb-safe">
      <div className="flex h-16 items-center">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-medium transition-colors",
              active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
            )}>
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

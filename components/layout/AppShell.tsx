"use client";

import { ReactNode, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/stores/app";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";
import CommandPalette from "./CommandPalette";
import { Toaster } from "sonner";

export default function AppShell({ children }: { children: ReactNode }) {
  const { theme } = useAppStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <MobileNav />
      <CommandPalette />
      <Toaster position="top-right" richColors theme={theme as any} />
    </div>
  );
}

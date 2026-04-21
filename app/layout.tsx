import type { Metadata } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter" 
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "TaskOS Pro — High Density Studio",
  description: "Advanced PM Studio with Kanban, AI Agent, Slide Studio, and Node Designer. Featuring high-density design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${syne.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="bottom-right" theme="dark" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

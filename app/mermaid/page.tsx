"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const MermaidInner = dynamic(() => import("@/components/mermaid/MermaidInner"), { ssr: false });

export default function MermaidPage() {
  return (
    <div className="h-full w-full">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--primary)]" />
        </div>
      }>
        <MermaidInner />
      </Suspense>
    </div>
  );
}

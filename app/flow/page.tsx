"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const FlowInner = dynamic(() => import("@/components/flow/FlowInner"), { ssr: false });

export default function FlowPage() {
  return (
    <div className="h-full w-full">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--primary)]" />
        </div>
      }>
        <FlowInner />
      </Suspense>
    </div>
  );
}

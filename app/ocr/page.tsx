"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const OCRInner = dynamic(() => import("@/components/ocr/OCRInner"), { ssr: false });

export default function OCRPage() {
  return (
    <div className="h-full w-full">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--primary)]" />
        </div>
      }>
        <OCRInner />
      </Suspense>
    </div>
  );
}

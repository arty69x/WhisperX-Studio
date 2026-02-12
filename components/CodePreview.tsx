
import React from 'react';
import { logger } from '../services/loggerService';

interface CodePreviewProps {
  code: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code }) => {
  return (
    <div className="prism-card w-full overflow-hidden bg-white">
      <div className="px-4 py-2 border-b-2 border-black flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full blink"></div>
          <span className="text-[9px] font-black uppercase tracking-widest italic">ARTIFACT_SOURCE_LOCKED</span>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(code);
            logger.info("Kernel: Artifact source exported.");
          }}
          className="text-[9px] font-black uppercase bg-black text-white px-3 py-1 skew-x-[-10deg] hover:bg-red-600 transition-colors"
        >
          COPY_BUFFER
        </button>
      </div>
      <pre className="p-4 overflow-x-auto mono text-[11px] leading-relaxed bg-white text-black font-medium">
        <code>{code || '// AWAITING_KERNEL_RESPONSE...'}</code>
      </pre>
    </div>
  );
};

export default CodePreview;

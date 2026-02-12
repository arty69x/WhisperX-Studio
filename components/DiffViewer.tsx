import React from 'react';

interface DiffViewerProps {
  diff: string;
  filename: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diff, filename }) => {
  const lines = diff.split('\n');

  return (
    <div className="bg-black/80 rounded-2xl border border-white/10 overflow-hidden font-mono text-[11px] leading-relaxed shadow-2xl">
      <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Diff: {filename}</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
        </div>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar-thin">
        {lines.map((line, i) => {
          const isAddition = line.startsWith('+');
          const isDeletion = line.startsWith('-');
          const bgColor = isAddition ? 'bg-emerald-500/10' : isDeletion ? 'bg-red-500/10' : '';
          const textColor = isAddition ? 'text-emerald-400' : isDeletion ? 'text-red-400' : 'text-gray-500';

          return (
            <div key={i} className={`flex gap-4 px-2 py-0.5 rounded ${bgColor}`}>
              <span className="w-8 text-right shrink-0 opacity-20 select-none">{(i + 1).toString().padStart(2, '0')}</span>
              <span className={`whitespace-pre-wrap break-all ${textColor}`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiffViewer;

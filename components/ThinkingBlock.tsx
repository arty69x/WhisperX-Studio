
import React, { useState } from 'react';

interface ThinkingBlockProps {
  thinking: string;
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ thinking }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thinking) return null;

  return (
    <div className="prism-card bg-white w-full overflow-hidden transition-all">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full px-4 py-3 flex items-center justify-between bg-black text-white hover:bg-gray-800 transition-all"
      >
        <div className="flex items-center gap-4">
          <i className="fas fa-brain text-sm"></i>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">NEURAL_CORE_TRACE</span>
        </div>
        <i className={`fas fa-chevron-down text-[10px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
      </button>
      
      {isExpanded && (
        <div className="p-4 mono text-[11px] leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar-thin bg-white text-gray-800 font-bold uppercase">
          {thinking.split('\n').map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-gray-300 w-4 text-right opacity-30 select-none">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;

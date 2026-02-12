
import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '../types';

interface TerminalProps {
  onCommand: (cmd: string) => void;
  lines: TerminalLine[];
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, lines }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onCommand(input);
    setInput('');
  };

  return (
    <div className="w-full h-full bg-black text-white p-3 md:p-6 mono text-[10px] md:text-[11px] flex flex-col overflow-hidden border-4 border-black prism-shadow">
      <header className="flex items-center justify-between border-b border-white/20 pb-2 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <i className="fas fa-terminal text-yellow-400"></i>
          <span className="font-black uppercase tracking-widest text-[8px] md:text-[9px]">WhisperX_Kernel_Shell v2.5.0_LTS</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar-thin pr-2 pb-4" ref={scrollRef}>
        <div className="text-gray-500 mb-4 select-none">
          SYSTEM_BOOT_SEQUENCE_COMPLETE<br/>
          WHISPERX_BASH_EMULATOR_ACTIVE // พิมพ์ 'help' เพื่อดูคำสั่ง
        </div>
        
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className={`shrink-0 select-none ${
              line.type === 'cmd' ? 'text-green-500' : 
              line.type === 'error' ? 'text-red-500' : 
              line.type === 'system' ? 'text-yellow-400' : 'text-gray-300'
            }`}>
              {line.type === 'cmd' ? '➜' : line.type === 'system' ? '⚙' : line.type === 'error' ? '✘' : ' '}
            </span>
            <span className="whitespace-pre-wrap break-all uppercase font-bold tracking-tight">
              {line.content}
            </span>
          </div>
        ))}
        
        {/* Cursor anchor */}
        <div className="h-4"></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2 border-t border-white/20 pt-4 shrink-0">
        <span className="text-green-500 font-black select-none shrink-0">whisperx@root:~$</span>
        <input 
          autoFocus
          className="flex-1 bg-transparent outline-none text-white uppercase font-bold border-none p-0 focus:ring-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      
      <style>{`
        .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
};

export default Terminal;


import React, { useState, useEffect } from 'react';
import { logger } from '../services/loggerService';
import { LogEntry } from '../types';

interface ErrorToastProps {
  onOpenLogs?: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ onOpenLogs }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    return logger.subscribe((newLogs) => {
      setLogs(newLogs);
      const latest = newLogs[0];
      if (latest && latest.level === 'error') {
        setIsVisible(true);
        setShowStack(false);
        // Automatic hide timer
        const timer = setTimeout(() => setIsVisible(false), 12000);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const latestError = logs.find(l => l.level === 'error');

  if (!latestError || !isVisible) return null;

  return (
    <div className="fixed bottom-12 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-500 w-full max-w-md">
      <div className="glass bg-red-950/60 border-red-500/50 p-6 rounded-[2rem] flex flex-col gap-4 shadow-[0_30px_60px_-15px_rgba(239,68,68,0.4)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <i className="fas fa-microchip text-red-500 animate-pulse text-lg"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">Critical Engine Fault</h4>
              <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white transition-colors">
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <p className="text-sm text-red-100 font-bold leading-relaxed mb-4">
              {latestError.message}
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => {
                  setIsVisible(false);
                  onOpenLogs?.();
                }}
                className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 flex items-center gap-2"
              >
                <i className="fas fa-terminal"></i>
                Debug Console
              </button>
              
              {latestError.stack && (
                <button 
                  onClick={() => setShowStack(!showStack)}
                  className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white flex items-center gap-2"
                >
                  <i className={`fas ${showStack ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  {showStack ? 'Hide Trace' : 'View Trace'}
                </button>
              )}
              
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white flex items-center gap-2 ml-auto"
              >
                <i className="fas fa-sync"></i>
                Reboot
              </button>
            </div>
          </div>
        </div>

        {showStack && latestError.stack && (
          <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 animate-in slide-in-from-top-4 duration-300">
             <pre className="text-[9px] font-mono text-gray-400 overflow-x-auto custom-scrollbar-thin max-h-40 leading-tight">
                {latestError.stack}
             </pre>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ErrorToast;

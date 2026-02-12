
import React, { useState } from 'react';
import { GitStatus } from '../types';
import { logger } from '../services/loggerService';

interface GitTabProps {
  status: GitStatus;
  onAction: (action: string, payload?: any) => void;
}

const GitTab: React.FC<GitTabProps> = ({ status, onAction }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [token, setToken] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  const handleSync = async (type: string) => {
    setIsSyncing(true);
    logger.info(`Git: Initializing ${type.toUpperCase()}...`);
    await new Promise(r => setTimeout(r, 1500));
    onAction(type);
    setIsSyncing(false);
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    onAction('commit', commitMessage);
    setCommitMessage('');
  };

  const handleAgentAudit = () => {
    logger.info("Git: Requesting neural audit of current staging manifest...");
    // This would ideally trigger the Agent to analyze the diffs
  };

  if (!status.isInitialized) {
    return (
      <div className="w-full max-w-3xl mx-auto p-12 flex flex-col items-center justify-center h-[60vh]">
        <div className="prism-card p-12 bg-white flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-black text-white flex items-center justify-center prism-shadow">
             <i className="fas fa-folder-plus text-4xl"></i>
           </div>
           <div>
             <h2 className="text-3xl font-black italic uppercase tracking-tighter">Repository_Offline</h2>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">
               Version control kernel not active. Initialize to track agentic changes.
             </p>
           </div>
           <button 
             onClick={() => onAction('init')}
             className="prism-btn-black px-12 py-5 text-sm prism-shadow-active transition-all"
           >
             INITIALIZE_GIT_KERNEL
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Repository_Control</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase skew-x-[-15deg]">
              {status.branch}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Origin: origin/main
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAgentAudit}
            className="prism-btn-black px-4 py-2 text-[10px] bg-yellow-400 text-black border-black prism-shadow-active"
          >
            <i className="fas fa-brain"></i> AGENT_AUDIT
          </button>
          <button onClick={() => handleSync('push')} disabled={isSyncing} className="prism-btn-black px-4 py-2 text-[10px] prism-shadow-active">
            <i className="fas fa-arrow-up"></i> PUSH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="prism-card p-4 space-y-4">
          <h4 className="text-[10px] font-black uppercase border-b-2 border-black pb-2">Unstaged_Changes</h4>
          {status.modifiedFiles.map(f => (
            <div key={f} className="flex items-center justify-between p-2 border-2 border-black bg-white group hover:bg-gray-50">
              <span className="mono text-[10px] font-bold">{f}</span>
              <button onClick={() => onAction('stage', f)} className="bg-black text-white text-[8px] px-2 py-1 uppercase font-black">Stage</button>
            </div>
          ))}
          {status.modifiedFiles.length === 0 && <p className="text-[9px] italic text-gray-400">No modified artifacts.</p>}
        </div>

        <div className="prism-card p-4 space-y-4 bg-green-50/50">
          <h4 className="text-[10px] font-black uppercase border-b-2 border-black pb-2">Staged_Manifest</h4>
          {status.stagedFiles.map(f => (
            <div key={f} className="flex items-center justify-between p-2 border-2 border-green-600 bg-white">
              <span className="mono text-[10px] font-bold text-green-700">{f}</span>
              <button onClick={() => onAction('unstage', f)} className="bg-white border-2 border-black text-black text-[8px] px-2 py-1 uppercase font-black">Unstage</button>
            </div>
          ))}
          <div className="mt-4 space-y-2">
            <input 
              placeholder="COMMIT_MESSAGE..." 
              value={commitMessage}
              onChange={e => setCommitMessage(e.target.value)}
              className="w-full p-2 border-4 border-black mono text-[10px] uppercase font-bold outline-none"
            />
            <button 
              onClick={handleCommit}
              disabled={status.stagedFiles.length === 0 || !commitMessage.trim()}
              className="w-full bg-black text-white py-3 text-[10px] font-black uppercase prism-shadow-active disabled:opacity-30"
            >
              COMMIT_STAGED_ARTIFACTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitTab;

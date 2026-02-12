
import React, { useState } from 'react';
import { AgentRole } from '../types';

interface EditorActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, role: AgentRole, file?: File) => void;
}

const EditorActionModal: React.FC<EditorActionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [role, setRole] = useState<AgentRole>(AgentRole.FRONTEND);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="prism-card w-full max-w-lg bg-white overflow-hidden animate-in zoom-in duration-200">
        <header className="bg-black text-white p-4 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">AI_EDITOR_COMMAND_INTERCEPTOR</h3>
          <button onClick={onClose} className="hover:text-red-500"><i className="fas fa-times"></i></button>
        </header>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(AgentRole).map(r => (
              <button 
                key={r}
                onClick={() => setRole(r)}
                className={`p-3 border-2 border-black text-[9px] font-black uppercase transition-all ${role === r ? 'bg-yellow-400 prism-shadow' : 'bg-white opacity-50'}`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black uppercase text-gray-400">Command_Instruction</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full h-32 border-4 border-black p-4 mono text-xs font-bold uppercase outline-none focus:bg-gray-50 transition-all resize-none"
              placeholder="DESCRIBE_THE_TRANSFORMATION..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black uppercase text-gray-400">Contextual_Data_Upload</label>
            <div className="border-4 border-dashed border-black p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-all relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <i className="fas fa-file-upload text-xl"></i>
              <span className="text-[9px] font-black uppercase">{file ? file.name : 'DROP_MANIFEST_OR_SPEC'}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              onSubmit(prompt, role, file || undefined);
              onClose();
            }}
            className="w-full py-4 bg-black text-white font-black uppercase text-[10px] prism-shadow-active hover:bg-red-600 transition-colors"
          >
            EXECUTE_AGENT_SEQUENCE
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorActionModal;

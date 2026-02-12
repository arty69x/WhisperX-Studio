
import React from 'react';
import { AgentStep, AgentRole } from '../types';

interface AgentPipelineProps {
  steps: AgentStep[];
}

const AgentPipeline: React.FC<AgentPipelineProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  const getRoleIcon = (role?: AgentRole) => {
    switch (role) {
      case AgentRole.ARCHITECT: return 'fa-drafting-compass';
      case AgentRole.FRONTEND: return 'fa-palette';
      case AgentRole.DEVOPS: return 'fa-server';
      case AgentRole.DEBUGGER: return 'fa-bug';
      case AgentRole.GIT_MANAGER: return 'fa-code-branch';
      default: return 'fa-robot';
    }
  };

  return (
    <div className="prism-card p-4 bg-white space-y-4 border-l-8 border-l-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-project-diagram text-indigo-600"></i>
          Execution_Pipeline
        </h3>
        <span className="text-[9px] font-black text-gray-400">STATUS: {steps.every(s => s.status === 'complete') ? 'TERMINATED' : 'STREAMING'}</span>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {steps.map((step, idx) => (
          <div key={step.id} className={`flex items-start gap-4 p-3 border-2 border-black transition-all ${
            step.status === 'active' ? 'bg-yellow-400 prism-shadow' : 
            step.status === 'complete' ? 'bg-gray-50 opacity-50' : 'bg-white'
          }`}>
            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 border-black ${
              step.status === 'complete' ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
              <i className={`fas ${getRoleIcon(step.role)} text-xs`}></i>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black uppercase tracking-tighter truncate">{step.label}</span>
                {step.status === 'active' && <i className="fas fa-sync animate-spin text-[8px]"></i>}
                {step.status === 'complete' && <i className="fas fa-check text-[8px] text-green-600"></i>}
              </div>
              <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    step.status === 'complete' ? 'w-full bg-green-500' : 
                    step.status === 'active' ? 'w-1/2 bg-yellow-600 animate-pulse' : 'w-0'
                  }`}
                ></div>
              </div>
              {step.details && (
                <p className="mt-2 text-[8px] font-bold text-gray-500 uppercase leading-tight italic">
                  &gt; {step.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentPipeline;

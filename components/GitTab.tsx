import React from 'react';
import { AgentJobStatus } from '../types';

interface GitTabProps {
  data: {
    branch: string;
    changedFiles: string[];
    latestJob?: AgentJobStatus | null;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

const statusColor: Record<string, string> = {
  queued: 'bg-gray-200 text-gray-700',
  running: 'bg-yellow-200 text-yellow-800',
  completed: 'bg-green-200 text-green-800',
  failed: 'bg-red-200 text-red-700'
};

const GitTab: React.FC<GitTabProps> = ({ data, isLoading, onRefresh }) => {
  const job = data.latestJob;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Repository_Control</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase skew-x-[-15deg]">
              {data.branch || 'unknown'}
            </span>
            {job && (
              <span className={`px-3 py-1 text-[10px] font-black uppercase ${statusColor[job.status]}`}>
                JOB: {job.status}
              </span>
            )}
          </div>
        </div>
        <button onClick={onRefresh} className="prism-btn-black px-4 py-2 text-[10px] prism-shadow-active">
          <i className={`fas ${isLoading ? 'fa-spinner animate-spin' : 'fa-rotate'}`}></i> REFRESH
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="prism-card p-4 space-y-4">
          <h4 className="text-[10px] font-black uppercase border-b-2 border-black pb-2">Changed_Files</h4>
          {data.changedFiles.map((f) => (
            <div key={f} className="p-2 border-2 border-black bg-white">
              <span className="mono text-[10px] font-bold">{f}</span>
            </div>
          ))}
          {data.changedFiles.length === 0 && <p className="text-[9px] italic text-gray-400">No changed files.</p>}
        </div>

        <div className="prism-card p-4 space-y-4 bg-blue-50/50">
          <h4 className="text-[10px] font-black uppercase border-b-2 border-black pb-2">Latest_Agent_Job</h4>
          {!job && <p className="text-[9px] italic text-gray-400">No job started yet.</p>}
          {job && (
            <>
              <p className="mono text-[10px] font-bold">JOB_ID: {job.jobId}</p>
              <div className="space-y-2">
                {job.steps.map((step) => (
                  <div key={step.id} className="p-2 border-2 border-black bg-white text-[10px] font-bold">
                    {step.label} — {step.status.toUpperCase()}
                  </div>
                ))}
              </div>
              {job.prUrl && (
                <a href={job.prUrl} target="_blank" rel="noreferrer" className="text-[10px] underline font-black text-indigo-700 break-all">
                  PR_URL: {job.prUrl}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitTab;

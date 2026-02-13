
export enum AppTab {
  BUILD = 'BUILD',
  VISUAL = 'VISUAL',
  GIT = 'GIT',
  EDITOR = 'EDITOR',
  SETTINGS = 'SETTINGS',
  TERMINAL = 'TERMINAL'
}

export enum AgentRole {
  ARCHITECT = 'ARCHITECT',
  FRONTEND = 'FRONTEND',
  GIT_MANAGER = 'GIT_MANAGER',
  DEBUGGER = 'DEBUGGER',
  DEVOPS = 'DEVOPS'
}

export enum AgentMode {
  SOLO = 'SOLO',
  MULTI = 'MULTI'
}

export type RuntimeStatus = 'IDLE' | 'BOOTING' | 'RUNNING' | 'CRASHED';

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  timestamp: number;
  details?: string;
  role?: AgentRole;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  thinking?: string;
  steps?: AgentStep[];
  codeArtifact?: string;
  agentRole?: AgentRole;
}

export interface GitStatus {
  branch: string;
  branches: string[];
  stagedFiles: string[];
  modifiedFiles: string[];
  isInitialized: boolean;
  isGitHubConnected: boolean;
  githubUser?: string;
  remoteUrl?: string;
  aheadCount: number;
  behindCount: number;
  lastSync?: number;
}

export type AgentJobState = 'queued' | 'running' | 'completed' | 'failed';
export type AgentErrorCode = 'GITHUB_TOKEN_INVALID' | 'RATE_LIMIT' | 'CONFLICT' | 'VALIDATION_FAIL' | 'UNKNOWN';

export interface AgentJobError {
  code: AgentErrorCode;
  message: string;
}

export interface AgentJobStatus {
  jobId: string;
  status: AgentJobState;
  steps: AgentStep[];
  branch: string;
  changedFiles: string[];
  prUrl?: string;
  error?: AgentJobError;
}

export interface LogEntry {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  timestamp: number;
}

export interface TerminalLine {
  id: string;
  type: 'cmd' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

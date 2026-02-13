import { execSync } from 'node:child_process';

interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  timestamp: number;
}

type AgentJobState = 'queued' | 'running' | 'completed' | 'failed';
type AgentErrorCode = 'GITHUB_TOKEN_INVALID' | 'RATE_LIMIT' | 'CONFLICT' | 'VALIDATION_FAIL' | 'UNKNOWN';

interface AgentJob {
  jobId: string;
  status: AgentJobState;
  steps: AgentStep[];
  branch: string;
  changedFiles: string[];
  prUrl?: string;
  error?: { code: AgentErrorCode; message: string };
  createdAt: number;
}

const globalStore = globalThis as typeof globalThis & { __agentJobs?: Map<string, AgentJob> };
if (!globalStore.__agentJobs) {
  globalStore.__agentJobs = new Map<string, AgentJob>();
}

const jobs = globalStore.__agentJobs;

const readGitMetadata = () => {
  const safeExec = (cmd: string, fallback = '') => {
    try {
      return execSync(cmd, { encoding: 'utf8' }).trim();
    } catch {
      return fallback;
    }
  };

  const branch = safeExec('git rev-parse --abbrev-ref HEAD', 'unknown');
  const changedFiles = safeExec('git status --porcelain')
    .split('\n')
    .map(line => line.trim().slice(3).trim())
    .filter(Boolean);

  return { branch, changedFiles };
};

const createSteps = (mode: string): AgentStep[] => {
  const now = Date.now();
  if (mode === 'MULTI') {
    return [
      { id: '1', label: 'วิเคราะห์โครงสร้าง (Analysis)', status: 'pending', timestamp: now },
      { id: '2', label: 'สังเคราะห์ส่วนหน้า (Frontend)', status: 'pending', timestamp: now },
      { id: '3', label: 'ตรวจสอบระบบ (Validation)', status: 'pending', timestamp: now }
    ];
  }
  return [{ id: '1', label: 'ประมวลผลงาน: FRONTEND', status: 'pending', timestamp: now }];
};

const toError = (code: AgentErrorCode, message: string) => ({ code, message });

const resolveSimulatedError = (instruction: string): { code: AgentErrorCode; message: string } | undefined => {
  const text = instruction.toLowerCase();
  if (text.includes('rate limit')) return toError('RATE_LIMIT', 'GitHub API rate limit exceeded. Please wait and retry.');
  if (text.includes('conflict')) return toError('CONFLICT', 'Merge conflict detected in generated branch.');
  if (text.includes('validation fail')) return toError('VALIDATION_FAIL', 'Validation failed: workflow checks did not pass.');
  return undefined;
};

const validateGithubToken = async (token?: string): Promise<{ valid: boolean; rateLimited?: boolean }> => {
  if (!token) return { valid: false };
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });

  if (response.status === 401) return { valid: false };
  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
    return { valid: true, rateLimited: true };
  }

  return { valid: response.ok };
};

const runJob = (jobId: string, requestedError?: { code: AgentErrorCode; message: string }) => {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'running';
  jobs.set(jobId, { ...job });

  let currentStep = 0;
  const interval = setInterval(() => {
    const latest = jobs.get(jobId);
    if (!latest) {
      clearInterval(interval);
      return;
    }

    latest.steps = latest.steps.map((step, idx) => {
      if (idx < currentStep) return { ...step, status: 'complete' };
      if (idx === currentStep) return { ...step, status: 'active' };
      return step;
    });

    if (requestedError && currentStep === latest.steps.length - 1) {
      latest.status = 'failed';
      latest.steps = latest.steps.map((step, idx) => idx === currentStep ? { ...step, status: 'error' } : step);
      latest.error = requestedError;
      jobs.set(jobId, { ...latest });
      clearInterval(interval);
      return;
    }

    if (currentStep >= latest.steps.length) {
      latest.status = 'completed';
      latest.prUrl = process.env.MOCK_PR_URL || `https://github.com/example/repo/pull/${Math.floor(Math.random() * 900 + 100)}`;
      latest.steps = latest.steps.map(step => ({ ...step, status: 'complete' }));
      jobs.set(jobId, { ...latest });
      clearInterval(interval);
      return;
    }

    jobs.set(jobId, { ...latest });
    currentStep += 1;
  }, 1200);
};

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const jobId = req.query?.jobId as string | undefined;
    if (jobId) {
      const job = jobs.get(jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      return res.status(200).json(job);
    }

    const repo = readGitMetadata();
    const latestJob = [...jobs.values()].sort((a, b) => b.createdAt - a.createdAt)[0];
    return res.status(200).json({ branch: repo.branch, changedFiles: repo.changedFiles, latestJob });
  }

  if (req.method === 'POST') {
    const { instruction = '', mode = 'SOLO', githubToken } = req.body || {};
    const { branch, changedFiles } = readGitMetadata();

    const tokenCheck = await validateGithubToken(githubToken || process.env.GITHUB_TOKEN);
    if (!tokenCheck.valid) {
      return res.status(401).json({
        error: toError('GITHUB_TOKEN_INVALID', 'GitHub token is invalid or missing.'),
        branch,
        changedFiles
      });
    }

    if (tokenCheck.rateLimited) {
      return res.status(429).json({
        error: toError('RATE_LIMIT', 'GitHub API rate limit exceeded. Please wait before retrying.'),
        branch,
        changedFiles
      });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: AgentJob = {
      jobId,
      status: 'queued',
      steps: createSteps(mode),
      branch,
      changedFiles,
      createdAt: Date.now()
    };

    jobs.set(jobId, job);
    runJob(jobId, resolveSimulatedError(instruction));

    return res.status(202).json(job);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

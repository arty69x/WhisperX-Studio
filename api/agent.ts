import { GuardError, validateOutputSchema } from '../src/guard/validate.ts';
import { GitHubRepoClient, createAiBranchName, GitHubApiError } from '../src/repo/github.ts';
import { geminiGenerateText } from '../src/llm/gemini.ts';
import { openAIGenerateText } from '../src/llm/openai.ts';
import { ollamaGenerateText } from '../src/llm/ollama.ts';

type Provider = 'gemini' | 'openai' | 'ollama';

export type AgentValidationCode = 'AGENT_REQUEST_INVALID' | 'AGENT_RESPONSE_INVALID';

export class AgentValidationError extends Error {
  public readonly code: AgentValidationCode;
  public readonly causeCode?: string;

  constructor(code: AgentValidationCode, message: string, causeCode?: string) {
    super(message);
    this.name = 'AgentValidationError';
    this.code = code;
    this.causeCode = causeCode;
  }
}

const toAgentValidationError = (code: AgentValidationCode, error: unknown): AgentValidationError => {
  if (error instanceof GuardError) {
    return new AgentValidationError(code, error.message, error.code);
  }

  const message = error instanceof Error ? error.message : 'Unknown validation error';
  return new AgentValidationError(code, message);
};

export const validateAgentRequest = (value: unknown) => {
  try {
    return validateOutputSchema(value);
  } catch (error) {
    throw toAgentValidationError('AGENT_REQUEST_INVALID', error);
  }
};

export const validateAgentResponse = (value: unknown) => {
  try {
    return validateOutputSchema(value);
  } catch (error) {
    throw toAgentValidationError('AGENT_RESPONSE_INVALID', error);
  }
};


type JobState = 'queued' | 'running' | 'completed' | 'failed';

interface AgentJob {
  jobId: string;
  status: JobState;
  steps: Array<{ id: string; label: string; status: 'pending' | 'active' | 'complete' | 'error'; timestamp: number }>;
  branch: string;
  changedFiles: string[];
  prUrl?: string;
  error?: { code: string; message: string };
}

let latestJob: AgentJob | null = null;

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
};

const splitRepo = (full: string): { owner: string; repo: string } => {
  const [owner, repo] = full.split('/');
  if (!owner || !repo) {
    throw new Error('GH_REPO must be in owner/repo format');
  }
  return { owner, repo };
};

const parseJsonOutput = (raw: string): unknown => {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return JSON.parse(fenced[1]);

  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('LLM output did not include JSON object');
  }

  return JSON.parse(raw.slice(first, last + 1));
};

const runPreflight = async () => {
  if (!process.env.PREFLIGHT_ENDPOINT) {
    return { ok: true, results: [{ command: 'preflight', output: 'Skipped (PREFLIGHT_ENDPOINT not configured)' }] };
  }

  const response = await fetch(process.env.PREFLIGHT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commands: ['npm run build', 'npm test'] }),
  });

  if (!response.ok) {
    throw new Error(`Preflight failed (${response.status})`);
  }

  return response.json();
};

const generatePatch = async (provider: Provider, task: string): Promise<string> => {
  const systemInstruction = [
    'You are a code generation engine.',
    'Return JSON only with exact shape: {"files":[{"path":"src/file.ts","content":"FULL FILE CONTENT"}]}',
    'Do not include markdown outside JSON.',
    'Only generate files under src/, components/, services/, or api/.',
  ].join(' ');

  const prompt = `Task: ${task}`;

  if (provider === 'openai') return openAIGenerateText(prompt, systemInstruction);
  if (provider === 'ollama') return ollamaGenerateText(prompt, systemInstruction);
  return geminiGenerateText(prompt, systemInstruction);
};

const handleProviderProxy = async (body: any) => {
  const provider = (body.provider || 'gemini') as Provider;
  if (body.action !== 'chat') {
    throw new Error('Unsupported provider action');
  }

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
    const model = 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  if (provider === 'openai') {
    return openAIGenerateText(body.payload?.prompt || '', body.payload?.systemInstruction || '');
  }

  return ollamaGenerateText(body.payload?.prompt || '', body.payload?.systemInstruction || '');
};

const newJob = (): AgentJob => ({
  jobId: `job_${Date.now()}`,
  status: 'queued',
  branch: 'n/a',
  changedFiles: [],
  steps: [
    { id: '1', label: 'Analyze task', status: 'pending', timestamp: Date.now() },
    { id: '2', label: 'Generate patch JSON', status: 'pending', timestamp: Date.now() },
    { id: '3', label: 'Validate patch', status: 'pending', timestamp: Date.now() },
    { id: '4', label: 'Run preflight', status: 'pending', timestamp: Date.now() },
    { id: '5', label: 'Commit & open PR', status: 'pending', timestamp: Date.now() },
  ],
});

const setStep = (job: AgentJob, idx: number, status: 'pending' | 'active' | 'complete' | 'error') => {
  job.steps = job.steps.map((step, i) => (i === idx ? { ...step, status } : step));
};

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return json(res, 200, {
      branch: latestJob?.branch || 'unknown',
      changedFiles: latestJob?.changedFiles || [],
      latestJob,
    });
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (body?.provider && body?.action) {
      const proxyResult = await handleProviderProxy(body);
      return json(res, 200, proxyResult);
    }

    const instruction = String(body?.instruction || body?.task || '').trim();
    if (!instruction) {
      return json(res, 400, { error: { code: 'AGENT_REQUEST_INVALID', message: 'instruction/task is required' } });
    }

    const token = process.env.GH_TOKEN;
    const repo = process.env.GH_REPO;
    if (!token || !repo) {
      return json(res, 500, { error: { code: 'GITHUB_CONFIG_MISSING', message: 'Set GH_TOKEN and GH_REPO' } });
    }

    const job = newJob();
    latestJob = job;
    job.status = 'running';

    setStep(job, 0, 'active');
    const provider = (body?.provider || process.env.LLM_PROVIDER || 'gemini') as Provider;
    setStep(job, 0, 'complete');

    setStep(job, 1, 'active');
    const rawPatch = await generatePatch(provider, instruction);
    setStep(job, 1, 'complete');

    setStep(job, 2, 'active');
    const parsed = parseJsonOutput(rawPatch);
    const validated = validateOutputSchema(parsed, { allowlist: ['src/', 'components/', 'services/', 'api/'] });
    setStep(job, 2, 'complete');

    setStep(job, 3, 'active');
    await runPreflight();
    setStep(job, 3, 'complete');

    setStep(job, 4, 'active');
    const { owner, repo: repoName } = splitRepo(repo);
    const gh = new GitHubRepoClient({ owner, repo: repoName, token });
    const branch = createAiBranchName();
    await gh.createBranchFromDefault(branch);

    for (const file of validated.files) {
      const sha = await gh.getFileSha(file.path, branch);
      await gh.upsertFile({
        path: file.path,
        content: file.content,
        branch,
        sha: sha || undefined,
        message: `feat(agent): update ${file.path}`,
      });
    }

    const pr = await gh.openPullRequest({
      branch,
      title: `feat(agent): ${instruction.slice(0, 72)}`,
      body: `Automated by WhisperX Agent.\n\nTask:\n${instruction}`,
    });

    job.branch = branch;
    job.changedFiles = validated.files.map((f) => f.path);
    job.prUrl = pr.html_url;
    setStep(job, 4, 'complete');
    job.status = 'completed';

    return json(res, 200, { ok: true, latestJob: job, prUrl: pr.html_url, branch });
  } catch (error: any) {
    if (latestJob) {
      latestJob.status = 'failed';
      latestJob.error = { code: 'UNKNOWN', message: error?.message || 'Unknown error' };
      latestJob.steps = latestJob.steps.map((step) => (step.status === 'active' ? { ...step, status: 'error' } : step));
    }

    if (error instanceof GuardError) {
      return json(res, 400, { error: { code: 'VALIDATION_FAIL', message: error.message, details: error.details } });
    }

    if (error instanceof GitHubApiError) {
      const code = error.status === 409 ? 'CONFLICT' : error.status === 401 ? 'GITHUB_TOKEN_INVALID' : 'GITHUB_ERROR';
      return json(res, 502, { error: { code, message: error.message } });
    }

    return json(res, 500, { error: { code: 'UNKNOWN', message: error?.message || 'Internal Server Error' } });
  }
}

export interface GitHubRepoMeta {
  default_branch: string;
}

export interface GitHubClientConfig {
  owner: string;
  repo: string;
  token: string;
  apiBaseUrl?: string;
}

interface GitHubContentFileResponse {
  sha: string;
}

interface GitHubRefResponse {
  object: {
    sha: string;
  };
}

interface GitHubCommitResponse {
  sha: string;
  tree: {
    sha: string;
  };
}

export interface UpsertFileInput {
  path: string;
  content: string;
  message: string;
  branch: string;
  sha?: string;
}

export interface CreateCommitFile {
  path: string;
  content: string;
}

export interface CreateCommitInput {
  branch: string;
  message: string;
  files: CreateCommitFile[];
}

export interface OpenPullRequestInput {
  branch: string;
  title: string;
  body?: string;
}

export class GitHubRepoClient {
  private readonly owner: string;
  private readonly repo: string;
  private readonly token: string;
  private readonly apiBaseUrl: string;

  constructor(config: GitHubClientConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.token = config.token;
    this.apiBaseUrl = config.apiBaseUrl ?? 'https://api.github.com';
  }

  async getRepoMeta(): Promise<GitHubRepoMeta> {
    return this.request<GitHubRepoMeta>(`/repos/${this.owner}/${this.repo}`);
  }

  async createBranchFromDefault(branchName = createAiBranchName()): Promise<{ branch: string; sha: string }> {
    const { default_branch } = await this.getRepoMeta();
    const defaultRef = await this.request<GitHubRefResponse>(
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${encodeURIComponent(default_branch)}`,
    );

    await this.request(`/repos/${this.owner}/${this.repo}/git/refs`, {
      method: 'POST',
      body: {
        ref: `refs/heads/${branchName}`,
        sha: defaultRef.object.sha,
      },
    });

    return {
      branch: branchName,
      sha: defaultRef.object.sha,
    };
  }

  async getFileSha(path: string, branch: string): Promise<string | null> {
    try {
      const file = await this.request<GitHubContentFileResponse>(
        `/repos/${this.owner}/${this.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
      );
      return file.sha;
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  async upsertFile(input: UpsertFileInput): Promise<{ sha: string }> {
    const existingSha = input.sha ?? (await this.getFileSha(input.path, input.branch));

    const response = await this.request<{ content: { sha: string } }>(
      `/repos/${this.owner}/${this.repo}/contents/${encodePath(input.path)}`,
      {
        method: 'PUT',
        body: {
          message: input.message,
          content: encodeContent(input.content),
          branch: input.branch,
          ...(existingSha ? { sha: existingSha } : {}),
        },
      },
    );

    return { sha: response.content.sha };
  }

  async createCommit(input: CreateCommitInput): Promise<{ sha: string }> {
    const branchRef = await this.request<GitHubRefResponse>(
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${encodeURIComponent(input.branch)}`,
    );

    const latestCommit = await this.request<GitHubCommitResponse>(
      `/repos/${this.owner}/${this.repo}/git/commits/${branchRef.object.sha}`,
    );

    const tree = await this.request<{ sha: string }>(`/repos/${this.owner}/${this.repo}/git/trees`, {
      method: 'POST',
      body: {
        base_tree: latestCommit.tree.sha,
        tree: input.files.map((file) => ({
          path: file.path,
          mode: '100644',
          type: 'blob',
          content: file.content,
        })),
      },
    });

    const commit = await this.request<{ sha: string }>(`/repos/${this.owner}/${this.repo}/git/commits`, {
      method: 'POST',
      body: {
        message: input.message,
        tree: tree.sha,
        parents: [branchRef.object.sha],
      },
    });

    await this.request(`/repos/${this.owner}/${this.repo}/git/refs/heads/${encodeURIComponent(input.branch)}`, {
      method: 'PATCH',
      body: {
        sha: commit.sha,
        force: false,
      },
    });

    return { sha: commit.sha };
  }

  async openPullRequest(input: OpenPullRequestInput): Promise<{ number: number; html_url: string }> {
    const { default_branch } = await this.getRepoMeta();

    return this.request<{ number: number; html_url: string }>(`/repos/${this.owner}/${this.repo}/pulls`, {
      method: 'POST',
      body: {
        title: input.title,
        body: input.body,
        head: `${this.owner}:${input.branch}`,
        base: default_branch,
      },
    });
  }

  private async request<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method: options?.method ?? 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new GitHubApiError(response.status, responseText);
    }

    return response.status === 204 ? ({} as T) : ((await response.json()) as T);
  }
}

export class GitHubApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export function createAiBranchName(now = new Date()): string {
  const timestamp = now.toISOString().replace(/[\-:TZ.]/g, '').slice(0, 14);
  const shortId = Math.random().toString(36).slice(2, 8);
  return `ai-${timestamp}-${shortId}`;
}

function encodeContent(content: string): string {
  return btoa(unescape(encodeURIComponent(content)));
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

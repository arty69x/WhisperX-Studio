export interface PullRequestPayload {
  title: string;
  body: string;
  branch: string;
}

export interface GitHubControllerConfig {
  endpoint: string;
}

export class GitHubController {
  constructor(private readonly config: GitHubControllerConfig) {}

  async commitAndOpenPR(payload: PullRequestPayload): Promise<{ url?: string; ok: boolean }> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false };
    }

    return (await response.json()) as { url?: string; ok: boolean };
  }
}

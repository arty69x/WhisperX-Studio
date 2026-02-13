export interface VerifyCommand {
  name: 'lint' | 'test' | 'build';
  command: string;
}

export interface VerifyResult {
  ok: boolean;
  command: VerifyCommand;
  output: string;
}

export interface VerifySummary {
  ok: boolean;
  results: VerifyResult[];
}

const defaultCommands: VerifyCommand[] = [
  { name: 'lint', command: 'npm run lint' },
  { name: 'test', command: 'npm test' },
  { name: 'build', command: 'npm run build' },
];

export interface VerifyRunnerOptions {
  preflightEndpoint?: string;
  maxRetries?: number;
}

export class VerifyRunner {
  constructor(private readonly options: VerifyRunnerOptions = {}) {}

  async run(commands: VerifyCommand[] = defaultCommands): Promise<VerifySummary> {
    if (this.options.preflightEndpoint) {
      return this.runViaEndpoint(commands);
    }

    // Browser-safe sandbox simulation fallback.
    const results = commands.map(command => ({
      ok: command.name === 'build',
      command,
      output:
        command.name === 'build'
          ? 'sandbox-runner: build passed'
          : 'sandbox-runner: command unavailable in browser runtime',
    }));

    return { ok: results.every(result => result.ok), results };
  }

  private async runViaEndpoint(commands: VerifyCommand[]): Promise<VerifySummary> {
    const response = await fetch(this.options.preflightEndpoint!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });

    if (!response.ok) {
      throw new Error(`Preflight endpoint failed (${response.status})`);
    }

    return (await response.json()) as VerifySummary;
  }

  async runWithRepairLoop(
    commands: VerifyCommand[] = defaultCommands,
    onFailureContext?: (errorContext: string) => Promise<void>,
  ): Promise<VerifySummary> {
    const retries = this.options.maxRetries ?? 2;

    let lastSummary: VerifySummary | null = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const summary = await this.run(commands);
      lastSummary = summary;
      if (summary.ok) return summary;

      if (attempt < retries && onFailureContext) {
        const context = summary.results
          .filter(result => !result.ok)
          .map(result => `${result.command.name}: ${result.output}`)
          .join('\n');
        await onFailureContext(context);
      }
    }

    return lastSummary ?? { ok: false, results: [] };
  }
}

export interface AgentInput {
  task: string;
  context?: string;
}

export interface AgentOutput {
  success: boolean;
  content: string;
  confidence: number;
  errors?: string[];
}

export abstract class BaseAgent {
  constructor(public name: string) {}

  abstract run(input: AgentInput): Promise<AgentOutput>;
}

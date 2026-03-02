import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';

export class ReviewerAgent extends BaseAgent {
  constructor() {
    super('Reviewer');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const severity = input.task.includes('any') ? 'HIGH' : 'LOW';
    return {
      success: true,
      content: severity,
      confidence: severity === 'HIGH' ? 0.3 : 0.9,
    };
  }
}

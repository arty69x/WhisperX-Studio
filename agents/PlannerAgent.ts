import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';
import { callOllama } from '../services/ollamaClient';

export class PlannerAgent extends BaseAgent {
  constructor() {
    super('Planner');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const plan = await callOllama('deepseek-coder-v2:16b', input.task);
      return { success: true, content: plan, confidence: 0.8 };
    } catch {
      return { success: false, content: '', confidence: 0, errors: ['Planner failure'] };
    }
  }
}

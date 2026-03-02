import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';
import { callOllama } from '../services/ollamaClient';

export class CoderAgentB extends BaseAgent {
  constructor() {
    super('CoderB');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const result = await callOllama('qwen2.5-coder:7b', input.task);
      return { success: true, content: result, confidence: 0.7 };
    } catch {
      return { success: false, content: '', confidence: 0, errors: ['CoderB failure'] };
    }
  }
}

import { agentRegistry } from '../agents/registry';
import { CandidateResult, chooseBestCandidate } from './candidateEngine';
import { StateMachine } from './stateMachine';

export class Kernel {
  private sm = new StateMachine();
  private healingRounds = 0;

  async run(task: string): Promise<string> {
    try {
      this.sm.transition('PLANNING');
      const plan = await agentRegistry.planner.run({ task });
      if (!plan.success) throw new Error('Planning failed');

      this.sm.transition('CODING_PARALLEL');
      const [candidateA, candidateB] = await Promise.all([
        agentRegistry.coderA.run({ task: plan.content || task }),
        agentRegistry.coderB.run({ task: plan.content || task }),
      ]);

      this.sm.transition('REVIEWING');
      const reviewerA = await agentRegistry.reviewer.run({ task: candidateA.content });
      const reviewerB = await agentRegistry.reviewer.run({ task: candidateB.content });

      const candidates: CandidateResult[] = [
        {
          id: 'A',
          content: candidateA.content,
          score: {
            validation: candidateA.success ? 0.9 : 0,
            reviewer: reviewerA.content === 'LOW' ? 0.9 : 0.3,
            security: reviewerA.content === 'LOW' ? 0.9 : 0.4,
            performance: candidateA.confidence,
          },
        },
        {
          id: 'B',
          content: candidateB.content,
          score: {
            validation: candidateB.success ? 0.9 : 0,
            reviewer: reviewerB.content === 'LOW' ? 0.9 : 0.3,
            security: reviewerB.content === 'LOW' ? 0.9 : 0.4,
            performance: candidateB.confidence,
          },
        },
      ];

      const winner = chooseBestCandidate(candidates);

      this.sm.transition('VALIDATING');
      if (!winner.content) throw new Error('Invalid output');

      this.sm.transition('FINALIZED');
      return winner.content;
    } catch {
      if (this.healingRounds < 3) {
        this.healingRounds += 1;
        this.sm.transition('HEALING');
        return this.run(task);
      }

      this.sm.transition('FAILED');
      return '';
    }
  }
}

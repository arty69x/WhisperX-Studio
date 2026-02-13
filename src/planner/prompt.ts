import { AgentRole, AgentStep } from '../../types';

export type PlannerPhase = 'analyze' | 'edit' | 'test' | 'repair' | 'pr';

export interface PlannedStep {
  phase: PlannerPhase;
  title: string;
  details: string;
  role: AgentRole;
}

export const DEFAULT_EXECUTION_PLAN: PlannedStep[] = [
  {
    phase: 'analyze',
    title: 'Analyze scope',
    details: 'Parse requirements and collect repository context',
    role: AgentRole.ARCHITECT,
  },
  {
    phase: 'edit',
    title: 'Edit implementation',
    details: 'Create patch for requested features',
    role: AgentRole.FRONTEND,
  },
  {
    phase: 'test',
    title: 'Verify changes',
    details: 'Run lint/test/build preflight checks',
    role: AgentRole.DEVOPS,
  },
  {
    phase: 'repair',
    title: 'Repair loop',
    details: 'Feed verification errors back to the model for fixes',
    role: AgentRole.DEBUGGER,
  },
  {
    phase: 'pr',
    title: 'Commit + PR',
    details: 'Create commit and open pull request through controller',
    role: AgentRole.GIT_MANAGER,
  },
];

export const planToAgentSteps = (plan: PlannedStep[]): AgentStep[] =>
  plan.map((step, index) => ({
    id: String(index + 1),
    label: `${step.title} (${step.phase.toUpperCase()})`,
    details: step.details,
    status: index === 0 ? 'active' : 'pending',
    role: step.role,
    timestamp: Date.now() + index,
  }));

export const buildExecutionPrompt = (instruction: string, repoContext: string): string => `
You are running an autonomous code-edit workflow.

Execution Plan (must follow in order):
1. analyze - understand the user request and map impacted files.
2. edit - generate code changes.
3. test - ensure lint/test/build pass.
4. repair - if verify fails, patch and retry within allowed retries.
5. pr - produce final summary suitable for commit + pull request.

User Request:
${instruction}

Retrieved Repository Context:
${repoContext}

Output Requirements:
- return production-ready code
- include short verification notes
- preserve existing coding style
`.trim();

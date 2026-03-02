import { PlannerAgent } from './PlannerAgent';
import { CoderAgentA } from './CoderAgentA';
import { CoderAgentB } from './CoderAgentB';
import { ReviewerAgent } from './ReviewerAgent';

export const agentRegistry = {
  planner: new PlannerAgent(),
  coderA: new CoderAgentA(),
  coderB: new CoderAgentB(),
  reviewer: new ReviewerAgent(),
};

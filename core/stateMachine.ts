export type EngineState =
  | 'IDLE'
  | 'PLANNING'
  | 'CODING_PARALLEL'
  | 'REVIEWING'
  | 'VALIDATING'
  | 'HEALING'
  | 'FINALIZED'
  | 'FAILED';

const transitions: Record<EngineState, EngineState[]> = {
  IDLE: ['PLANNING'],
  PLANNING: ['CODING_PARALLEL'],
  CODING_PARALLEL: ['REVIEWING'],
  REVIEWING: ['VALIDATING'],
  VALIDATING: ['HEALING', 'FINALIZED', 'FAILED'],
  HEALING: ['VALIDATING', 'FAILED'],
  FINALIZED: [],
  FAILED: [],
};

export class StateMachine {
  private state: EngineState = 'IDLE';

  getState(): EngineState {
    return this.state;
  }

  transition(next: EngineState): void {
    if (!transitions[this.state].includes(next)) {
      throw new Error(`Illegal state transition: ${this.state} -> ${next}`);
    }
    this.state = next;
  }
}

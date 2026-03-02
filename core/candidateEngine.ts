export interface CandidateScore {
  validation: number;
  reviewer: number;
  security: number;
  performance: number;
}

export interface CandidateResult {
  id: string;
  content: string;
  score: CandidateScore;
}

export function scoreCandidate(input: CandidateScore): number {
  return (
    input.validation * 0.4 +
    input.reviewer * 0.3 +
    input.security * 0.2 +
    input.performance * 0.1
  );
}

export function chooseBestCandidate(candidates: CandidateResult[]): CandidateResult {
  if (!candidates.length) {
    throw new Error('No candidates available');
  }

  return [...candidates].sort((a, b) => {
    const delta = scoreCandidate(b.score) - scoreCandidate(a.score);
    if (delta !== 0) return delta;
    return b.content.length - a.content.length;
  })[0];
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseBestCandidate, scoreCandidate } from '../../core/candidateEngine.ts';

test('scoreCandidate applies weighted score', () => {
  const score = scoreCandidate({ validation: 1, reviewer: 1, security: 1, performance: 1 });
  assert.ok(Math.abs(score - 1) < 1e-9);
});

test('chooseBestCandidate returns higher score', () => {
  const best = chooseBestCandidate([
    {
      id: 'A',
      content: 'small',
      score: { validation: 0.7, reviewer: 0.7, security: 0.7, performance: 0.6 },
    },
    {
      id: 'B',
      content: 'better',
      score: { validation: 0.9, reviewer: 0.9, security: 0.8, performance: 0.8 },
    },
  ]);

  assert.equal(best.id, 'B');
});

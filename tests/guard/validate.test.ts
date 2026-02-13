import test from 'node:test';
import assert from 'node:assert/strict';

import { GuardError, safePath, validateOutputSchema } from '../../src/guard/validate.ts';
import {
  AgentValidationError,
  validateAgentRequest,
  validateAgentResponse,
} from '../../api/agent.ts';

test('safePath accepts allowed relative paths', () => {
  assert.equal(safePath('src/a.ts'), 'src/a.ts');
});

test('safePath rejects traversal', () => {
  assert.throws(() => safePath('../src/a.ts'), /Path traversal/);
});

test('safePath rejects absolute paths', () => {
  assert.throws(() => safePath('/etc/passwd'), /Absolute path/);
});

test('safePath rejects .git paths', () => {
  assert.throws(() => safePath('.git/config'), /forbidden/i);
});

test('safePath rejects paths outside allowlist', () => {
  assert.throws(() => safePath('api/agent.ts'), /allowlist/);
});

test('validateOutputSchema accepts valid schema', () => {
  const result = validateOutputSchema({
    files: [{ path: 'src/example.ts', content: 'console.log(1);' }],
  });

  assert.equal(result.files.length, 1);
  assert.equal(result.files[0].path, 'src/example.ts');
});

test('validateOutputSchema rejects too many files', () => {
  assert.throws(
    () =>
      validateOutputSchema(
        { files: [{ path: 'src/a.ts', content: '' }, { path: 'src/b.ts', content: '' }] },
        { maxFiles: 1 },
      ),
    /Too many files/,
  );
});

test('validateOutputSchema rejects oversized file', () => {
  assert.throws(
    () =>
      validateOutputSchema({ files: [{ path: 'src/a.ts', content: '12345' }] }, { maxBytesPerFile: 4 }),
    /exceeds byte limit/,
  );
});

test('validateOutputSchema rejects oversized total payload', () => {
  assert.throws(
    () =>
      validateOutputSchema(
        {
          files: [
            { path: 'src/a.ts', content: '1234' },
            { path: 'src/b.ts', content: '1234' },
          ],
        },
        { maxTotalBytes: 7 },
      ),
    /Total payload exceeds byte limit/,
  );
});

test('validateAgentRequest throws AGENT_REQUEST_INVALID for bad payload', () => {
  try {
    validateAgentRequest({ files: [{ path: '../x.ts', content: '' }] });
    assert.fail('expected throw');
  } catch (error) {
    assert.ok(error instanceof AgentValidationError);
    assert.equal(error.code, 'AGENT_REQUEST_INVALID');
    assert.equal(error.causeCode, 'PATH_TRAVERSAL');
  }
});

test('validateAgentResponse throws AGENT_RESPONSE_INVALID for bad payload', () => {
  try {
    validateAgentResponse({ bad: true });
    assert.fail('expected throw');
  } catch (error) {
    assert.ok(error instanceof AgentValidationError);
    assert.equal(error.code, 'AGENT_RESPONSE_INVALID');
    assert.equal(error.causeCode, 'FILES_NOT_ARRAY');
  }
});

test('GuardError is thrown for invalid file entry shape', () => {
  assert.throws(() => validateOutputSchema({ files: [null] }), (error: unknown) => {
    assert.ok(error instanceof GuardError);
    assert.equal(error.code, 'INVALID_SHAPE');
    return true;
  });
});

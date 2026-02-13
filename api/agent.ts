import {
  type OutputSchema,
  type ValidationLimits,
  validateOutputSchema,
  type GuardError,
} from '../src/guard/validate.ts';

export type AgentValidationCode =
  | 'AGENT_REQUEST_INVALID'
  | 'AGENT_RESPONSE_INVALID';

export class AgentValidationError extends Error {
  public readonly code: AgentValidationCode;
  public readonly status: number;
  public readonly causeCode?: string;

  constructor(code: AgentValidationCode, status: number, message: string, causeCode?: string) {
    super(message);
    this.name = 'AgentValidationError';
    this.code = code;
    this.status = status;
    this.causeCode = causeCode;
  }
}

const toValidationError = (
  phase: 'request' | 'response',
  error: unknown,
): AgentValidationError => {
  const code: AgentValidationCode =
    phase === 'request' ? 'AGENT_REQUEST_INVALID' : 'AGENT_RESPONSE_INVALID';

  const message =
    error instanceof Error ? error.message : `Unknown ${phase} validation error`;
  const causeCode =
    typeof error === 'object' && error && 'code' in error
      ? String((error as GuardError).code)
      : undefined;

  return new AgentValidationError(code, 422, `${phase.toUpperCase()}_VALIDATION_FAILED: ${message}`, causeCode);
};

export function validateAgentRequest(
  payload: unknown,
  limits?: Partial<ValidationLimits>,
): OutputSchema {
  try {
    return validateOutputSchema(payload, limits);
  } catch (error) {
    throw toValidationError('request', error);
  }
}

export function validateAgentResponse(
  payload: unknown,
  limits?: Partial<ValidationLimits>,
): OutputSchema {
  try {
    return validateOutputSchema(payload, limits);
  } catch (error) {
    throw toValidationError('response', error);
  }
}

import { GuardError, validateOutputSchema } from '../src/guard/validate.ts';

type AgentValidationCode = 'AGENT_REQUEST_INVALID' | 'AGENT_RESPONSE_INVALID';

export class AgentValidationError extends Error {
  public readonly code: AgentValidationCode;
  public readonly causeCode?: string;

  constructor(code: AgentValidationCode, message: string, causeCode?: string) {
    super(message);
    this.name = 'AgentValidationError';
    this.code = code;
    this.causeCode = causeCode;
  }
}

const toAgentValidationError = (
  code: AgentValidationCode,
  error: unknown,
): AgentValidationError => {
  if (error instanceof GuardError) {
    return new AgentValidationError(code, error.message, error.code);
  }

  const message = error instanceof Error ? error.message : 'Unknown validation error';
  return new AgentValidationError(code, message);
};

export const validateAgentRequest = (value: unknown) => {
  try {
    return validateOutputSchema(value);
  } catch (error) {
    throw toAgentValidationError('AGENT_REQUEST_INVALID', error);
  }
};

export const validateAgentResponse = (value: unknown) => {
  try {
    return validateOutputSchema(value);
  } catch (error) {
    throw toAgentValidationError('AGENT_RESPONSE_INVALID', error);
  }
};

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
};

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const LIVE_SESSION_TTL_MS = 5 * 60 * 1000;
const liveSessions = new Map<string, { systemInstruction: string; expiresAt: number }>();

const createLiveSession = (systemInstruction: string) => {
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  liveSessions.set(sessionId, {
    systemInstruction,
    expiresAt: Date.now() + LIVE_SESSION_TTL_MS,
  });
  return sessionId;
};

const getLiveSession = (sessionId: string) => {
  const session = liveSessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    liveSessions.delete(sessionId);
    return null;
  }
  return session;
};

const geminiRequest = async (payload: unknown) => {
  const apiKey = requireEnv('GEMINI_API_KEY');
  const model = 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${detail}`);
  }

  return response.json();
};

const openAIChat = async (body: any) => {
  const apiKey = requireEnv('OPENAI_API_KEY');
  const model = body.model || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: body.messages,
      temperature: body.temperature ?? 0.5,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${detail}`);
  }

  return response.json();
};

const ollamaChat = async (body: any) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: body.model || 'llama3.1:8b',
      messages: body.messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${detail}`);
  }

  return response.json();
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (body.provider === 'gemini' && body.action === 'chat') {
      const data = await geminiRequest(body.payload);
      return json(res, 200, data);
    }

    if (body.provider === 'gemini' && body.action === 'live-session') {
      const systemInstruction = body.systemInstruction || 'You are WhisperX Voice assistant. Help with architecture.';
      const sessionId = createLiveSession(systemInstruction);
      return json(res, 200, {
        sessionId,
        expiresInMs: LIVE_SESSION_TTL_MS,
      });
    }

    if (body.provider === 'gemini' && body.action === 'live-turn') {
      const session = getLiveSession(body.sessionId);
      if (!session) {
        return json(res, 401, { error: 'Live session expired. Please reconnect.' });
      }

      const data = await geminiRequest({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: body.audio,
                  mimeType: 'audio/pcm;rate=16000',
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
        },
        systemInstruction: {
          parts: [{ text: session.systemInstruction }],
        },
      });

      const candidates = data.candidates || [];
      const parts = candidates[0]?.content?.parts || [];
      const audioPart = parts.find((part: any) => part.inlineData?.data);
      return json(res, 200, {
        audio: audioPart?.inlineData?.data || null,
      });
    }

    if (body.provider === 'openai' && body.action === 'chat') {
      const data = await openAIChat(body);
      return json(res, 200, data);
    }

    if (body.provider === 'ollama' && body.action === 'chat') {
      const data = await ollamaChat(body);
      return json(res, 200, data);
    }

    return json(res, 400, { error: 'Unsupported provider/action' });
  } catch (error: any) {
    return json(res, 500, { error: error.message || 'Internal Server Error' });
  }
}

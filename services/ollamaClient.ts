import { withTimeout } from '../core/executionBudget';

export async function callOllama(model: string, prompt: string): Promise<string> {
  try {
    const request = fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt }),
    });

    const response = await withTimeout(request, 20_000);
    if (!response.ok) return '';

    const json: unknown = await response.json();
    if (!json || typeof json !== 'object' || typeof (json as any).response !== 'string') {
      return '';
    }

    return (json as any).response;
  } catch {
    return '';
  }
}

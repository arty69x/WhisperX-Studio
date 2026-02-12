
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { logger } from "./loggerService";
import { AgentRole } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export const geminiService = {
  async agentChat(message: string, history: any[], role: AgentRole = AgentRole.ARCHITECT): Promise<string> {
    return withRetry(async () => {
      const ai = getAI();
      
      const roleInstructions = {
        [AgentRole.ARCHITECT]: "Lead Architect. Focus on high-level design and scalable component architecture.",
        [AgentRole.FRONTEND]: "Frontend Specialist. Expert in Tailwind CSS, Lucide icons, and modern React patterns.",
        [AgentRole.GIT_MANAGER]: "Git Strategist. Ensures version control integrity and atomic commits.",
        [AgentRole.DEBUGGER]: "Debugger. Forensic analysis of code and logic errors.",
        [AgentRole.DEVOPS]: "DevOps. Runtime stability and environment validation."
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: `You are the WhisperX AI Assistant [ROLE: ${role}].
          ${roleInstructions[role]}
          
          COMMUNICATION RULES:
          1. Use a mix of Professional English and Thai (Bilingual).
          2. Technical terms should remain in English but be explained or contextualized in Thai.
          3. If a user asks for a feature build, explain the approach and then say "ยืนยัน" (Confirm) to initiate synthesis.
          4. Keep tone professional, industrial, and high-performance.
          
          TECH STACK: Next.js 15, Tailwind CSS, TypeScript, FontAwesome.`
        }
      });
      return response.text || '';
    });
  },

  async executeBuild(prompt: string, role: AgentRole = AgentRole.FRONTEND): Promise<{ code: string; thinking: string }> {
    return withRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Develop this production-grade feature: ${prompt}`,
        config: {
          thinkingConfig: { thinkingBudget: 24000 },
          systemInstruction: `You are the WhisperX Production Build Engine. 
          
          TASK: Synthesis of a standalone Next.js TypeScript React component.
          
          REQUIREMENTS:
          1. Brutalist Industrial Aesthetic: Sharp borders (4px), high contrast (Black/White/Primary), prism shadows.
          2. Tailwind CSS: Use direct utility classes. No custom CSS modules.
          3. TypeScript: Strict types. Interface definitions required.
          4. Robustness: Handle empty states, loading indicators, and responsiveness.
          5. Output: CODE ONLY. Do not include markdown headers or explanations. Just the raw code.`
        }
      });
      
      const text = response.text || '';
      // Clean code if model included markdown wrappers
      const cleanCode = text.replace(/```(tsx|typescript|jsx|javascript)?/g, '').replace(/```/g, '').trim();
      
      return {
        code: cleanCode,
        thinking: (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought || 'Processing synthesis logic...'
      };
    });
  }
};

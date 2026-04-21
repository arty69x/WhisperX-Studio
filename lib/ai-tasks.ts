import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

export interface AISuggestion {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimatedEffort: string;
}

export async function suggestTasks(projectDescription: string, existingTasks: string[]): Promise<AISuggestion[]> {
  const prompt = `Analyze this project and existing tasks. Suggest 5 NEW tasks that would be logical next steps.
  Project Description: ${projectDescription}
  Existing Tasks: ${existingTasks.join(", ")}
  
  Return the suggestions as a JSON array of objects with: title, description, priority (LOW, MEDIUM, HIGH, CRITICAL), and estimatedEffort (e.g. "2h", "1 day").`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Using flash for speed/cost as it's a utility task
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
              estimatedEffort: { type: Type.STRING }
            },
            required: ["title", "description", "priority", "estimatedEffort"]
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json;
  } catch (err) {
    console.error("AI Task Suggestion failed:", err);
    return [];
  }
}

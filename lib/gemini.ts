import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export async function geminiStream(prompt: string, history: { role: string; content: string }[] = []) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  // Convert history to SDK format
  const contents = history.map(h => ({
    role: h.role === "ai" ? "model" as const : "user" as const,
    parts: [{ text: h.content }]
  }));
  
  contents.push({ role: "user", parts: [{ text: prompt }] });

  const result = await ai.models.generateContentStream({
    model,
    contents
  });
  
  return result;
}

export async function geminiVision(prompt: string, imageBase64: string, mimeType = "image/jpeg") {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const result = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType
            }
          }
        ]
      }
    ]
  });

  return result.text || "";
}

export async function geminiJSON<T>(prompt: string, fallback: T): Promise<T> {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const result = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const text = result.text || "";
    return JSON.parse(text) as T;
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", e);
    return fallback;
  }
}

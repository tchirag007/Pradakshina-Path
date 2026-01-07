import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSpiritualInsight = async (count: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Focus on your breath and your path. The journey inward is the true destination.";

  try {
    const prompt = `
      The user has just completed ${count} rounds of Pradakshina (circumambulation).
      Please provide a very brief (max 2 sentences), serene, and spiritually uplifting quote or insight related to the number ${count} if it has significance (like 3, 7, 11, 21, 108), or generally about the act of walking meditation, devotion, or cycles of time in Hindu/Indic philosophy.
      Tone: Peaceful, encouraging, timeless.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Low latency preferred for UI feedback
      }
    });

    return response.text?.trim() || "Every step taken in devotion brings you closer to the center of your being.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Every step is a prayer. Keep moving forward.";
  }
};
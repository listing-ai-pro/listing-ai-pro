import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.warn('Gemini API Key is not configured or is using placeholder value.');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function generateGeminiContent(params: {
  prompt?: string;
  contents?: any;
  modelName?: string;
  useSearch?: boolean;
}) {
  const { prompt, contents, modelName, useSearch } = params;
  
  // Force use of gemini-3-flash-preview as it's the most reliable for free tier
  let actualModelName = 'gemini-3-flash-preview';
  
  // Only override if explicitly pro is requested, but even then flash is safer
  if (modelName?.includes('pro')) {
    actualModelName = 'gemini-3.1-pro-preview';
  }

  try {
    const response = await ai.models.generateContent({
      model: actualModelName,
      contents: contents || prompt,
      config: {
        systemInstruction: contents ? prompt : undefined,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      }
    });

    let image = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return { text: response.text, image };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message && error.message.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key. Please check your Secrets configuration.');
    }
    throw error;
  }
}

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.warn('Gemini API Key is not configured or is using placeholder value.');
}

export const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

export async function generateGeminiContent(params: {
  prompt?: string;
  contents?: any;
  modelName?: string;
  useSearch?: boolean;
  imageConfig?: {
    aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1";
    imageSize?: "512px" | "1K" | "2K" | "4K";
  };
}) {
  const { prompt, contents, modelName, useSearch, imageConfig } = params;
  
  // Map model names to supported ones
  let actualModelName = modelName || 'gemini-3-flash-preview';
  if (actualModelName === 'gemini-1.5-pro-latest' || actualModelName === 'gemini-3.1-pro-preview') {
    actualModelName = 'gemini-3-flash-preview'; // Fallback to flash for better compatibility
  }

  try {
    const response = await genAI.models.generateContent({
      model: actualModelName,
      contents: contents || prompt,
      config: {
        systemInstruction: contents ? prompt : undefined,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
        imageConfig: imageConfig
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
      throw new Error('Invalid Gemini API Key. Please check your Secrets configuration in the AI Studio panel.');
    }
    throw error;
  }
}

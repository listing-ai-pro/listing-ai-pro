import { GoogleGenAI } from "@google/genai";

// Initialize the new GoogleGenAI client
// The platform automatically provides the GEMINI_API_KEY in the environment
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function generateGeminiContent(params: {
  prompt?: string;
  contents?: any;
  modelName?: string;
  useSearch?: boolean;
}) {
  const { prompt, contents, modelName, useSearch } = params;
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key is not configured. Please ensure it is set in your environment variables.');
  }

  // Use gemini-3-flash-preview as per skill guidelines
  const actualModelName = modelName || 'gemini-3-flash-preview';
  
  let finalContents: any[] = [];
  
  if (contents) {
    if (Array.isArray(contents)) {
      finalContents = contents;
    } else if (contents.parts) {
      finalContents = [{ role: 'user', parts: contents.parts }];
    } else if (typeof contents === 'string') {
      finalContents = [{ role: 'user', parts: [{ text: contents }] }];
    } else {
      finalContents = [{ role: 'user', parts: [contents] }];
    }
  } else if (prompt) {
    finalContents = [{ role: 'user', parts: [{ text: prompt }] }];
  }

  try {
    const response = await ai.models.generateContent({
      model: actualModelName,
      contents: finalContents,
      config: {
        systemInstruction: prompt && contents ? prompt : undefined,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      }
    });

    const text = response.text || '';
    let image = null;

    // Extract image if present in response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return { text, image };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    if (error.message && error.message.includes('quota')) {
      throw new Error('API Quota Exceeded. Please wait a few seconds and try again.');
    }
    
    throw error;
  }
}

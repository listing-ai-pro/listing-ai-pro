import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.warn('Gemini API Key is not configured or is using placeholder value.');
}

// Initialize the new GoogleGenAI client
export const ai = new GoogleGenAI({ 
  apiKey: apiKey || '',
});

export async function generateGeminiContent(params: {
  prompt?: string;
  contents?: any;
  modelName?: string;
  useSearch?: boolean;
}) {
  const { prompt, contents, modelName, useSearch } = params;
  
  // Use gemini-3-flash-preview as recommended for basic text tasks in the skill
  // Avoid gemini-1.5-flash as it is prohibited and returns 404 in this SDK
  let actualModelName = 'gemini-3-flash-preview';
  
  // Prepare contents in the format expected by @google/genai
  let finalContents: any;
  
  if (contents) {
    // The SDK supports the { parts: [...] } format or an array of such objects
    finalContents = contents;
  } else if (prompt) {
    finalContents = prompt;
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

    let text = response.text || '';
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
    
    // Handle specific quota errors
    if (error.message && error.message.includes('quota')) {
      throw new Error('API Quota Exceeded. Please wait a few seconds and try again.');
    }
    
    if (error.message && error.message.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key. Please check your Secrets configuration.');
    }
    
    throw error;
  }
}

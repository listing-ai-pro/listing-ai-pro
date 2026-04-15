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
  
  // Use gemini-1.5-flash for maximum compatibility and quota availability
  // Newer models like 3.1 or 2.5 often have 0 quota in free tier for some regions
  let actualModelName = 'gemini-1.5-flash';
  
  // Prepare contents in the format expected by @google/genai
  let finalContents: any[] = [];
  
  if (contents) {
    // If contents is already an array, use it
    if (Array.isArray(contents)) {
      finalContents = contents;
    } 
    // If it's the older { parts: [...] } format, wrap it
    else if (contents.parts) {
      finalContents = [{ role: 'user', parts: contents.parts }];
    }
    // Otherwise try to wrap it
    else {
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

    let text = response.text || '';
    let image = null;

    // Extract image if present in response (though 1.5-flash won't generate images)
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

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
  
  // Default to Gemini 3 Flash for text tasks
  let actualModelName = modelName || 'gemini-3-flash-preview';
  
  // Detect if this is an image generation/editing task
  const hasImageInput = contents?.parts?.some((p: any) => p.inlineData) || 
                       (contents?.inlineData);
  
  const promptText = typeof contents === 'string' ? contents : 
                    (Array.isArray(contents?.parts) ? contents.parts.find((p: any) => p.text)?.text : '');

  const isImageOutputRequested = promptText?.toLowerCase().includes('generate') || 
                                promptText?.toLowerCase().includes('photo') || 
                                promptText?.toLowerCase().includes('image') ||
                                promptText?.toLowerCase().includes('background');

  if ((hasImageInput || isImageOutputRequested) && !modelName) {
    // gemini-3.1-flash-image-preview is the most advanced image model available in v1beta
    actualModelName = 'gemini-3.1-flash-image-preview';
  }

  // Ensure we don't use prohibited or deprecated names
  if (actualModelName.includes('1.5')) {
    actualModelName = 'gemini-3-flash-preview';
  }

  try {
    const response = await ai.models.generateContent({
      model: actualModelName,
      contents: contents || prompt,
      config: {
        systemInstruction: contents ? prompt : undefined,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
        imageConfig: actualModelName.includes('image') ? {
          aspectRatio: "1:1",
          imageSize: "1K"
        } : undefined
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

    // If we expected an image but got none, and we used a text model, 
    // it might be because the detection failed.
    return { text: response.text, image };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message && error.message.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key. Please check your Secrets configuration.');
    }
    throw error;
  }
}

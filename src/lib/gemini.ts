import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.warn('Gemini API Key is not configured or is using placeholder value.');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

export async function generateGeminiContent(params: {
  prompt?: string;
  contents?: any;
  modelName?: string;
  useSearch?: boolean;
}) {
  const { prompt, contents, modelName, useSearch } = params;
  
  // Use gemini-1.5-flash as the default stable model
  let actualModelName = 'gemini-1.5-flash';
  
  if (modelName?.includes('pro')) {
    actualModelName = 'gemini-1.5-pro';
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: actualModelName,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    } as any);

    let result;
    if (contents) {
      // If contents are provided (for multimodal/chat), use generateContent with parts
      result = await model.generateContent(contents);
    } else if (prompt) {
      result = await model.generateContent(prompt);
    } else {
      throw new Error('No prompt or contents provided');
    }

    const response = await result.response;
    const text = response.text();
    
    let image = null;
    // Note: Standard generateContent doesn't return images directly in the same way 
    // as the experimental image models, but we keep the structure for compatibility.
    
    return { text, image };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message && error.message.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key. Please check your Secrets configuration.');
    }
    throw error;
  }
}

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
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate content');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    if (error.message && error.message.includes('quota')) {
      throw new Error('API Quota Exceeded. Please wait a few seconds and try again.');
    }
    
    throw error;
  }
}

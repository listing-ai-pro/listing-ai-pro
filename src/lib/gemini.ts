import { GoogleGenAI } from "@google/genai";
import { logAiRequest } from "./ai-logger";

// Initialize the new GoogleGenAI client
// The platform automatically provides the GEMINI_API_KEY in the environment
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function generateGeminiContent(params: {
  prompt?: string;
  contents?: any;
  image?: string; // Optional base64 image
  systemInstruction?: string;
  modelName?: string;
  useSearch?: boolean;
}) {
  const { prompt, contents, image, systemInstruction, modelName, useSearch } = params;
  const startTime = Date.now();
  
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
    
    // If prompt is also provided with contents, treat prompt as a new user message
    if (prompt) {
      finalContents.push({ role: 'user', parts: [{ text: prompt }] });
    }
  } else if (prompt) {
    const parts: any[] = [{ text: prompt }];
    if (image) {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/png';
      const base64Data = image.split(',')[1] || image;
      parts.unshift({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }
    finalContents = [{ role: 'user', parts }];
  }

  try {
    const response = await ai.models.generateContent({
      model: actualModelName,
      contents: finalContents,
      config: {
        systemInstruction: systemInstruction || (prompt && contents ? prompt : undefined),
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

    const latency = Date.now() - startTime;
    logAiRequest(prompt?.substring(0, 30) || 'GENERIC_CONTENT', actualModelName, 'success', undefined, latency);

    return { text, image };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    const message = error.message || '';
    const status = error.status || 0;
    const latency = Date.now() - startTime;

    logAiRequest(prompt?.substring(0, 30) || 'GENERIC_CONTENT', actualModelName, 'error', message, latency);

    if (message.includes('quota') || status === 429) {
      throw new Error('Wait for 2 mins - High Traffic on Website | सर्वर पर ट्रैफिक अधिक है, कृपया 2 मिनट बाद फिर से कोशिश करें।');
    }
    
    if (message.includes('safety') || message.includes('candidate')) {
      throw new Error('AI Safety Policy: यह प्रॉम्प्ट या इमेज AI पॉलिसी के खिलाफ हो सकती है। कृपया कुछ और ट्राई करें।');
    }
    
    throw new Error('AI Processing Error: AI रेस्पोंस जेनरेट नहीं कर पाया। कृपया इंटरनेट चेक करें या थोड़ी देर बाद कोशिश करें।');
  }
}

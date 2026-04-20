import { ai, generateGeminiContent as baseGenerateGemini } from './gemini';
import { HUMANIZER_PROMPT } from './humanizer';
import { SEOMACHINE_PROMPT } from './seoMachine';
import { logAiRequest } from './ai-logger';

// Helper for exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>, 
  context: { type: string, model: string },
  retries = 3, 
  delay = 1000
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const latency = Date.now() - startTime;
    logAiRequest(context.type, context.model, 'success', undefined, latency);
    return result;
  } catch (error: any) {
    const message = error.message || '';
    const status = error.status || 0;
    const latency = Date.now() - startTime;

    logAiRequest(context.type, context.model, 'error', message, latency);

    // Handle Quota/Rate Limit
    if (status === 429 || message.includes('quota')) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, context, retries - 1, delay * 2);
      }
      throw new Error('Wait for 2 mins - High Traffic on Website | सर्वर पर ट्रैफिक अधिक है, कृपया 2 मिनट बाद फिर से कोशिश करें।');
    }

    // Handle Safety
    if (message.includes('safety') || message.includes('candidate')) {
      throw new Error('AI Safety Policy: यह प्रॉम्प्ट या इमेज AI पॉलिसी के खिलाफ हो सकती है। कृपया कुछ और ट्राई करें।');
    }

    // Handle other errors
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, context, retries - 1, delay * 2);
    }
    
    throw new Error('AI Processing Error: AI रेस्पोंस जेनरेट नहीं कर पाया। कृपया इंटरनेट चेक करें या थोड़ी देर बाद कोशिश करें।');
  }
}

export async function analyzeProductImage(imageB64: string) {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        role: 'user',
        parts: [
          { text: 'Analyze this product image and provide a detailed description including product type, color, texture, and material.' },
          { inlineData: { data: imageB64.split(',')[1], mimeType: imageB64.split(';')[0].split(':')[1] } }
        ]
      }]
    });
    return response.text;
  }, { type: 'image_analysis', model: 'gemini-2.5-flash-image' });
}

export async function suggestPhotoshootSettings(imageB64: string, mode: string) {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        role: 'user',
        parts: [
          { text: `Suggest photoshoot settings for this product in ${mode} mode. Return ONLY raw JSON with keys: "pose", "lighting", "background", "cameraAngle". Do not include markdown formatting.` },
          { inlineData: { data: imageB64.split(',')[1], mimeType: imageB64.split(';')[0].split(':')[1] } }
        ]
      }]
    });
    const text = response.text || '{}';
    // Clean up potential markdown formatting
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonString);
  }, { type: 'photoshoot_settings', model: 'gemini-2.5-flash-image' });
}

export async function generateBackgroundImage(prompt: string) {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: `Generate a professional background image: ${prompt}` }] }]
    });
    // Assuming the response contains an image
    return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
  }, { type: 'background_gen', model: 'gemini-2.5-flash-image' });
}

export async function generateProductStudioImage(options: any) {
  return withRetry(async () => {
    const { productImage, pose, lighting, background, cameraAngle, focalLength, numImages, aspectRatio } = options;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        role: 'user',
        parts: [
          { text: `Generate a high-fidelity product studio image.
            Product: [Provided Image]
            Pose/Shot Type: ${pose || 'Standard'}
            Lighting: ${lighting || 'Studio soft light'}
            Background: ${background || 'Clean studio white'}
            Camera Angle: ${cameraAngle || 'Eye-level'}
            Focal Length: ${focalLength || '50mm'}
            Aspect Ratio: ${aspectRatio || 'Portrait'}
            Number of Variations: ${numImages || 1}
            Ensure realistic shadows and reflections so it looks like it was clicked in a professional studio.` },
          { inlineData: { data: productImage.split(',')[1], mimeType: productImage.split(';')[0].split(':')[1] } }
        ]
      }]
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
    return part;
  }, { type: 'studio_gen', model: 'gemini-2.5-flash-image' });
}

export async function generateVirtualTryOn(options: any) {
  return withRetry(async () => {
    const { productImage, modelImage, pose, lighting, background, handStyling, expression, cameraAngle, focalLength, aspectRatio } = options;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        role: 'user',
        parts: [
          { text: `Perform virtual try-on. Take the provided apparel item and realistically wear it on a human model.
            Apparel: [Provided Image]
            Model: [Second Image]
            Pose/Shot Type: ${pose || 'Full Body Front'}
            Hand Styling: ${handStyling || 'Neutral'}
            Expression: ${expression || 'Neutral'}
            Lighting: ${lighting || 'Natural light'}
            Background: ${background || 'Urban street'}
            Camera Angle: ${cameraAngle || 'Eye-level'}
            Focal Length: ${focalLength || '35mm'}
            Aspect Ratio: ${aspectRatio || 'Portrait'}
            Ensure the apparel fits naturally on the model, following body contours and fabric physics.` },
          { inlineData: { data: productImage.split(',')[1], mimeType: productImage.split(';')[0].split(':')[1] } },
          { inlineData: { data: modelImage.split(',')[1], mimeType: modelImage.split(';')[0].split(':')[1] } }
        ]
      }]
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
    return part;
  }, { type: 'try_on_gen', model: 'gemini-2.5-flash-image' });
}

export async function generateMockupImage(options: any) {
  return withRetry(async () => {
    const { productImage, designImage, lighting, background } = options;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        role: 'user',
        parts: [
          { text: `Generate a realistic product mockup. 
            Take the provided graphic/design and place it realistically onto the provided product image.
            Product: [First Image]
            Design: [Second Image]
            Lighting: ${lighting || 'Studio soft light'}
            Background: ${background || 'Clean studio white'}
            Ensure the design follows the contours, texture, and perspective of the product surface (e.g., fabric folds, curved surfaces). 
            Blend it perfectly with realistic shadows and highlights.` },
          { inlineData: { data: productImage.split(',')[1], mimeType: productImage.split(';')[0].split(':')[1] } },
          { inlineData: { data: designImage.split(',')[1], mimeType: designImage.split(';')[0].split(':')[1] } }
        ]
      }]
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
    return part;
  }, { type: 'mockup_gen', model: 'gemini-2.5-flash-image' });
}

export async function generateGeminiContent(options: { prompt: string, history?: any[], systemInstruction?: string, useSearch?: boolean }) {
  return withRetry(async () => {
    const { prompt, history, systemInstruction, useSearch } = options;
    const finalSystemInstruction = systemInstruction 
      ? `${systemInstruction}\n\n${HUMANIZER_PROMPT}\n\n${SEOMACHINE_PROMPT}`
      : `${HUMANIZER_PROMPT}\n\n${SEOMACHINE_PROMPT}`;

    const response = await baseGenerateGemini({ 
      prompt, 
      contents: history,
      systemInstruction: finalSystemInstruction as any,
      useSearch
    });
    return response;
  }, { type: 'text_gen', model: 'gemini-flash-latest' });
}

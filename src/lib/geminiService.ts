import { ai } from './gemini';

// Helper for exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
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
  });
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
  });
}

export async function generateBackgroundImage(prompt: string) {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: `Generate a professional background image: ${prompt}` }] }]
    });
    // Assuming the response contains an image
    return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
  });
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
  });
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
  });
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
  });
}

export async function generateGeminiContent(options: { prompt: string, history?: any[], systemInstruction?: string }) {
  return withRetry(async () => {
    const { prompt, history, systemInstruction } = options;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: history ? [...history, { role: 'user', parts: [{ text: prompt }] }] : [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response;
  });
}

import { generateGeminiContent, analyzeProductImage } from './geminiService';
import { HUMANIZER_PROMPT } from './humanizer';
import { SEOMACHINE_PROMPT } from './seoMachine';

/**
 * Conductor Orchestration Pattern
 * Coordinates multiple LLM "Agents" to produce high-quality marketplace listings.
 * Inspired by wshobson/agents architecture.
 */

export interface ListingInput {
  imageB64?: string;
  additionalInfo?: string;
  platforms: string[];
  productQuery: string;
  marketDataStr?: string;
}

export interface AgentResponse {
  agentName: string;
  content: string;
}

export class ConductorService {
  /**
   * Orchestrates the multi-agent workflow
   */
  static async orchestrateListing(input: ListingInput, onStepUpdate?: (step: string) => void) {
    onStepUpdate?.('Visual Intelligence: Analyzing Product...');
    
    // Stage 1: Visual Intelligence (Image Analysis)
    let visualContext = '';
    if (input.imageB64) {
      try {
        visualContext = await analyzeProductImage(input.imageB64);
      } catch (e) {
        console.warn("Visual analysis failed, using text context only", e);
      }
    }

    const baseContext = `
      Product Identity: ${input.productQuery}
      Visual Context: ${visualContext}
      Additional Info: ${input.additionalInfo || 'None'}
      Market Intelligence: ${input.marketDataStr || 'General Market Knowledge'}
    `;

    // Stage 2: Collective Intelligence (Consolidated Call)
    onStepUpdate?.('Quantum Search: Running Real-time Market & SEO Intelligence...');

    const collectivePrompt = `
      You are the Collective Intelligence Engine. You must act as 5 specialized sub-agents simultaneously.
      
      CONTEXT:
      Product Identity: ${input.productQuery}
      Visual Context: ${visualContext}
      Additional Info: ${input.additionalInfo || 'None'}
      
      SUB-AGENT TASKS:
      1. Market Intelligence: Use Google Search to find current prices for this product on Amazon.in, Flipkart, and Meesho. Find top 3 competitors and their USPs/Weaknesses.
      2. SEO Analyst: Identify 20 high-performing keywords (Focus: Volume, Search Intent for ${input.platforms.join(', ')}).
      3. Creative Writer: Draft a high-conversion product narrative focusing on emotional hooks.
      4. Competitor Specialist: Develop a pricing strategy to beat rivals based on researched data.
      5. Compliance Expert: Note strict constraints for ${input.platforms.join(', ')} (Chars, Prohibited terms).

      SYNTHESIS & OUTPUT:
      Now, combine all these expert insights into final, production-ready listings for: ${input.platforms.join(', ')}.
      
      PLATFORM RULES:
      - Amazon.in: 200 char title, 5 bullet points, description, search terms.
      - Flipkart: 150 char title, key features.
      - Meesho: Simple, weight/dimensions focused.
      - Etsy: 13 tags, detailed materials.
      - eBay: Item specifics (Color, Material, etc).

      Return ONLY a valid JSON object where keys are the platform names.
      Values must be objects: { "title", "midTitle", "shortTitle", "description", "bulletPoints", "keywords", "platformSpecificFields", "seoScore", "seoAnalysis" }.
    `;

    const systemInstruction = `
      You are the Lead Market Conductor. 
      Your role is to orchestrate real-time market data, technical SEO, creative copy, and compliance rules into perfect marketplace listings.
      ${HUMANIZER_PROMPT}
      ${SEOMACHINE_PROMPT}
    `;

    const response = await generateGeminiContent({ 
      prompt: collectivePrompt, 
      systemInstruction,
      useSearch: true // Enable Google Search for market intel
    });
    return response.text;
  }
}

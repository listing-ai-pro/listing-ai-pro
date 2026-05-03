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

    const ALL_RULES: Record<string, string> = {
      amazon: "Amazon.in: SEO Product Title, 5 Bullet Points, Long Product Description, Backend Search Keywords, Specification Table.",
      flipkart: "Flipkart: SEO Product Title, Key Features (bullet points), Product Description, Specification Table, Variant Details.",
      ebay: "eBay: SEO Title, Item Specifics, Specification Table, Product Description, Category Suggestion, Pricing Format, Shipping + Return Copy.",
      etsy: "Etsy: Clear Human-Friendly Title, 13 Etsy Tags, Attributes, Specification Table, Description (ensure first 2 lines are SEO Optimized), Storytelling Description, Personalization Fields, Shipping + Processing Time Copy, Photo Shot List.",
      meesho: "Meesho: Catalog Title, Short Description, Product Highlights, Specification Table, Category Attributes, Catalog Variants.",
      shopify: "Shopify: Product Title, Short & Long Description, Specification Table, SEO Meta Title, Meta Description, URL Handle, Image Alt Text, Product Tags.",
      myntra: "Myntra: Fashion Title, Style Attributes, Specification Table, Product Description, Return Reduction Fields.",
      website: "Direct Website: SEO Product Title, Meta Description, H1/H2 Structure, Product Description, Specification Table, Social Share Tags."
    };

    const targetPlatform = input.platforms[0] || 'amazon';
    const platformName = ALL_RULES[targetPlatform]?.split(':')[0] || targetPlatform;

    // Stage 2: Collective Intelligence (Consolidated Call)
    onStepUpdate?.(`Agent Conductor: Researching HSN & GST on authoritative portals for ${platformName}...`);
    onStepUpdate?.(`Quantum Search: Running Real-time Market & SEO Intelligence for ${platformName}...`);
    onStepUpdate?.(`SEO Machine: Drafting optimized listing for ${platformName}...`);

    const platformRule = ALL_RULES[targetPlatform] || `${targetPlatform}: Standard marketplace format.`;

    const collectivePrompt = `
      You are the Lead Marketplace SEO & Growth Architect and Tax Compliance Expert.
      TASK: Generate a high-conversion, SEO-optimized product listing ONLY for: ${targetPlatform}.
      
      CRITICAL COMPLIANCE RESEARCH:
      - Use Google Search to find the OFFICIAL HSN Code and GST Rate for this product in India.
      - Prioritize data from cbic-gst.gov.in, gstcouncil.gov.in, or official GST portals.
      - DO NOT guess or use outdated data. Accuracy is the highest priority for HSN/GST.

      CRITICAL INSTRUCTION:
      Return ONLY a JSON object with one key: "${targetPlatform}". 
      DO NOT generate entries for any other platforms. This is to save API credits and fix UI display issues.
      
      PLATFORM SPECIFIC REQUIREMENTS:
      - ${platformRule}
      
      INSTRUCTIONS FOR EXTRA FIELDS:
      - Any field mentioned in the platform requirements that does not natively fit in "title", "description", or "bulletPoints" MUST be placed in "platformSpecificFields".
      - For Shopify "Short & Long Description": put the short one in "description" and the long one in "platformSpecificFields" under "Long Description".
      - For Etsy: ensure the first 2 lines of high-quality "description" are heavily SEO optimized.
      - For Website: ensure the content has a clear H1 (Title) and H2 (Subheadings) structure.
      Product Identity: ${input.productQuery}
      Visual Context: ${visualContext}
      Additional Info: ${input.additionalInfo || 'None'}

      SUB-AGENT INTELLIGENCE TO APPLY:
      1. Market Intelligence: Research current trends, and COMPETITOR pricing across Amazon, Flipkart, etc.
      2. Compliance & Tax Architect: Research the 100% accurate HSN Code and GST Slab for this item.
      3. SEO Analyst: Identify 20 target keywords for ${targetPlatform}.
      4. Creative Writer: Persuasive copy that triggers emotions.

      SYNTHESIS & OUTPUT SCHEMA (JSON):
      {
        "${targetPlatform}": { 
          "title", 
          "midTitle", 
          "shortTitle", 
          "description", 
          "bulletPoints", 
          "keywords", 
          "platformSpecificFields", 
          "seoScore", 
          "seoAnalysis": { "titleScore", "descriptionScore", "keywordScore", "suggestions" },
          "marketInsights": { "hsnCode", "gstRate", "competitorPrices", "competitorDeepDive", "pricingStrategy" }
        }
      }
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

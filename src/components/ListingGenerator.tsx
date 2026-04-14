import { useState } from 'react';
import { trackUsage, checkLimit } from '../lib/usage';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function ListingGenerator({ user }: { user: any }) {
  const [product, setProduct] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['Amazon']);
  const [results, setResults] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('Amazon');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePlatform = (p: string) => {
    setPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const generateListing = async () => {
    if (platforms.length === 0) return;
    setLoading(true);
    setErrorMsg('');
    
    try {
      // Step 1: System Check - Daily Limit
      const isWithinLimit = await checkLimit(user.uid, 'listingsGenerated', 10);
      if (!isWithinLimit) {
        setErrorMsg('Daily listing limit reached (10/10). Please try again tomorrow.');
        setLoading(false);
        return;
      }

      // Step 2: Market Intelligence (The "Secret Sauce")
      let marketDataStr = '';
      try {
        const marketResponse = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Perform a live market analysis using Google Search for: ${product}. Return ONLY a valid JSON object with this exact structure: { "hsnCode": "string", "gstRate": "string", "pricing": { "budget": "string", "balanced": "string", "premium": "string" } }`,
            modelName: 'gemini-3-flash-preview',
            useSearch: true
          })
        });
        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          marketDataStr = marketData.text;
        }
      } catch (e) {
        console.warn("Market intelligence failed, proceeding without it", e);
      }

      // Step 3: AI-Powered Generation
      const prompt = `
        Market Data: ${marketDataStr}
        Platform Rules: Follow specific rules for ${platforms.join(', ')} (e.g., Amazon title length, Flipkart forbidden words).
        User Input: ${product}
        
        Generate SEO-optimized product listings. Return ONLY a valid JSON object where keys are the platform names (e.g., "Amazon", "Flipkart") and values are the generated listing text (including title variations, bullet points, and description). Make it persuasive and human-written.
      `;

      // Retry Logic (Exponential Backoff)
      let retries = 3;
      let data = null;
      while (retries > 0) {
        try {
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              // Using a more capable model for persuasive copy as requested
              modelName: 'gemini-3.1-pro-preview'
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) {
              throw new Error(errorData.error || "Invalid API Key");
            }
            if (response.status === 429) {
              throw new Error("Rate limit");
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          data = await response.json();
          break; // Success
        } catch (e: any) {
          if (e.message.includes('Invalid API Key')) {
            throw e; // Don't retry on invalid API key
          }
          retries--;
          if (retries === 0) throw e;
          // Wait before retrying (1s, 2s)
          await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
        }
      }

      if (!data) throw new Error("Failed to generate listing");

      // Step 4: JSON Formatting & Compliance
      let parsedResults: Record<string, string> = {};
      try {
        const text = data.text.replace(/```json\n?|\n?```/g, '').trim();
        parsedResults = JSON.parse(text);
      } catch (e) {
        // Fallback if model doesn't return perfect JSON
        parsedResults = { [platforms[0]]: data.text };
      }
      
      // Step 5: UI Display aur Usage Tracking
      setResults(parsedResults);
      setActiveTab(Object.keys(parsedResults)[0] || platforms[0]);
      await trackUsage(user.uid, 'listingsGenerated');
      
    } catch (error: any) {
      console.error('Error generating listing:', error);
      setErrorMsg(error.message || 'An error occurred while generating the listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!results[activeTab]) return;
    navigator.clipboard.writeText(results[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Listing Generator</h2>
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Multi-Platform SEO Optimization</p>
      </div>

      <div className="space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">{errorMsg}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Select Platforms</label>
          <div className="flex flex-wrap gap-4">
            {['Amazon', 'Flipkart', 'Meesho'].map((p) => {
              const isActive = platforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600/5 text-blue-700' 
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Product Details</label>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Describe your product (e.g., Wireless Bluetooth Earbuds with ANC, 30h battery life)"
            className="w-full h-32 rounded-2xl border-2 border-neutral-200 p-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all resize-none font-medium"
          />
        </div>

        <button
          onClick={generateListing}
          disabled={loading || !product || platforms.length === 0}
          className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 w-full sm:w-auto ${
            loading || !product || platforms.length === 0
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-6 w-6" />
              Generate Listings
            </>
          )}
        </button>

        {Object.keys(results).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-12 pt-8 border-t border-neutral-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {Object.keys(results).map(p => (
                  <button
                    key={p}
                    onClick={() => setActiveTab(p)}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      activeTab === p
                        ? 'bg-slate-900 text-white'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Content'}
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl bg-slate-50 p-6 sm:p-8 border border-neutral-200 font-mono text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto"
              >
                {results[activeTab]}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

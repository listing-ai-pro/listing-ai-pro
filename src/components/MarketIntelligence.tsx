import { useState } from 'react';
import { trackUsage } from '../lib/usage';
import { motion } from 'motion/react';
import { Copy, Check, Search, Loader2, Tag, Percent, TrendingUp, DollarSign } from 'lucide-react';

export default function MarketIntelligence({ user }: { user: any }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const analyzeMarket = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Perform a live market analysis using Google Search for: ${query}. Return ONLY a valid JSON object with this exact structure: { "metrics": { "hsnCode": "string", "gstRate": "string", "avgPrice": "string", "demand": "string" }, "benchmarks": ["string", "string"], "competitors": [{ "name": "string", "price": "string", "rating": "string", "features": "string" }] }`,
          modelName: 'gemini-3-flash-preview',
          useSearch: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRawText(data.text);
      
      try {
        const text = data.text.replace(/```json\n?|\n?```/g, '').trim();
        setResult(JSON.parse(text));
      } catch (e) {
        console.error('Failed to parse JSON', e);
        setResult(null);
      }
      
      await trackUsage(user.uid, 'marketAnalysis');
    } catch (error: any) {
      console.error('Error analyzing market:', error);
      setErrorMsg(error.message || 'An error occurred while analyzing the market.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Market Intelligence</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Live Search Analysis</p>
        </div>
        {result && (
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Raw Data'}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
            <span className="text-sm font-bold">{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Product Category or Keyword</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-6 w-6 text-neutral-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Wireless Earbuds, Smart Watches..."
              className="block w-full rounded-2xl border-2 border-neutral-200 py-4 pl-12 pr-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={analyzeMarket}
          disabled={loading || !query}
          className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 w-full sm:w-auto ${
            loading || !query
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Search className="h-6 w-6" />
              Analyze Market
            </>
          )}
        </button>

        {result && result.metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 pt-8 border-t border-neutral-100 space-y-8"
          >
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <Tag className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">HSN Code</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{result.metrics.hsnCode}</div>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <Percent className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">GST Rate</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{result.metrics.gstRate}</div>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Avg Price</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{result.metrics.avgPrice}</div>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Demand</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{result.metrics.demand}</div>
              </div>
            </div>

            {/* Price Benchmarks */}
            {result.benchmarks && result.benchmarks.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Price Benchmarks</h3>
                <div className="flex flex-wrap gap-3">
                  {result.benchmarks.map((benchmark: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                      {benchmark}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison Table */}
            {result.competitors && result.competitors.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse divide-y divide-neutral-100">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Competitor</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Price</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Rating</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Key Features</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      {result.competitors.map((comp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{comp.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">{comp.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-500">{comp.rating}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600">{comp.features}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Fallback for raw text if JSON parsing fails */}
        {rawText && !result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-12 pt-8 border-t border-neutral-100"
          >
             <div className="rounded-3xl bg-slate-50 p-6 sm:p-8 border border-neutral-200 font-mono text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto">
              {rawText}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

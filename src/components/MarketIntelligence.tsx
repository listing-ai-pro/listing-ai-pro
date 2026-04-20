import { useState } from 'react';
import { trackUsage, checkLimit, PLAN_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { trackAction } from '../lib/actions';
import { generateGeminiContent } from '../lib/gemini';
import { isPlanActive } from '../lib/subscription';
import { trackEvent, trackCustom } from '../lib/pixel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Loader2, Tag, Percent, TrendingUp, DollarSign, AlertCircle, 
  Target, Shield, Zap, Info, BarChart3, PieChart, ArrowUpRight, 
  CheckCircle2, XCircle, Lightbulb, ShieldAlert, TrendingDown,
  ChevronRight, ExternalLink, Globe, Star, Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function MarketIntelligence({ user }: { user: any }) {
  const { usage } = useUsage(user);
  const isActive = isPlanActive(user);
  const [query, setQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Amazon.in');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const extractHint = (url: string) => {
    try {
      const decoded = decodeURIComponent(url).toLowerCase();
      // Look for common category keywords in the URL string
      const keywords = ['sofa', 'bedsheet', 'earbud', 'watch', 'phone', 'laptop', 'chair', 'table', 'curtain', 'bottle'];
      const found = keywords.filter(k => decoded.includes(k));
      return found.length > 0 ? `(Category context from URL: ${found.join(', ')})` : '';
    } catch {
      return '';
    }
  };

  const cleanUrl = (url: string) => {
    try {
      if (!url.startsWith('http')) return { url, hint: '' };
      const hint = extractHint(url);
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('amazon')) {
        const pathParts = urlObj.pathname.split('/');
        const dpIdx = pathParts.indexOf('dp');
        if (dpIdx !== -1 && pathParts[dpIdx + 1]) {
          return { url: `${urlObj.origin}/dp/${pathParts[dpIdx + 1]}`, hint };
        }
      }
      return { url, hint };
    } catch {
      return { url, hint: '' };
    }
  };

  const analyzeMarket = async () => {
    setLoading(true);
    setErrorMsg('');
    setResult(null); 
    const { url: cleanedQuery, hint } = cleanUrl(query);
    
    try {
      trackAction('Market Analysis', { query: cleanedQuery });
      const isWithinLimit = await checkLimit(user, 'marketAnalysis');
      if (!isWithinLimit) {
        const planId = user.activePlanId || 'trial';
        const limit = PLAN_LIMITS[planId]?.marketAnalysis || 3;
        setErrorMsg(`Daily market analysis limit reached (${limit}/${limit}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const systemPrompt = `You are an elite e-commerce market researcher for the Indian market. 

      PRIMARY DIRECTIVE:
      You must provide a deep-dive factual analysis for the product on ${selectedPlatform} provided in the URL or Query ${hint}.
      Under NO circumstances should you return "Earbuds" or "TWS" results unless the input is explicitly for an earbud product.

      STRICT EXTRACTION LOGIC:
      1. PLATFORM LOCK: Priority search must be on ${selectedPlatform}.
      2. DETECT INTENT: Look at the URL/Query and the Hint provided. Focus ONLY on the primary product at the link.
      3. ADVANCED INSIGHTS: Include detailed market trends, buyer behavior, and specific competitive pricing strategies.
      4. CATEGORY LOCK: Before generating JSON, verify: "Does this product category match?" 

      DATA ACCURACY:
      - Use ONLY current 2024-2025 market data.
      - Prices must be in INR (₹).

      JSON STRUCTURE (Return ONLY this if identified):
      {
        "identifiedProduct": "string",
        "productCategory": "string",
        "metrics": { "hsnCode": "string", "gstRate": "string", "avgPrice": "string", "demand": "string", "marketSize": "string", "growthRate": "string", "searchVolume": "string", "customerRetention": "string" },
        "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
        "competitors": [{ "name": "string", "price": number, "rating": number, "marketShare": "string", "competitiveEdge": "string", "pros": [], "cons": [] }],
        "sentiment": { "score": number, "summary": "string", "topKeywords": [] },
        "recommendations": ["string", "string", "string"]
      }`;

      const data = await generateGeminiContent({
        prompt: systemPrompt + `\n\nTARGET QUERY/URL: ${cleanedQuery}`,
        useSearch: true
      });
      
      try {
        const text = (data.text || '').replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(text);
        
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        
        setResult(parsed);
      } catch (e) {
        console.error('Failed to parse JSON', e);
        throw new Error('Failed to process market data. Please try again.');
      }
      
      await trackUsage(user.uid, 'marketAnalysis');
      
      // Track Facebook Pixel Event
      trackCustom('MarketAnalysisGenerated', { 
        query,
        userEmail: user.email,
        userId: user.uid
      });
    } catch (error: any) {
      console.error('Error analyzing market:', error);
      setErrorMsg(error.message || 'An error occurred while analyzing the market.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 relative">
      {!isActive && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl rounded-[3rem]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900 p-12 rounded-[3.5rem] shadow-3xl border border-white/5 text-center space-y-8"
          >
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20">
              <Lock className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white font-display">Access Restricted</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Aapka trial ya subscription khatam ho gaya hai. Market intelligence use karne ke liye naya plan buy karein.
              </p>
            </div>
            <div className="pt-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 font-mono">Contact Admin on WhatsApp to Upgrade</p>
              <a 
                href={`https://wa.me/919023654443?text=${encodeURIComponent(`Hi, I want to upgrade my plan for ListingAI.\n\nSeller ID: ${user.sellerId || user.uid?.substring(0, 8)}\nEmail: ${user.email}`)}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-5 rounded-2xl bg-white text-slate-900 hover:bg-blue-600 hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20"
              >
                Upgrade Now
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-3xl text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          >
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400">Global Market Intelligence</span>
          </motion.div>
          <h2 className="text-3xl lg:text-6xl font-black tracking-tight text-white mb-4 font-display leading-[1.1] lg:leading-[0.9]">
            Know Your <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Market</span>,<br />
            Beat the Odds.
          </h2>
          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl w-full lg:w-fit mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 lg:flex-none">
              <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 font-mono">Daily Credits</p>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.marketAnalysis / (PLAN_LIMITS[user.activePlanId || 'trial']?.marketAnalysis || 3)) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-white whitespace-nowrap font-mono">{usage.marketAnalysis} / {PLAN_LIMITS[user.activePlanId || 'trial']?.marketAnalysis || 3}</span>
              </div>
            </div>
          </div>
          <p className="text-sm lg:text-lg font-medium text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Uncover competitor secrets, pricing benchmarks, and market gaps using real-time AI search and data visualization.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-slate-900 p-2 lg:p-3 rounded-[2rem] lg:rounded-[3rem] border border-white/5 shadow-2xl relative z-10 space-y-3"
      >
        <div className="flex bg-slate-950 p-1.5 rounded-[1.5rem] border border-white/5">
          {['Amazon.in', 'Flipkart', 'Meesho', 'Myntra'].map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`flex-1 py-3 text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                selectedPlatform === platform 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 lg:pl-8">
              <Search className="h-5 w-5 lg:h-6 lg:w-6 text-slate-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeMarket()}
              placeholder={`Paste ${selectedPlatform} Product URL or enter name...`}
              className="block w-full rounded-[1.5rem] lg:rounded-[2rem] border-0 bg-slate-950 py-4 lg:py-6 pl-14 lg:pl-18 pr-6 lg:pr-8 text-white placeholder-slate-700 focus:ring-2 focus:ring-blue-600/20 transition-all font-bold text-sm lg:text-lg shadow-inner"
            />
          </div>
          <button
            onClick={analyzeMarket}
            disabled={loading || !query}
            className={`px-8 lg:px-12 py-4 lg:py-6 rounded-[1.5rem] lg:rounded-[2rem] font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 lg:gap-4 transition-all shadow-xl ${
              loading || !query
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Analyze on {selectedPlatform}
              </>
            )}
          </button>
        </div>
      </motion.div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center gap-6 text-red-500 shadow-xl shadow-red-500/5"
        >
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 font-mono text-red-400">Analysis Error</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col sm:flex-row items-center gap-6 text-emerald-400 shadow-xl"
        >
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest font-mono text-emerald-500">Analysis Verified</p>
              <div className="h-1 w-1 rounded-full bg-emerald-900"></div>
              <p className="text-[10px] font-black uppercase tracking-widest font-mono text-blue-400">{result.productCategory || 'Market Data'}</p>
            </div>
            <p className="text-xl lg:text-2xl font-black text-white font-display leading-tight">{result.identifiedProduct}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricCard icon={Tag} label="HSN Code" value={result.metrics.hsnCode} />
              <MetricCard icon={Percent} label="GST Rate" value={result.metrics.gstRate} />
              <MetricCard icon={DollarSign} label="Avg Price" value={result.metrics.avgPrice} />
              <MetricCard icon={TrendingUp} label="Demand" value={result.metrics.demand} />
              <MetricCard icon={Search} label="Search Volume" value={result.metrics.searchVolume} />
              <MetricCard icon={Shield} label="Cust. Retention" value={result.metrics.customerRetention} />
            </div>


            {/* Advanced Recommendation Card */}
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 p-10 rounded-[2.5rem] border border-blue-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <h3 className="text-3xl font-black text-white font-display mb-8">Strategic Recommendations</h3>
                <ul className="space-y-4">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-4 items-start text-lg font-medium text-slate-200">
                      <div className="mt-1 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Zap className="h-3 w-3 text-blue-400" />
                      </div>
                      {rec}
                    </li>
                  ))}
                </ul>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -ml-32 -mt-32 opacity-20"></div>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 font-mono">Customer Voice</h4>
                  <h3 className="text-3xl font-black text-white font-display">Market Sentiment</h3>
                </div>
                <div className="h-16 w-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Star className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                    <circle 
                      cx="96" cy="96" r="88" fill="transparent" stroke="#f59e0b" strokeWidth="16" 
                      strokeDasharray={553}
                      strokeDashoffset={553 - (553 * result.sentiment.score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white">{result.sentiment.score}%</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 font-mono">Positive</span>
                  </div>
                </div>
                <div className="flex-1 space-y-8">
                  <p className="text-xl lg:text-2xl font-medium text-slate-300 leading-relaxed italic font-display">
                    "{result.sentiment.summary}"
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {result.sentiment.topKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-6 py-3 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all cursor-default font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 font-mono">Competitive Landscape</h4>
                  <h3 className="text-2xl font-black text-white font-display">Competitor Deep-Dive</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-slate-300">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Competitor</th>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Price</th>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Rating</th>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Pros & Cons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.competitors.map((comp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="font-black text-white text-lg group-hover:text-blue-400 transition-colors">{comp.name}</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 font-mono">{comp.marketShare} Market Share</div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-2xl font-black text-emerald-400 font-mono">₹{comp.price}</span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                            <span className="font-black text-white text-lg">{comp.rating}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-3 max-w-xs">
                            <div className="flex flex-wrap gap-2">
                              {comp.pros.map((p: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">{p}</span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {comp.cons.map((c: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-red-500/20">{c}</span>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: any) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-white/5 shadow-xl flex flex-col gap-2 transition-all hover:bg-slate-800">
      <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
        <p className="text-xl font-black text-white font-mono">{value}</p>
      </div>
    </div>
  );
}

function SWOTCard({ title, items, icon: Icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} shadow-2xl relative overflow-hidden group bg-slate-950/40 backdrop-blur-md`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
      <div className="flex items-center gap-2 mb-4 relative">
        <Icon className="h-5 w-5" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
      </div>
      <ul className="space-y-2 relative">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-[10px] font-bold leading-relaxed text-slate-300 flex gap-2">
            <span className="shrink-0 opacity-40">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceTier({ label, value }: any) {
  return (
    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 group hover:bg-white hover:shadow-sm transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">{label}</p>
      <p className="text-lg font-black text-slate-900 font-mono">₹{value.replace(/[^0-9,.]/g, '')}</p>
    </div>
  );
}

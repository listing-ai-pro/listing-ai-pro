import { useState } from 'react';
import { trackUsage, checkLimit, USAGE_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { generateGeminiContent } from '../lib/gemini';
import { isPlanActive } from '../lib/subscription';
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
  const { usage } = useUsage(user.uid);
  const isActive = isPlanActive(user);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const analyzeMarket = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const isWithinLimit = await checkLimit(user.uid, 'marketAnalysis');
      if (!isWithinLimit) {
        setErrorMsg(`Daily market analysis limit reached (${USAGE_LIMITS.marketAnalysis}/${USAGE_LIMITS.marketAnalysis}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const systemPrompt = `You are a professional market research analyst. Perform a deep-dive competitor and market analysis for the given query. 
      
      CRITICAL INSTRUCTIONS:
      1. If the query is a URL (e.g., Amazon, Flipkart, or a brand website), you MUST analyze the specific product at that link first. Extract its EXACT current selling price.
      2. Use Google Search to find the ACTUAL current prices of direct competitors on Amazon.in, Flipkart, and Meesho.
      3. Do NOT provide "random" or "estimated" prices. The user needs real-time data.
      4. All prices and monetary values MUST be in Indian Rupees (INR). Use the ₹ symbol.
      5. Ensure the analysis is highly specific to the product/category provided in the query. 

      Return ONLY a valid JSON object with this exact structure:
      {
        "metrics": {
          "hsnCode": "string",
          "gstRate": "string",
          "avgPrice": "string (in INR with ₹ symbol)",
          "demand": "string (Low/Medium/High)",
          "marketSize": "string (in INR)",
          "growthRate": "string"
        },
        "swot": {
          "strengths": ["string"],
          "weaknesses": ["string"],
          "opportunities": ["string"],
          "threats": ["string"]
        },
        "competitors": [
          { "name": "string", "price": number (in INR), "rating": number, "marketShare": "string", "pros": ["string"], "cons": ["string"] }
        ],
        "sentiment": {
          "score": number (0-100),
          "summary": "string",
          "topKeywords": ["string"]
        },
        "radarData": [
          { "subject": "Price", "A": number (0-100) },
          { "subject": "Quality", "A": number (0-100) },
          { "subject": "Features", "A": number (0-100) },
          { "subject": "Support", "A": number (0-100) },
          { "subject": "Brand", "A": number (0-100) }
        ]
      }`;

      const data = await generateGeminiContent({
        prompt: systemPrompt + `\n\nQuery: ${query}`,
        modelName: 'gemini-1.5-flash',
        useSearch: true
      });
      
      try {
        const text = (data.text || '').replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(text);
        setResult(parsed);
      } catch (e) {
        console.error('Failed to parse JSON', e);
        throw new Error('Failed to process market data. Please try again.');
      }
      
      await trackUsage(user.uid, 'marketAnalysis');
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
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 bg-white/60 backdrop-blur-md rounded-[3rem]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-8"
          >
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-600 shadow-xl shadow-red-500/10">
              <Lock className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-slate-900 font-display">Access Restricted</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Aapka trial ya subscription khatam ho gaya hai. Market intelligence use karne ke liye naya plan buy karein.
              </p>
            </div>
            <div className="pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Contact Admin on WhatsApp to Upgrade</p>
              <a 
                href="https://wa.me/919876543210?text=Hi, I want to upgrade my plan for ListingAI."
                target="_blank"
                rel="noreferrer"
                className="block w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20"
              >
                Upgrade Now
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Global Market Intelligence</span>
          </motion.div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 font-display leading-[0.9]">
            Know Your <span className="text-blue-600">Market</span>,<br />
            Beat the Odds.
          </h2>
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm w-fit mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Credits</p>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.marketAnalysis / USAGE_LIMITS.marketAnalysis) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-900">{usage.marketAnalysis} / {USAGE_LIMITS.marketAnalysis}</span>
              </div>
            </div>
          </div>
          <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
            Uncover competitor secrets, pricing benchmarks, and market gaps using real-time AI search and data visualization.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white p-3 rounded-[3rem] border border-slate-100 shadow-2xl relative z-10"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-8">
              <Search className="h-6 w-6 text-slate-300" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeMarket()}
              placeholder="Enter product name, category, or competitor URL..."
              className="block w-full rounded-[2rem] border-0 bg-slate-50 py-6 pl-18 pr-8 text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all font-bold text-lg"
            />
          </div>
          <button
            onClick={analyzeMarket}
            disabled={loading || !query}
            className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl ${
              loading || !query
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Get Insights
              </>
            )}
          </button>
        </div>
      </motion.div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[2.5rem] bg-red-50 border border-red-100 flex items-center gap-6 text-red-700 shadow-xl shadow-red-500/5"
        >
          <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Analysis Error</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
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
            {/* Bento Grid: Phase 1 - Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricCard 
                icon={Tag} 
                label="HSN Code" 
                value={result.metrics.hsnCode} 
                color="blue"
              />
              <MetricCard 
                icon={Percent} 
                label="GST Rate" 
                value={result.metrics.gstRate} 
                color="emerald"
              />
              <MetricCard 
                icon={DollarSign} 
                label="Avg Price" 
                value={result.metrics.avgPrice.includes('₹') ? result.metrics.avgPrice : `₹${result.metrics.avgPrice}`} 
                color="blue"
              />
              <MetricCard 
                icon={TrendingUp} 
                label="Demand" 
                value={result.metrics.demand} 
                color="orange"
              />
            </div>

            {/* Visual Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Price Comparison Chart */}
              <div className="lg:col-span-7 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-30"></div>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Market Benchmarking</h4>
                    <h3 className="text-2xl font-black text-slate-900 font-display">Price Comparison</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.competitors}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}
                        formatter={(value: any) => [`₹${value}`, 'Price']}
                      />
                      <Bar dataKey="price" radius={[12, 12, 0, 0]} barSize={48}>
                        {result.competitors.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0f172a' : '#2563eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Market Dynamics Radar */}
              <div className="lg:col-span-5 bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-3xl -mr-20 -mb-20 opacity-30"></div>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Attribute Analysis</h4>
                    <h3 className="text-2xl font-black text-white font-display">Market Dynamics</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Market Average"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SWOT Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <SWOTCard title="Strengths" items={result.swot.strengths} icon={CheckCircle2} color="emerald" />
              <SWOTCard title="Weaknesses" items={result.swot.weaknesses} icon={XCircle} color="red" />
              <SWOTCard title="Opportunities" items={result.swot.opportunities} icon={Lightbulb} color="amber" />
              <SWOTCard title="Threats" items={result.swot.threats} icon={ShieldAlert} color="orange" />
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -ml-32 -mt-32 opacity-50"></div>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Customer Voice</h4>
                  <h3 className="text-3xl font-black text-slate-900 font-display">Market Sentiment</h3>
                </div>
                <div className="h-16 w-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center">
                  <Star className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                    <circle 
                      cx="96" cy="96" r="88" fill="transparent" stroke="#f59e0b" strokeWidth="16" 
                      strokeDasharray={553}
                      strokeDashoffset={553 - (553 * result.sentiment.score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900">{result.sentiment.score}%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Positive</span>
                  </div>
                </div>
                <div className="flex-1 space-y-8">
                  <p className="text-2xl font-medium text-slate-600 leading-relaxed italic font-display">
                    "{result.sentiment.summary}"
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {result.sentiment.topKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-6 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor List */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Competitive Landscape</h4>
                  <h3 className="text-2xl font-black text-slate-900 font-display">Competitor Deep-Dive</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Competitor</th>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</th>
                      <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Pros & Cons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {result.competitors.map((comp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{comp.name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{comp.marketShare} Market Share</div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-2xl font-black text-emerald-600 font-mono">₹{comp.price}</span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                            <span className="font-black text-slate-900 text-lg">{comp.rating}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-3 max-w-xs">
                            <div className="flex flex-wrap gap-2">
                              {comp.pros.map((p: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">{p}</span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {comp.cons.map((c: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest">{c}</span>
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

function MetricCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col gap-6 transition-all hover:shadow-2xl hover:-translate-y-1 group">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function SWOTCard({ title, items, icon: Icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    red: "text-red-700 bg-red-50 border-red-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    orange: "text-orange-700 bg-orange-50 border-orange-100",
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colors[color]} shadow-xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
      <div className="flex items-center gap-3 mb-6 relative">
        <Icon className="h-6 w-6" />
        <h4 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h4>
      </div>
      <ul className="space-y-4 relative">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-xs font-bold leading-relaxed opacity-80 flex gap-3">
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

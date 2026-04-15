import { useState } from 'react';
import { trackUsage, checkLimit, USAGE_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { generateGeminiContent } from '../lib/gemini';
import { isPlanActive } from '../lib/subscription';
import { trackEvent, trackCustom } from '../lib/pixel';
import { motion } from 'motion/react';
import { Copy, Check, BookOpen, Loader2, Image as ImageIcon, LayoutTemplate, AlertCircle, Lock } from 'lucide-react';

export default function APlusContentGenerator({ user }: { user: any }) {
  const { usage } = useUsage(user.uid);
  const isActive = isPlanActive(user);
  const [product, setProduct] = useState('');
  const [result, setResult] = useState<any>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateContent = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const isWithinLimit = await checkLimit(user.uid, 'aplusGenerated');
      if (!isWithinLimit) {
        setErrorMsg(`Daily A+ content limit reached (${USAGE_LIMITS.aplusGenerated}/${USAGE_LIMITS.aplusGenerated}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const data = await generateGeminiContent({
        prompt: `Generate A+ content modules for a product: ${product}. Return ONLY a valid JSON object with this exact structure: { "headline": "string", "modules": [{ "name": "string", "layout": "string", "content": "string", "imagePrompt": "string" }] }`
      });
      
      setRawText(data.text || '');
      
      try {
        const text = (data.text || '').replace(/```json\n?|\n?```/g, '').trim();
        setResult(JSON.parse(text));
      } catch (e) {
        console.error('Failed to parse JSON', e);
        setResult(null);
      }
      
      await trackUsage(user.uid, 'aplusGenerated');
      
      // Track Facebook Pixel Event
      trackCustom('APlusContentGenerated', {
        userEmail: user.email,
        userId: user.uid
      });
    } catch (error: any) {
      console.error('Error generating A+ content:', error);
      setErrorMsg(error.message || 'An error occurred while generating A+ content.');
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
                Aapka trial ya subscription khatam ho gaya hai. A+ content generate karne ke liye naya plan buy karein.
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

      {/* Header Section */}
      <div className="relative">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <LayoutTemplate className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Premium Brand Content</span>
          </motion.div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 font-display leading-[0.9]">
            A+ Content <span className="text-blue-600">Architect</span>.
          </h2>
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm w-fit mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <LayoutTemplate className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Credits</p>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.aplusGenerated / USAGE_LIMITS.aplusGenerated) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-900">{usage.aplusGenerated} / {USAGE_LIMITS.aplusGenerated}</span>
              </div>
            </div>
          </div>
          <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
            Module-Based Layout Ideas for enhanced brand content. Elevate your product storytelling with AI-driven design concepts.
          </p>
        </div>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[2.5rem] bg-red-50 border border-red-100 flex items-center gap-6 text-red-700 shadow-xl shadow-red-500/5"
        >
          <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Generator Error</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl space-y-10"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Product Blueprint</h4>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Raw Data'}
              </button>
            )}
          </div>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Describe your product features, benefits, and brand story in detail..."
            className="w-full h-64 rounded-[2.5rem] border-0 bg-slate-50 p-8 text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all resize-none font-bold text-lg leading-relaxed"
          />
        </div >

        <div className="flex justify-end">
          <button
            onClick={generateContent}
            disabled={loading || !product}
            className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl w-full sm:w-auto ${
              loading || !product
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Architecting
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                Generate A+ Content
              </>
            )}
          </button>
        </div>
      </motion.div>

      {result && result.modules && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Proposed Strategy</h4>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 font-display">{result.headline}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {result.modules.map((mod: any, idx: number) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -8 }}
                className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl flex flex-col gap-8 group transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 group-hover:scale-150 transition-transform"></div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-8 relative">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <LayoutTemplate className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 font-display">{mod.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Module {idx + 1}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    {mod.layout}
                  </span>
                </div>
                
                <div className="flex-1 relative">
                  <p className="text-base font-medium text-slate-600 leading-relaxed font-display">{mod.content}</p>
                </div>
                
                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col gap-4 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-all relative">
                  <div className="flex items-center gap-3 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Visual Direction</span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed italic opacity-80">"{mod.imagePrompt}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Fallback for raw text if JSON parsing fails */}
      {rawText && !result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-8"
        >
           <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Raw Generation Output</h4>
            {rawText}
          </div>
        </motion.div>
      )}
    </div>
  );
}

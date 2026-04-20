import { useState, useRef } from 'react';
import { trackUsage, checkLimit, PLAN_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { trackAction } from '../lib/actions';
import { generateGeminiContent } from '../lib/gemini';
import { isPlanActive } from '../lib/subscription';
import { trackEvent, trackCustom } from '../lib/pixel';
import { motion } from 'motion/react';
import { Copy, Check, BookOpen, Loader2, Image as ImageIcon, LayoutTemplate, AlertCircle, Lock, UploadCloud } from 'lucide-react';

export default function APlusContentGenerator({ user }: { user: any }) {
  const { usage } = useUsage(user);
  const isActive = isPlanActive(user);
  const [product, setProduct] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<any>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateContent = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      trackAction('A+ Content Generation', { product, hasImage: !!image });
      const isWithinLimit = await checkLimit(user, 'aplusGenerated');
      if (!isWithinLimit) {
        const planId = user.activePlanId || 'trial';
        const limit = PLAN_LIMITS[planId]?.aplusGenerated || 2;
        setErrorMsg(`Daily A+ content limit reached (${limit}/${limit}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const prompt = image 
        ? `Analyze this product image and context: "${product}". Generate premium Amazon A+ content modules. Use visual cues from the image to describe features, benefits, and brand story. Return ONLY a valid JSON object with this exact structure: { "headline": "string", "modules": [{ "name": "string", "layout": "string", "content": "string", "imagePrompt": "string" }] }`
        : `Generate premium Amazon A+ content modules for this product: "${product}". Describe features, benefits, and brand story in detail. Return ONLY a valid JSON object with this exact structure: { "headline": "string", "modules": [{ "name": "string", "layout": "string", "content": "string", "imagePrompt": "string" }] }`;

      const data = await generateGeminiContent({
        prompt: prompt,
        image: image || undefined
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
                Aapka trial ya subscription khatam ho gaya hai. A+ content generate karne ke liye naya plan buy karein.
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

      {/* Header Section */}
      <div className="relative">
        <div className="max-w-3xl text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          >
            <LayoutTemplate className="h-4 w-4 text-blue-400" />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400">Premium Brand Content</span>
          </motion.div>
          <h2 className="text-3xl lg:text-6xl font-black tracking-tight text-white mb-6 font-display leading-[1.1] lg:leading-[0.9]">
            A+ Content <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Architect</span>.
          </h2>
          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl w-full lg:w-fit mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <LayoutTemplate className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 lg:flex-none">
              <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 font-mono">Daily Credits</p>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.aplusGenerated / (PLAN_LIMITS[user.activePlanId || 'trial']?.aplusGenerated || 2)) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-white whitespace-nowrap font-mono">{usage.aplusGenerated} / {PLAN_LIMITS[user.activePlanId || 'trial']?.aplusGenerated || 2}</span>
              </div>
            </div>
          </div>
          <p className="text-sm lg:text-lg font-medium text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Module-Based Layout Ideas for enhanced brand content. Elevate your product storytelling with AI-driven design concepts.
          </p>
        </div>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center gap-6 text-red-500 shadow-xl shadow-red-500/5"
        >
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 font-mono text-red-400">Generator Error</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6"
        >
          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">Product Visual</h4>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-video rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 group overflow-hidden ${
                image ? 'border-blue-500 bg-slate-950 shadow-2xl' : 'border-white/5 bg-slate-950/40 hover:bg-slate-950/60 hover:border-white/20 hover:shadow-xl'
              }`}
            >
              {image ? (
                <div className="relative w-full h-full">
                  <img src={image} alt="Product" className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                    <span className="text-white font-black text-[9px] uppercase tracking-widest font-mono">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm font-black text-white mb-0.5 font-display">Add Product Photo</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">Upload or Drag & Drop</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">Product Context</h4>
            </div>
            <textarea
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Describe features, benefits, and target audience..."
              className="w-full h-40 rounded-[2rem] border-0 bg-slate-950 p-6 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-600/20 transition-all resize-none font-bold text-sm leading-relaxed shadow-inner"
            />
          </div>

          <button
            onClick={generateContent}
            disabled={loading || (!product && !image)}
            className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl ${
              loading || (!product && !image)
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Architecting Content...
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                Build Premium A+ Layout
              </>
            )}
          </button>
        </motion.div>

        {/* Preview / Results Column */}
        <div className="space-y-8">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8 h-full"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 font-mono mb-1">Generated Blueprint</h4>
                  <h3 className="text-2xl font-black text-white font-display truncate max-w-[200px] sm:max-w-none">{result.headline}</h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="h-10 px-4 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-white/5"
                >
                  {copied ? <Check className="h-4 w-4" /> : 'Copy Data'}
                </button>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {result.modules.map((mod: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-950 border border-white/5 space-y-4 group">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono bg-white/5 px-3 py-1 rounded-lg">Module {idx + 1}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">{mod.layout}</span>
                    </div>
                    <h5 className="text-lg font-black text-white font-display">{mod.name}</h5>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"{mod.content}"</p>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2 font-mono">Image Suggestion</p>
                      <p className="text-xs font-bold text-blue-400/80 leading-relaxed bg-blue-400/5 p-3 rounded-xl border border-blue-400/10">
                        {mod.imagePrompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] rounded-[3.5rem] bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center mb-6 shadow-2xl">
                <LayoutTemplate className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 font-display">Waiting for Input</h3>
              <p className="text-sm text-slate-500 max-w-[200px] font-mono leading-relaxed uppercase tracking-widest">Architect your A+ content strategy here</p>
            </div>
          )}
        </div>
      </div>
      
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

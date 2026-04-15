import React, { useState, useRef } from 'react';
import { trackUsage, checkLimit, USAGE_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { generateGeminiContent } from '../lib/gemini';
import { compressImage } from '../lib/utils';
import { isPlanActive } from '../lib/subscription';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Loader2, UploadCloud, Image as ImageIcon, AlertCircle, 
  CheckCircle2, Info, Package, Scale, Ruler, Lightbulb, 
  ArrowRight, ShieldCheck, TrendingDown, Lock
} from 'lucide-react';

export default function MeeshoShippingOptimizer({ user }: { user: any }) {
  const { usage } = useUsage(user.uid);
  const isActive = isPlanActive(user);
  const [image, setImage] = useState<string | null>(null);
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image size too large. Please upload an image smaller than 20MB.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      setOptimizedImage(null);
      setResult(null);
      setErrorMsg('');
    } catch (error) {
      console.error('Error compressing image:', error);
      setErrorMsg('Failed to process image. Please try another one.');
    }
  };

  const generateAlgorithmPhoto = async () => {
    if (!image) return;
    setOptimizing(true);
    setErrorMsg('');
    try {
      const isWithinLimit = await checkLimit(user.uid, 'shippingOptimizations');
      if (!isWithinLimit) {
        setErrorMsg(`Daily shipping optimization limit reached (${USAGE_LIMITS.shippingOptimizations}/${USAGE_LIMITS.shippingOptimizations}). Please try again tomorrow.`);
        setOptimizing(false);
        return;
      }

      const contents = {
        parts: [
          { text: "Generate a highly optimized product photo for Meesho shipping algorithms. The goal is to make the product look as compact and lightweight as possible. Use a clean, minimalist background, a top-down flatlay angle, and ensure the product is folded or placed to look extremely small. This photo is intended to help the product stay in the lowest shipping weight slab (under 500g) by emphasizing its smallness and lack of bulk." },
          {
            inlineData: {
              data: image.split(',')[1],
              mimeType: image.split(';')[0].split(':')[1]
            }
          }
        ]
      };

      const data = await generateGeminiContent({
        contents,
        modelName: 'gemini-3.1-flash-image-preview'
      });

      if (data.image) {
        setOptimizedImage(data.image);
        await trackUsage(user.uid, 'shippingOptimizations');
      } else {
        throw new Error('Failed to generate optimized photo.');
      }
    } catch (error: any) {
      console.error('Error generating optimized photo:', error);
      setErrorMsg(error.message || 'An error occurred while generating the optimized photo.');
    } finally {
      setOptimizing(false);
    }
  };

  const optimizeShipping = async () => {
    if (!image) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const isWithinLimit = await checkLimit(user.uid, 'shippingOptimizations');
      if (!isWithinLimit) {
        setErrorMsg(`Daily shipping optimization limit reached (${USAGE_LIMITS.shippingOptimizations}/${USAGE_LIMITS.shippingOptimizations}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const systemPrompt = `You are a Meesho Logistics and Shipping Expert. 
      Analyze the provided product image and provide a highly specific "Low Shipping Strategy" for Meesho India.
      
      MEESHO SPECIFIC TRICKS TO INCLUDE:
      1. Weight Slab Optimization: Meesho has slabs like 0-500g, 500g-1kg. Suggest how to stay under 500g (e.g., use polybags instead of boxes).
      2. Volumetric Weight: Explain how to fold or pack the product to minimize L x W x H / 5000.
      3. Category Selection: Some categories have promotional shipping rates. Suggest the best category.
      4. Regional vs National: Tips on how to get more regional orders to lower shipping costs.
      5. Packaging Material: Recommend specific lightweight packaging (e.g., 50-micron polybags).
      6. Algorithm Hack: Suggest a specific photo angle or background that makes the product appear smaller to Meesho's automated dimension checks.

      Return ONLY a valid JSON object with this exact structure:
      {
        "estimatedWeight": "string (e.g., 350g - 450g)",
        "weightCategory": "string (e.g., Under 500g)",
        "recommendedDimensions": "string (e.g., 20x15x5 cm)",
        "shippingClass": "string (e.g., Local/Regional/National)",
        "tricks": [
          { "title": "string", "description": "string" }
        ],
        "packagingTips": ["string"],
        "costSavingEstimate": "string (e.g., ₹25 - ₹45 per order)"
      }`;

      const contents = {
        parts: [
          { text: "Analyze this product for Meesho shipping optimization. Focus on how to keep it in the lowest weight slab and smallest volumetric weight." },
          {
            inlineData: {
              data: image.split(',')[1],
              mimeType: image.split(';')[0].split(':')[1]
            }
          }
        ]
      };

      const data = await generateGeminiContent({
        contents,
        prompt: systemPrompt,
        modelName: 'gemini-3-flash-preview'
      });

      try {
        const text = (data.text || '').replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(text);
        setResult(parsed);
      } catch (e) {
        console.error('Failed to parse JSON', e);
        throw new Error('Failed to process optimization data. Please try again.');
      }

      await trackUsage(user.uid, 'shippingOptimizations');
    } catch (error: any) {
      console.error('Error optimizing shipping:', error);
      setErrorMsg(error.message || 'An error occurred while analyzing the product.');
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
                Aapka trial ya subscription khatam ho gaya hai. Meesho shipping optimizer use karne ke liye naya plan buy karein.
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

      {/* Header */}
      <div className="relative">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6"
          >
            <Zap className="h-4 w-4 text-orange-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Logistics Optimization</span>
          </motion.div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 font-display leading-[0.9]">
            Meesho <span className="text-orange-600">Shipping</span><br />
            Optimizer.
          </h2>
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm w-fit mb-6">
            <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Credits</p>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.shippingOptimizations / USAGE_LIMITS.shippingOptimizations) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-900">{usage.shippingOptimizations} / {USAGE_LIMITS.shippingOptimizations}</span>
              </div>
            </div>
          </div>
          <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
            Optimize weight & packaging to get the lowest shipping rates on Meesho. Beat the algorithm and save on every order.
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
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Logistics Error</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl space-y-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Product Analysis</h4>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-80 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                  image ? 'border-orange-500 bg-white' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-300 hover:shadow-xl'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                {image ? (
                  <div className="relative w-full h-full p-4">
                    <img src={image} alt="Product" className="w-full h-full object-contain rounded-2xl" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2.5rem]">
                      <span className="text-white font-black text-xs uppercase tracking-widest">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-8">
                    <div className="h-20 w-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-10 w-10 text-orange-500" />
                    </div>
                    <p className="text-lg font-black text-slate-900 mb-2 font-display">Drop product photo</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI will estimate weight</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={optimizeShipping}
                disabled={loading || optimizing || !image}
                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl ${
                  loading || optimizing || !image
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20 active:scale-95'
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
                    Get Analysis
                  </>
                )}
              </button>
              <button
                onClick={generateAlgorithmPhoto}
                disabled={loading || optimizing || !image}
                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl ${
                  loading || optimizing || !image
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95'
                }`}
              >
                {optimizing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Hacking
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Algorithm Hack
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-blue-50 border border-blue-100 flex items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 rounded-full blur-3xl -mr-12 -mt-12 opacity-10"></div>
            <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
            <div className="relative">
              <p className="text-[10px] font-black text-blue-900 mb-2 uppercase tracking-widest">Expert Logistics Tip</p>
              <p className="text-xs font-bold text-blue-700 leading-relaxed">
                Meesho's shipping slabs change at 500g, 1kg, and 2kg. Even 1 gram over 500g can double your shipping cost. 
                Always use lightweight polybags instead of cardboard for products under 500g.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-10">
          <AnimatePresence mode="wait">
            {optimizedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
                <div className="flex items-center justify-between mb-8 relative">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Algorithm Optimized</h4>
                    <h3 className="text-2xl font-black text-slate-900 font-display">Listing Photo</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-slate-50 bg-slate-50 mb-8 relative group">
                  <img src={optimizedImage} alt="Optimized" className="w-full h-full object-contain p-8" />
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = optimizedImage;
                      link.download = 'meesho-optimized-photo.png';
                      link.click();
                    }}
                    className="absolute bottom-6 right-6 h-14 w-14 bg-white shadow-2xl rounded-2xl text-slate-900 hover:bg-orange-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 flex items-center justify-center"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-700 leading-relaxed italic">
                    "This photo is generated to emphasize compactness. Use this as your primary listing photo to influence Meesho's automated weight/dimension estimation."
                  </p>
                </div>
              </motion.div>
            )}

            {!result && !optimizedImage ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[600px] bg-slate-50/50 rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="h-24 w-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mb-8">
                  <Info className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 font-display">Optimization Ready</h3>
                <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                  Upload your product image to see how you can save on Meesho shipping costs.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                {/* Core Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
                    <div className="flex items-center gap-3 text-orange-500 mb-6 relative">
                      <Scale className="h-6 w-6" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Est. Weight</span>
                    </div>
                    <p className="text-4xl font-black text-slate-900 font-mono tracking-tight relative">{result?.estimatedWeight || 'N/A'}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest relative">{result?.weightCategory || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
                    <div className="flex items-center gap-3 text-blue-500 mb-6 relative">
                      <Ruler className="h-6 w-6" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Box Size</span>
                    </div>
                    <p className="text-4xl font-black text-slate-900 font-mono tracking-tight relative">{result?.recommendedDimensions || 'N/A'}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest relative">Recommended</p>
                  </div>
                </div>

                {/* Cost Saving Badge */}
                <div className="bg-emerald-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mb-32 opacity-10 group-hover:scale-150 transition-transform"></div>
                  <div className="flex items-center justify-between relative">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Potential Savings</p>
                      <p className="text-5xl font-black font-display">{result?.costSavingEstimate || '₹0'}</p>
                      <p className="text-xs font-bold opacity-60 mt-2 uppercase tracking-widest">Per Order Optimized</p>
                    </div>
                    <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <TrendingDown className="h-10 w-10" />
                    </div>
                  </div>
                </div>

                {/* Tricks Section */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Strategy Guide</h4>
                      <h3 className="text-2xl font-black text-slate-900 font-display">Shipping Secrets</h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {result?.tricks?.map((trick: any, i: number) => (
                      <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                        <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-orange-600 transition-colors font-display">{trick.title}</h4>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{trick.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packaging Section */}
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-3xl -mr-20 -mt-20 opacity-20"></div>
                  <div className="flex items-center justify-between mb-10 relative">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Logistics Checklist</h4>
                      <h3 className="text-2xl font-black text-white font-display">Packaging Protocol</h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <ul className="space-y-6 relative">
                    {result?.packagingTips?.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-base font-medium text-slate-300">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

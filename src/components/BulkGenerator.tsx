import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpaceLoader } from './SpaceLoader';
import { 
  Sparkles, Loader2, FileText, CheckCircle, UploadCloud, 
  ImageIcon, Camera, Zap, AlertCircle, Copy, Box, Download,
  Lock
} from 'lucide-react';
import { generateGeminiContent } from '../lib/gemini';
import { compressImage } from '../lib/utils';
import { trackUsage, checkLimit } from '../lib/usage';
import { trackCustom } from '../lib/pixel';
import { trackAction } from '../lib/actions';

interface MegaResult {
  seo: {
    title: string;
    description: string;
    keywords: string[];
    attributes: Record<string, string>;
  } | null;
  lifestyleImg: string | null;
  shippingImg: string | null;
}

export default function BulkGenerator({ user }: { user: any }) {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MegaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError('Image size too large. Max 20MB.');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      setError(null);
    } catch (err) {
      setError('Failed to process image.');
    }
  };

  const handleBackImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError('Back image size too large. Max 20MB.');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setBackImage(compressed);
      setError(null);
    } catch (err) {
      setError('Failed to process back image.');
    }
  };

  const handleProcess = async () => {
    if (!productName.trim() || !image) {
      setError("Product ka naam aur ek clear FRONT photo zaroori hai.");
      return;
    }

    const currentPlanId = user?.activePlanId || 'trial';
    if (currentPlanId !== 'yearly') {
      setError("Mega Listing (Bulk Generator) functionality sirf Yearly plan ke liye available hai.");
      return;
    }

    const canProduce = await checkLimit(user, 'bulkGenerated');
    if (!canProduce) {
      setError("Aapki daily Bulk Generator limit khatam ho gayi hai (5 per day).");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult({ seo: null, lifestyleImg: null, shippingImg: null });

    const finalResult: MegaResult = { seo: null, lifestyleImg: null, shippingImg: null };

    try {
      // Step 1: SEO Text Generation
      setActiveAgent("🔍 SEO Agent analyzing product (Front & Back) & market...");
      setProgress(15);
      
      const seoPrompt = `Analyze this product image${backImage ? 's (Front and Back)' : ''} and name ("${productName}"). Generate highly optimzed ecommerce details taking all design contexts into account.
Return ONLY valid JSON:
{
  "title": "SEO Optimized highly clickable title (max 150 chars)",
  "description": "Persuasive 2-paragraph description highlighting benefits and design",
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "attributes": { "Material": "...", "Color": "...", "Style": "...", "Fit/Size": "..." }
}`;
      
      const parts: any[] = [
        { inlineData: { data: image.split(',')[1], mimeType: image.split(';')[0].split(':')[1] } }
      ];
      if (backImage) {
        parts.push({ inlineData: { data: backImage.split(',')[1], mimeType: backImage.split(';')[0].split(':')[1] } });
      }
      parts.push({ text: seoPrompt });

      const contents = { parts };
      
      const seoResponse = await generateGeminiContent({ prompt: seoPrompt, contents, useSearch: true });
      try {
        const textJSON = seoResponse.text.replace(/```json\n?|\n?```/g, '').trim();
        finalResult.seo = JSON.parse(textJSON);
      } catch (e) {
        throw new Error("SEO Generation parsing failed.");
      }
      setResult({ ...finalResult });
      await new Promise(r => setTimeout(r, 1000)); // Buffer for Rate Limiting

      // Step 2: AI Photoshoot Lifestyle
      setActiveAgent("📸 Creative Agent styling high-end lifestyle shot...");
      setProgress(50);
      const lifestylePrompt = {
        parts: [
          { inlineData: { data: image.split(',')[1], mimeType: image.split(';')[0].split(':')[1] } },
          { text: "Generate a realistic product aesthetic photoshoot. Place this product seamlessly into a premium, photorealistic lifestyle environment that suits the product naturally. Beautiful studio lighting, 8k resolution, perfect shadows." }
        ]
      };
      const lifestyleRes = await generateGeminiContent({ contents: lifestylePrompt, modelName: 'gemini-2.5-flash-image' });
      if (lifestyleRes.image) finalResult.lifestyleImg = lifestyleRes.image;
      setResult({ ...finalResult });
      await new Promise(r => setTimeout(r, 1000));

      // Step 3: Meesho Shipping Setup
      setActiveAgent("📦 Logistics Agent creating compact dimension graphics...");
      setProgress(85);
      const shippingPrompt = {
        parts: [
          { inlineData: { data: image.split(',')[1], mimeType: image.split(';')[0].split(':')[1] } },
          { text: "Generate a photorealistic e-commerce image based on this proven strategy: 'Meesho’s algorithm can sometimes miscalculate volumetric weight based on image presentation, leading to higher shipping slab estimations. Adjust Padding: Create an image with specific padding where the product occupies EXACTLY 65–70% of the area to lower estimated shipping costs. Vertical Alignment: Ensure your product is perfectly centered and vertically aligned upright (e.g., Ghost mannequin, no folding, no flat-lay) in the primary image to avoid category-based shipping penalties.' Strictly follow these padding and alignment rules while ensuring the apparel's original design is fully and beautifully visible." }
        ]
      };
      const shippingRes = await generateGeminiContent({ contents: shippingPrompt, modelName: 'gemini-2.5-flash-image' });
      if (shippingRes.image) finalResult.shippingImg = shippingRes.image;
      
      setProgress(100);
      setActiveAgent("✅ Mega Pipeline Complete!");
      setResult({ ...finalResult });

      await trackUsage(user.uid, 'bulkGenerated');
      trackUsage(user.uid, 'listingsGenerated').catch(()=>{});
      trackUsage(user.uid, 'photoshoots').catch(()=>{});
      
      trackAction('Mega_Generator_Run', { product: productName });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Pipeline failed at some step. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const AgentsLoader = () => (
    <div className="w-full bg-black/60 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] space-y-12 relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]">
      {/* Deep Space Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black opacity-80"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-10">
        
        {/* GenZ 3D Orb Animation */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Core Energy */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180, 270, 360],
              borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "30% 70% 50% 50% / 50% 30% 70% 40%", "50%"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-60 blur-2xl"
          />
          
          {/* Outer Glass Ring 1 */}
          <motion.div
            animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-2 border-dashed border-blue-400/50 rounded-full"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Outer Glass Ring 2 (Opposite) */}
          <motion.div
            animate={{ rotateX: [360, 0], rotateY: [360, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Center Icon */}
          <motion.div 
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 h-16 w-16 bg-black/80 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(59,130,246,0.6)]"
          >
            <Zap className="h-7 w-7 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400 fill-blue-500/20" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h4 className="text-2xl font-black text-white font-display tracking-tight">Neural Sync Active ⚡</h4>
          <motion.div 
            key={activeAgent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 italic tracking-wide"
          >
            {activeAgent}
          </motion.div>
        </div>

        {/* Cyberpunk Progress Bar */}
        <div className="w-full max-w-sm space-y-2">
           <div className="flex justify-between items-center px-1">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">System Load</span>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 font-mono">{progress}%</span>
           </div>
           <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full relative overflow-hidden transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
              >
                {/* Highlights on bar */}
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[shimmer_1.5s_infinite]"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <AnimatePresence>
        {isProcessing && <SpaceLoader step={activeAgent} />}
      </AnimatePresence>
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <Zap className="h-4 w-4 fill-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pro Mega-Pipeline</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-black text-white font-display leading-[1.1]">
          One-Click <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Mega Listing</span>
        </h2>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
          Product ki details aur photo upload karein. Hamara AI agents ko ek saath lagakar SEO Title, Lifestyle Photoshoot, aur Shipping Graphic <b>ek hi baar</b> mein generate kar dega.
        </p>
      </div>

      {!result && !isProcessing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="glass-card p-8 lg:p-12 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform"></div>
            
            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" /> Product Name / Query
              </label>
              <input 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Blue Silk Saree with Golden Zari"
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 py-5 px-6 text-white placeholder-slate-500 focus:border-blue-500 outline-none font-bold transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Front Image Box */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-emerald-400" /> Front Photo <span className="text-emerald-500">*</span>
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group h-56 ${
                    image ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/50'
                  }`}
                >
                  {image ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform">
                      <img src={image} alt="Front Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Front</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <UploadCloud className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-slate-300">Front Main Image</p>
                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Required</p>
                      </div>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Back Image Box */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-400" /> Back Side Photo <span className="text-slate-600">(Optional)</span>
                </label>
                
                <div 
                  onClick={() => backFileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group h-56 ${
                    backImage ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/50'
                  }`}
                >
                  {backImage ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform">
                      <img src={backImage} alt="Back Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Back</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-14 w-14 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <UploadCloud className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-slate-300">Back/Context Detail</p>
                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Optional for AI</p>
                      </div>
                    </>
                  )}
                  <input ref={backFileInputRef} type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleBackImageUpload} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 animate-headShake relative z-10">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button
              onClick={handleProcess}
              className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10"
            >
              <Sparkles className="h-5 w-5" />
              Launch Mega Pipeline
            </button>
          </div>
        </motion.div>
      )}

      {isProcessing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
          <AgentsLoader />
        </motion.div>
      )}

      {result && !isProcessing && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <button onClick={() => setResult(null)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-all">← Start New Product</button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SEO Data (Left Col) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[50px] -mr-16 -mt-16"></div>
                
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 justify-between mb-8">
                  <span>📝 SEO Intelligence</span>
                  {result.seo && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </h3>

                {result.seo ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Optimized Title (Global)</p>
                       <div className="p-4 bg-slate-950/50 border border-white/5 rounded-xl group relative">
                          <p className="text-white font-bold text-sm">{result.seo.title}</p>
                          <button onClick={() => navigator.clipboard.writeText(result?.seo?.title || '')} className="absolute top-2 right-2 p-1.5 bg-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="h-3 w-3 text-white" /></button>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Description</p>
                       <div className="p-4 bg-slate-950/50 border border-white/5 rounded-xl text-slate-300 font-medium text-xs leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                          {result.seo.description}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Platform Attributes</p>
                       <div className="grid grid-cols-2 gap-3">
                          {Object.entries(result.seo.attributes).map(([k, v], i) => (
                             <div key={i} className="bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-lg">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{k}</p>
                                <p className="text-[10px] font-bold text-white truncate">{v}</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Backend Keywords</p>
                       <div className="flex flex-wrap gap-2">
                          {result.seo.keywords.map((k, i) => (
                            <span key={i} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-black uppercase tracking-widest">{k}</span>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10 opacity-50"><AlertCircle className="h-8 w-8 text-slate-600 mb-4"/><p className="text-xs font-bold text-slate-400">SEO Check Failed</p></div>
                )}
              </div>
            </div>

            {/* Media Assets (Right Col) */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AI Lifestyle */}
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center justify-between mb-4">
                  <span>📸 AI Photoshoot</span>
                  {result.lifestyleImg && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </h3>
                <div className="flex-1 bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden relative group/img cursor-pointer min-h-[250px] shadow-inner">
                   {result.lifestyleImg ? (
                     <>
                      <img src={result.lifestyleImg} alt="AI Lifestyle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <a href={result.lifestyleImg} download="lifestyle_product.jpg" className="absolute bottom-4 right-4 h-10 w-10 bg-slate-900/80 backdrop-blur text-white flex items-center justify-center rounded-xl opacity-0 group-hover/img:opacity-100 transition-all hover:bg-blue-600"><Download className="h-5 w-5"/></a>
                     </>
                   ) : <div className="text-center"><Camera className="h-8 w-8 text-slate-600 mb-2 mx-auto"/><span className="text-[9px] font-bold uppercase text-slate-500">Styling set...</span></div>}
                </div>
              </div>

              {/* Shipping Optimized */}
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 flex flex-col shadow-xl">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center justify-between mb-4">
                  <span>📦 Meesho Shipping</span>
                  {result.shippingImg && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </h3>
                <div className="flex-1 bg-slate-950 rounded-3xl flex items-center justify-center overflow-hidden relative group/img cursor-pointer min-h-[250px] shadow-inner">
                   {result.shippingImg ? (
                     <>
                      <img src={result.shippingImg} alt="Shipping Infographic" className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <a href={result.shippingImg} download="shipping_graphic.jpg" className="absolute bottom-4 right-4 h-10 w-10 bg-emerald-600/90 backdrop-blur text-white flex items-center justify-center rounded-xl opacity-0 group-hover/img:opacity-100 transition-all hover:bg-emerald-500 shadow-xl shadow-emerald-500/20"><Download className="h-5 w-5"/></a>
                     </>
                   ) : <div className="text-center animate-pulse"><Box className="h-8 w-8 text-slate-700 mb-2 mx-auto"/><span className="text-[9px] font-bold uppercase text-slate-600">Calculating...</span></div>}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


import React, { useState, useRef } from 'react';
import { trackUsage, checkLimit, USAGE_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { generateGeminiContent } from '../lib/gemini';
import { compressImage } from '../lib/utils';
import { isPlanActive } from '../lib/subscription';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, Check, Camera, Loader2, UploadCloud, Image as ImageIcon, 
  AlertCircle, Sparkles, Zap, Box, Shirt, Monitor, 
  ChevronRight, Settings2, Wand2, Palette, Layers, Download, User, Lock
} from 'lucide-react';

export default function AIPhotoStudio({ user }: { user: any }) {
  const { usage } = useUsage(user.uid);
  const isActive = isPlanActive(user);
  const [mode, setMode] = useState<'APPAREL' | 'PRODUCT' | 'MOCKUP'>('APPAREL');
  const [activeTab, setActiveTab] = useState<'Model' | 'Apparel'>('Apparel');
  const [prompt, setPrompt] = useState('');
  const [pose, setPose] = useState('Full Body Front');
  const [background, setBackground] = useState('');
  const [realismBoost, setRealismBoost] = useState(true);
  const [result, setResult] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const poses = ['Full Body Front', 'Hand on Hip', 'Back View', '3/4 View'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image size too large. Please upload an image smaller than 20MB.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setProductImage(compressed);
      setResultImage(null);
      setErrorMsg('');
    } catch (error) {
      console.error('Error compressing image:', error);
      setErrorMsg('Failed to process image. Please try another one.');
    }
  };

  const generateImage = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const isWithinLimit = await checkLimit(user.uid, 'photoshoots');
      if (!isWithinLimit) {
        setErrorMsg(`Daily photoshoot limit reached (${USAGE_LIMITS.photoshoots}/${USAGE_LIMITS.photoshoots}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const contents = {
        parts: [
          { text: `Generate a high-quality, professional ${mode.toLowerCase()} photo for: ${prompt}. 
          Pose/Angle: ${pose}. 
          Background: ${background || 'Clean studio'}. 
          Realism Boost: ${realismBoost ? 'Enabled (Ultra-realistic textures and lighting)' : 'Standard'}.
          The result must be a realistic, high-resolution image suitable for an e-commerce listing.` },
          ...(productImage ? [{
            inlineData: {
              data: productImage.split(',')[1],
              mimeType: productImage.split(';')[0].split(':')[1]
            }
          }] : [])
        ]
      };

      const data = await generateGeminiContent({
        contents,
        modelName: 'gemini-1.5-flash'
      });
      
      if (data.image) {
        setResultImage(data.image);
        setResult(data.text || '');
        await trackUsage(user.uid, 'photoshoots');
      } else {
        throw new Error('AI did not return an image. Please try again with a different prompt.');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      setErrorMsg(error.message || 'An error occurred while generating the image.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const event = { target: { files: [file] } } as any;
      handleFileChange(event);
    }
  };

  return (
    <div className="max-w-full mx-auto bg-[#0f172a] min-h-screen -m-10 p-10 font-sans selection:bg-blue-500/30 relative">
      {!isActive && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-md rounded-[3rem]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#1e293b] p-12 rounded-[3rem] shadow-2xl border border-slate-800 text-center space-y-8"
          >
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
              <Lock className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white font-display">Access Restricted</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Aapka trial ya subscription khatam ho gaya hai. AI Photo Studio use karne ke liye naya plan buy karein.
              </p>
            </div>
            <div className="pt-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Contact Admin on WhatsApp to Upgrade</p>
              <a 
                href="https://wa.me/919876543210?text=Hi, I want to upgrade my plan for ListingAI."
                target="_blank"
                rel="noreferrer"
                className="block w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
              >
                Upgrade Now
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-[#1e293b] rounded-3xl p-4 mb-8 flex items-center justify-between border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-8">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-none tracking-tighter">STUDIO <span className="text-blue-500">PRO</span></h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">Elite Access</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-r border-slate-700 pr-8">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Daily Limit</p>
              <div className="flex items-center gap-3">
                <div className="h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.photoshoots / USAGE_LIMITS.photoshoots) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-white">{USAGE_LIMITS.photoshoots - usage.photoshoots} / {USAGE_LIMITS.photoshoots} LEFT</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            {(['APPAREL', 'PRODUCT', 'MOCKUP'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  mode === m 
                    ? 'bg-white text-slate-900 shadow-xl' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'APPAREL' && <Shirt className="h-3 w-3" />}
                {m === 'PRODUCT' && <Box className="h-3 w-3" />}
                {m === 'MOCKUP' && <Monitor className="h-3 w-3" />}
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Neural Engine Active</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">V2.5 Ultra-HD</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2">
            <Wand2 className="h-3.5 w-3.5" />
            Auto-Magic Shoot
          </button>
          <button 
            onClick={generateImage}
            disabled={loading || !prompt}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl ${
              loading || !prompt
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Palette className="h-3.5 w-3.5" />}
            Render Masterpiece
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Asset Management */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 p-6 flex-1 flex flex-col shadow-xl">
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mb-6">
              {(['Model', 'Apparel'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-xl' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'Model' ? <User className="h-3 w-3" /> : <Shirt className="h-3 w-3" />}
                  {tab}
                </button>
              ))}
            </div>

            <div 
              className={`flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-8 transition-all cursor-pointer group ${
                dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              {productImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={productImage} alt="Asset" className="max-w-full max-h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Shirt className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-black text-white mb-1">Add {activeTab.toLowerCase()} images</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Drop one or more items</p>
                </div>
              )}
            </div>
            
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mt-4">
              Drag to reorder layers (inner to outer).
            </p>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-[#020617] rounded-[3.5rem] border border-slate-800 flex-1 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
            
            <AnimatePresence mode="wait">
              {resultImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full p-12 flex items-center justify-center relative z-10"
                >
                  <img src={resultImage} alt="Studio Result" className="max-w-full max-h-full object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.2)]" referrerPolicy="no-referrer" />
                  <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = resultImage;
                        link.download = 'studio-masterpiece.png';
                        link.click();
                      }}
                      className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="h-12 px-6 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                    >
                      {copied ? 'Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center relative z-10"
                >
                  <div className="h-24 w-24 rounded-[2.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <ImageIcon className="h-10 w-10 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.2em] font-display">Awaiting Production</h3>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mt-2">Configure assets and settings to begin</p>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMsg && (
              <div className="absolute bottom-8 left-8 right-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md flex items-center gap-4 text-red-500">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest">{errorMsg}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 hide-scrollbar">
          {/* Engine Settings */}
          <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings2 className="h-4 w-4 text-slate-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Engine Settings</h4>
              </div>
              <button 
                onClick={() => setRealismBoost(!realismBoost)}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  realismBoost ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                Realism Boost {realismBoost ? 'On' : 'Off'}
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">Background</p>
                <button className="w-full py-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 mb-4">
                  <UploadCloud className="h-4 w-4" />
                  Upload Custom Background
                </button>

                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">AI Background Generator</span>
                  </div>
                  <textarea
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="Describe the background scene you want to create..."
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 placeholder:text-slate-700 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 rounded-xl bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                      <Zap className="h-3 w-3" />
                      Generate
                    </button>
                    <button className="py-3 rounded-xl bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                      <Wand2 className="h-3 w-3" />
                      Auto-Magic
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">Suggested Background</p>
                  <button className="w-full py-6 rounded-3xl bg-slate-500/20 border border-slate-500/10 flex items-center justify-center group hover:bg-slate-500/30 transition-all">
                    <div className="flex items-center gap-3 px-6 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Suggestion
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Layers className="h-4 w-4 text-slate-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Shot Type & Pose</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {poses.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPose(p)}
                      className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left ${
                        pose === p 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { trackUsage, checkLimit, PLAN_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { trackAction } from '../lib/actions';
import { 
  analyzeProductImage, 
  suggestPhotoshootSettings, 
  generateBackgroundImage, 
  generateProductStudioImage, 
  generateVirtualTryOn,
  generateMockupImage 
} from '../lib/geminiService';
import { compressImage } from '../lib/utils';
import { isPlanActive } from '../lib/subscription';
import { trackCustom } from '../lib/pixel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Loader2, UploadCloud, Image as ImageIcon, 
  AlertCircle, Sparkles, Zap, Box, Shirt, Monitor, 
  ChevronRight, Settings2, Wand2, Palette, Layers, Download, User, Lock
} from 'lucide-react';

export default function AIPhotoStudio({ user }: { user: any }) {
  const { usage } = useUsage(user);
  const isActive = isPlanActive(user);
  const [mode, setMode] = useState<'APPAREL' | 'PRODUCT' | 'MOCKUP'>('PRODUCT');
  const [activeTab, setActiveTab] = useState<'Model' | 'Apparel'>('Apparel');
  const [step, setStep] = useState(0); // 0: Idle, 1: Analysis, 2: Settings, 3: Background, 4: Render
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [prompt, setPrompt] = useState('');
  const [pose, setPose] = useState('Full Body Front');
  const [handStyling, setHandStyling] = useState('Neutral');
  const [expression, setExpression] = useState('Neutral');
  const [cameraAngle, setCameraAngle] = useState('Eye-Level');
  const [focalLength, setFocalLength] = useState('35mm (Wide)');
  const [aspectRatio, setAspectRatio] = useState('Portrait');
  const [numImages, setNumImages] = useState(1);
  const [background, setBackground] = useState('');
  const [realismBoost, setRealismBoost] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockupPresets = [
    { name: 'White T-Shirt', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', type: 'Apparel' },
    { name: 'Black T-Shirt', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800', type: 'Apparel' },
    { name: 'White Mug', url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800', type: 'Home' },
    { name: 'Canvas Tote', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800', type: 'Accessory' },
    { name: 'Hoodie', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800', type: 'Apparel' },
    { name: 'Phone Case', url: 'https://images.unsplash.com/photo-1541873676947-d7922523d38e?auto=format&fit=crop&q=80&w=800', type: 'Tech' },
  ];

  const poseCategories = {
    STANDARD: ['Full Body Front', 'Hand on Hip', 'Back View', '3/4 View', 'Profile View', 'Waist-Up'],
    ETHNIC: ['Pallu Display', 'Ethnic Twirl', 'Traditional Namaste', 'Royal Seated', 'Walking Gracefully', 'Short Kurti Silhouette', 'Side Slit Focus', 'Chic Cross-Legged'],
    CREATIVE: ['Walking Motion', 'Elegant Lean', 'Sitting Pose', 'Candid Look', 'Hero Pose', 'Action Pose', 'Looking Over Shoulder', 'Leaning Forward', 'Hands in Pockets', 'Dynamic Twirl', 'POV Selfie', 'POV Mirror Selfie']
  };

  const handStylingOptions = ['Neutral', 'Hand on Hip', 'Both Hands on Hips', 'Hands in Pockets', 'Adjusting Sleeve', 'Fixing Hair', 'Holding Hem', 'Hands Folded', 'One Hand on Shoulder', 'Adjusting Collar'];
  const expressionOptions = ['Neutral', 'Soft Smile', 'Confident', 'Joyful', 'Serious', 'Playful', 'Serene'];
  const cameraAngleOptions = ['Eye-Level', 'Low Angle', 'High Angle', 'Dutch Angle', 'Worm\'s Eye View', 'Bird\'s Eye View'];
  const focalLengthOptions = ['24mm (Ultra-Wide)', '35mm (Wide)', '50mm (Standard)', '85mm (Portrait)', '135mm (Telephoto)'];
  const aspectRatioOptions = ['Portrait', 'Square', 'Landscape', 'Stories'];
  const numImagesOptions = [1, 2, 4, 6, 8];

  const steps = [
    { id: 1, title: 'Analysis', desc: 'AI Image Analysis' },
    { id: 2, title: 'Settings', desc: 'Smart Suggestions' },
    { id: 3, title: 'Background', desc: 'Background Generation' },
    { id: 4, title: 'Render', desc: 'Final Synthesis' }
  ];

  const poses = ['Full Body Front', 'Hand on Hip', 'Back View', '3/4 View'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      if (mode === 'MOCKUP') {
        if (activeTab === 'Design') {
          setDesignImage(compressed);
        } else {
          setProductImage(compressed);
        }
      } else if (activeTab === 'Model') {
        setModelImage(compressed);
      } else {
        setProductImage(compressed);
      }
      setResultImage(null);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Failed to process image.');
    } finally {
      setUploading(false);
    }
  };

  const runAutoMagic = async () => {
    // For Apparel/Product/Mockup, we need the main asset.
    // For Apparel, we also need the model image.
    const assetImage = productImage;
    if (!assetImage) {
      setErrorMsg('Please upload the main product/apparel image.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      trackAction('AI Photoshoot', { mode, pose, cameraAngle, focalLength });
      const isWithinLimit = await checkLimit(user, 'photoshoots');
      if (!isWithinLimit) {
        const planId = user.activePlanId || 'trial';
        const limit = PLAN_LIMITS[planId]?.photoshoots || 0;
        throw new Error(`Daily limit reached (${limit}/${limit})`);
      }

      // 1. Analysis
      setStep(1);
      const analysis = await analyzeProductImage(assetImage);
      
      // 2. Settings
      setStep(2);
      const suggestedSettings = await suggestPhotoshootSettings(assetImage, mode);
      setSettings(suggestedSettings);
      
      // 3. Background
      setStep(3);
      const bgImage = await generateBackgroundImage(suggestedSettings.background || prompt);
      
      // 4. Render
      setStep(4);
      let finalImage;
      if (mode === 'APPAREL') {
        if (!modelImage) throw new Error('Please upload a model image for Virtual Try-On.');
        finalImage = await generateVirtualTryOn({ 
          productImage: assetImage, 
          modelImage: modelImage,
          pose,
          handStyling,
          expression,
          cameraAngle,
          focalLength,
          aspectRatio,
          ...suggestedSettings 
        });
      } else if (mode === 'MOCKUP') {
        if (!designImage) throw new Error('Please upload a design/graphic image for Mockup.');
        finalImage = await generateMockupImage({ 
          productImage: assetImage, 
          designImage: designImage,
          cameraAngle,
          focalLength,
          aspectRatio,
          ...suggestedSettings 
        });
      } else {
        finalImage = await generateProductStudioImage({ 
          productImage: assetImage, 
          pose,
          cameraAngle,
          focalLength,
          aspectRatio,
          numImages,
          ...suggestedSettings 
        });
      }
      
      if (finalImage) {
        setResultImage(`data:${finalImage.mimeType};base64,${finalImage.data}`);
        await trackUsage(user.uid, 'photoshoots');
        trackCustom('PhotoStudioGenerated', { mode, pose, userEmail: user.email, userId: user.uid });
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      setStep(0);
    }
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

  const handleModeChange = (m: 'APPAREL' | 'PRODUCT' | 'MOCKUP') => {
    setMode(m);
    if (m === 'MOCKUP') {
      setActiveTab('Product');
    } else if (m === 'APPAREL') {
      setActiveTab('Apparel');
    } else {
      setActiveTab('Apparel');
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
                href={`https://wa.me/919023654443?text=${encodeURIComponent(`Hi, I want to upgrade my plan for ListingAI.\n\nSeller ID: ${user.sellerId || user.uid?.substring(0, 8)}\nEmail: ${user.email}`)}`}
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
      <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[2rem] p-4 mb-8 flex flex-col lg:flex-row items-center justify-between gap-4 border border-slate-800/50 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-slate-800 pb-4 sm:pb-0 sm:pr-6 w-full sm:w-auto justify-center sm:justify-start">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-black text-white leading-none tracking-tighter">STUDIO <span className="text-blue-500">PRO</span></h2>
          </div>

          {/* Credits Display */}
          <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-2xl border border-slate-800 w-full sm:w-auto justify-center sm:justify-start">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Daily Credits</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.photoshoots / (PLAN_LIMITS[user.activePlanId || 'trial']?.photoshoots || 1)) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-white">{usage.photoshoots} / {PLAN_LIMITS[user.activePlanId || 'trial']?.photoshoots || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
            {(['APPAREL', 'PRODUCT', 'MOCKUP'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex-1 sm:flex-none px-4 lg:px-5 py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === m 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button 
            onClick={runAutoMagic}
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
              loading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Palette className="h-3.5 w-3.5" />}
            {loading ? 'Processing...' : 'Auto-Magic Shoot'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-200px)]">
        {/* Left Sidebar - Asset Management */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 p-6 flex-1 flex flex-col shadow-xl">
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mb-6">
              {(mode === 'MOCKUP' ? ['Product', 'Design'] : ['Model', 'Apparel']).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {tab === 'Model' ? <User className="h-3 w-3" /> : tab === 'Design' ? <Wand2 className="h-3 w-3" /> : <Shirt className="h-3 w-3" />}
                  {tab}
                </button>
              ))}
            </div>

            <div 
              className={`flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-6 transition-all cursor-pointer group relative overflow-hidden ${
                dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950 hover:border-blue-500/50 hover:bg-slate-900/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {uploading && (
                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Processing Image...</p>
                </div>
              )}

              {activeTab === 'Model' ? (
                modelImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={modelImage} alt="Model" className="max-w-full max-h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <p className="text-white text-xs font-black uppercase tracking-widest">Change Model</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                      <User className="h-8 w-8 text-slate-400 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-black text-white">Upload Model</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">For Virtual Try-On</p>
                  </div>
                )
              ) : activeTab === 'Design' ? (
                designImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <img src={designImage} alt="Design" className="max-w-full max-h-full object-contain rounded-xl relative z-10 drop-shadow-2xl" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity z-20">
                      <p className="text-white text-xs font-black uppercase tracking-widest">Change Design</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                      <Wand2 className="h-8 w-8 text-slate-400 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-black text-white">Upload Design</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">PNG/Graphic/Logo</p>
                  </div>
                )
              ) : (
                productImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={productImage} alt="Asset" className="max-w-full max-h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <p className="text-white text-xs font-black uppercase tracking-widest">Change Product</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                      <Shirt className="h-8 w-8 text-slate-400 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-black text-white">Upload Product</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Blank Item Image</p>
                  </div>
                )
              )}
            </div>

            {/* Mockup Presets */}
            {mode === 'MOCKUP' && activeTab === 'Product' && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Quick Presets</p>
                <div className="grid grid-cols-3 gap-3">
                  {mockupPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductImage(preset.url);
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <p className="text-[8px] font-black text-white uppercase tracking-tighter text-center px-1">{preset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-[#020617] rounded-[3.5rem] border border-slate-800 flex-1 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
            <AnimatePresence mode="wait">
              {resultImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full p-12 flex items-center justify-center relative z-10"
                >
                  <img src={resultImage} alt="Studio Result" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.2em] font-display">Awaiting Production</h3>
                </div>
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
          <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 p-8 shadow-xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Engine Settings</h4>
            
            {/* Aspect Ratio */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aspect Ratio</p>
              <div className="flex flex-wrap gap-2">
                {aspectRatioOptions.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      aspectRatio === ratio ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Images */}
            {mode === 'PRODUCT' && (
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Number of Images</p>
                <div className="flex gap-2">
                  {numImagesOptions.map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumImages(num)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                        numImages === num ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shot Type & Pose */}
            {(mode === 'APPAREL' || mode === 'PRODUCT') && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-400">
                  <Zap className="h-4 w-4 fill-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Shot Type & Pose</p>
                </div>
                
                {Object.entries(poseCategories).map(([category, poses]) => (
                  <div key={category} className="space-y-3">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {poses.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPose(p)}
                          className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all text-left ${
                            pose === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hand Styling */}
            {mode === 'APPAREL' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Wand2 className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Refined Hand Styling</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {handStylingOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => setHandStyling(style)}
                      className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all text-left ${
                        handStyling === style ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model Expression */}
            {mode === 'APPAREL' && (
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Model Expression</p>
                <div className="grid grid-cols-2 gap-2">
                  {expressionOptions.map((exp) => (
                    <button
                      key={exp}
                      onClick={() => setExpression(exp)}
                      className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all text-left ${
                        expression === exp ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Camera Angle */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Camera Angle</p>
              <div className="grid grid-cols-2 gap-2">
                {cameraAngleOptions.map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setCameraAngle(angle)}
                    className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all text-left ${
                      cameraAngle === angle ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>
            </div>

            {/* Focal Length */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Focal Length</p>
              <div className="grid grid-cols-2 gap-2">
                {focalLengthOptions.map((focal) => (
                  <button
                    key={focal}
                    onClick={() => setFocalLength(focal)}
                    className={`px-3 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all text-left ${
                      focalLength === focal ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {focal}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Custom Prompt</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your product environment, lighting, or specific details..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 focus:border-blue-500 transition-colors outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

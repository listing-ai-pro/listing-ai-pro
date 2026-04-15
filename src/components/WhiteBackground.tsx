import React, { useState, useRef } from 'react';
import { trackUsage, checkLimit, USAGE_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { generateGeminiContent } from '../lib/gemini';
import { compressImage } from '../lib/utils';
import { isPlanActive } from '../lib/subscription';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Image as ImageIcon, Loader2, Download, AlertCircle, Check, Copy, Lock } from 'lucide-react';

export default function WhiteBackground({ user }: { user: any }) {
  const { usage } = useUsage(user.uid);
  const isActive = isPlanActive(user);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
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
      setResultImage(null);
      setErrorMsg('');
    } catch (error) {
      console.error('Error compressing image:', error);
      setErrorMsg('Failed to process image. Please try another one.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image size too large. Please upload an image smaller than 20MB.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      setResultImage(null);
      setErrorMsg('');
    } catch (error) {
      console.error('Error compressing image:', error);
      setErrorMsg('Failed to process image. Please try another one.');
    }
  };

  const generateWhiteBG = async () => {
    if (!image) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const isWithinLimit = await checkLimit(user.uid, 'whiteBackgrounds');
      if (!isWithinLimit) {
        setErrorMsg(`Daily white background limit reached (${USAGE_LIMITS.whiteBackgrounds}/${USAGE_LIMITS.whiteBackgrounds}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const contents = {
        parts: [
          {
            inlineData: {
              data: image.split(',')[1],
              mimeType: image.split(';')[0].split(':')[1]
            }
          },
          { text: "Please process this image to have a clean, professional, solid white background. Keep the product exactly as it is, but remove all background elements and replace them with pure white (#FFFFFF). The result should look like a high-quality e-commerce product photo." }
        ]
      };

      // Using Gemini 3.1 Flash Image for processing
      const response = await generateGeminiContent({
        contents,
        modelName: 'gemini-3.1-flash-image-preview'
      });

      if (response.image) {
        setResultImage(response.image);
        await trackUsage(user.uid, 'whiteBackgrounds');
      } else {
        throw new Error('AI did not return an image. Please try again with a different photo.');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMsg(error.message || 'Failed to generate white background.');
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
                Aapka trial ya subscription khatam ho gaya hai. White background generate karne ke liye naya plan buy karein.
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
            <ImageIcon className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Studio Enhancement</span>
          </motion.div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 font-display leading-[0.9]">
            Pure White <span className="text-blue-600">Canvas</span>.
          </h2>
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm w-fit mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Credits</p>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${Math.min(100, (usage.whiteBackgrounds / USAGE_LIMITS.whiteBackgrounds) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-900">{usage.whiteBackgrounds} / {USAGE_LIMITS.whiteBackgrounds}</span>
              </div>
            </div>
          </div>
          <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
            Transform your product photos into professional e-commerce listings with a pure white background. Perfect for Amazon, eBay, and Shopify.
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
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Processing Error</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-square rounded-[3.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-10 group overflow-hidden ${
              image ? 'border-blue-500 bg-white shadow-2xl' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-xl'
            }`}
          >
            {image ? (
              <div className="relative w-full h-full">
                <img src={image} alt="Original" className="w-full h-full object-contain rounded-[2rem]" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                  <span className="text-white font-black text-xs uppercase tracking-widest">Change Image</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-[2rem] bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-10 w-10 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2 font-display">Drop product photo</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drag & drop or click to browse</p>
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

          <button
            onClick={generateWhiteBG}
            disabled={!image || loading}
            className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl ${
              !image || loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                Generate White Background
              </>
            )}
          </button>
        </motion.div>

        {/* Result Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          <div className="aspect-square rounded-[3.5rem] border border-slate-100 bg-white flex flex-col items-center justify-center p-10 relative overflow-hidden shadow-2xl">
            {resultImage ? (
              <>
                <img src={resultImage} alt="Result" className="w-full h-full object-contain rounded-[2rem]" />
                <div className="absolute top-8 right-8 flex gap-3">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = resultImage;
                      link.download = 'product-white-bg.png';
                      link.click();
                    }}
                    className="h-14 w-14 bg-white shadow-2xl rounded-2xl text-slate-900 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                  >
                    <Download className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 mx-auto">
                  <ImageIcon className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 font-display">Studio Result</h3>
                <p className="text-sm font-medium text-slate-400">Your enhanced photo will appear here</p>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <Loader2 className="h-16 w-16 text-blue-600 animate-spin relative" />
                </div>
                <p className="text-3xl font-black text-slate-900 mb-4 font-display">Refining Canvas</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                  Removing background and enhancing product details for a professional finish.
                </p>
              </div>
            )}
          </div>

          <div className="p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-3xl -mr-20 -mt-20 opacity-20"></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Pro Studio Protocol
            </h4>
            <ul className="space-y-6 relative">
              {[
                "Use high-resolution images for better edge detection.",
                "Ensure the product is well-lit and in focus.",
                "Avoid complex backgrounds with similar colors to the product.",
                "Center the product in the frame for optimal processing."
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-4 text-sm font-medium text-slate-300">
                  <Check className="h-5 w-5 text-blue-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { trackUsage } from '../lib/usage';
import { motion } from 'motion/react';
import { Copy, Check, Camera, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function AIPhotoStudio({ user }: { user: any }) {
  const [prompt, setPrompt] = useState('');
  const [pose, setPose] = useState('');
  const [background, setBackground] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateImage = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Describe a high-quality product photo for: ${prompt}. Pose/Angle: ${pose || 'Standard front view'}. Background: ${background || 'Clean white studio'}. Include detailed lighting, camera settings, and composition.`,
          modelName: 'gemini-3-flash-preview'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data.text);
      await trackUsage(user.uid, 'imagesGenerated');
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
    // Handle file drop logic here if needed
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">AI Photo Studio</h2>
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Virtual Try-On & Background Generation</p>
      </div>

      <div className="space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
            <span className="text-sm font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Upload Area */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Upload Product Image</label>
          <div 
            className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl transition-all cursor-pointer ${
              dragActive ? 'border-blue-600 bg-blue-50' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
            />
            <UploadCloud className={`h-10 w-10 mb-3 ${dragActive ? 'text-blue-600' : 'text-neutral-400'}`} />
            <p className="text-sm font-bold text-slate-700">Drag and drop your image here</p>
            <p className="text-xs text-neutral-500 mt-1">or click to browse files</p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Product Description</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Black smartwatch"
              className="w-full rounded-2xl border-2 border-neutral-200 p-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Pose / Angle</label>
            <input
              type="text"
              value={pose}
              onChange={(e) => setPose(e.target.value)}
              placeholder="e.g., Top-down flatlay"
              className="w-full rounded-2xl border-2 border-neutral-200 p-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all font-medium"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Background Setting</label>
            <input
              type="text"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="e.g., Marble table with soft morning sunlight"
              className="w-full rounded-2xl border-2 border-neutral-200 p-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={generateImage}
          disabled={loading || !prompt}
          className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 w-full sm:w-auto ${
            loading || !prompt
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Camera className="h-6 w-6" />
              Generate Photo Concept
            </>
          )}
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-12 pt-8 border-t border-neutral-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Generated Preview Concept</h3>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fake Image Preview Area */}
              <div className="w-full aspect-square rounded-3xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center shadow-2xl shadow-slate-200/50">
                <ImageIcon className="h-16 w-16 text-neutral-300 mb-4" />
                <p className="text-sm font-bold text-neutral-400 text-center px-8">Image generation API integration required to render actual images.</p>
              </div>
              
              {/* Text Result */}
              <div className="rounded-3xl bg-slate-50 p-6 sm:p-8 border border-neutral-200 font-mono text-sm text-slate-700 whitespace-pre-wrap overflow-y-auto h-full max-h-[500px]">
                {result}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

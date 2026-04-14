import { useState } from 'react';
import { trackUsage } from '../lib/usage';
import { motion } from 'motion/react';
import { Copy, Check, BookOpen, Loader2, Image as ImageIcon, LayoutTemplate } from 'lucide-react';

export default function APlusContentGenerator({ user }: { user: any }) {
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
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate A+ content modules for a product: ${product}. Return ONLY a valid JSON object with this exact structure: { "headline": "string", "modules": [{ "name": "string", "layout": "string", "content": "string", "imagePrompt": "string" }] }`,
          modelName: 'gemini-3-flash-preview'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRawText(data.text);
      
      try {
        const text = data.text.replace(/```json\n?|\n?```/g, '').trim();
        setResult(JSON.parse(text));
      } catch (e) {
        console.error('Failed to parse JSON', e);
        setResult(null);
      }
      
      await trackUsage(user.uid, 'aplusGenerated');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">A+ Content Generator</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Module-Based Layout Ideas</p>
        </div>
        {result && (
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Raw Data'}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
            <span className="text-sm font-bold">{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-neutral-500 mb-3">Product Description</label>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Describe your product in detail..."
            className="w-full h-32 rounded-2xl border-2 border-neutral-200 p-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all resize-none font-medium"
          />
        </div>

        <button
          onClick={generateContent}
          disabled={loading || !product}
          className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 w-full sm:w-auto ${
            loading || !product
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <BookOpen className="h-6 w-6" />
              Generate A+ Content
            </>
          )}
        </button>

        {result && result.modules && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 pt-8 border-t border-neutral-100 space-y-8"
          >
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black text-slate-900">{result.headline}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.modules.map((mod: any, idx: number) => (
                <div key={idx} className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <h4 className="text-lg font-bold text-slate-900">{mod.name}</h4>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      <LayoutTemplate className="h-3 w-3" />
                      {mod.layout}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{mod.content}</p>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-2xl bg-white border border-neutral-200 flex items-start gap-3">
                    <ImageIcon className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Image Prompt</span>
                      <p className="text-xs text-slate-600 font-medium">{mod.imagePrompt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Fallback for raw text if JSON parsing fails */}
        {rawText && !result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-12 pt-8 border-t border-neutral-100"
          >
             <div className="rounded-3xl bg-slate-50 p-6 sm:p-8 border border-neutral-200 font-mono text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto">
              {rawText}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

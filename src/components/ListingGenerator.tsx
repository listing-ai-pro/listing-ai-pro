import React, { useState, useRef } from 'react';
import { trackUsage, checkLimit, PLAN_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';
import { ConductorService, ListingInput } from '../lib/conductorService';
import { compressImage } from '../lib/utils';
import { isPlanActive } from '../lib/subscription';
import { trackCustom } from '../lib/pixel';
import { trackAction } from '../lib/actions';
import { SpaceLoader } from './SpaceLoader';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Sparkles, Loader2, AlertCircle, ChevronRight, ChevronLeft, Image as ImageIcon, UploadCloud, Download, BarChart3, Lightbulb, Lock, Zap, Calculator } from 'lucide-react';

const MARKETPLACES = [
  { id: 'amazon', name: 'Amazon.in', type: 'GLOBAL', icon: '📦' },
  { id: 'flipkart', name: 'Flipkart', type: 'REGIONAL', icon: '🛒' },
  { id: 'ebay', name: 'eBay', type: 'REGIONAL', icon: '🏷️' },
  { id: 'etsy', name: 'Etsy', type: 'REGIONAL', icon: '🧶' },
  { id: 'meesho', name: 'Meesho', type: 'REGIONAL', icon: '🛍️' },
  { id: 'shopify', name: 'Shopify', type: 'REGIONAL', icon: '🎨' },
  { id: 'myntra', name: 'Myntra', type: 'REGIONAL', icon: '👗' },
  { id: 'website', name: 'Website', type: 'REGIONAL', icon: '🌐' },
];

export default function ListingGenerator({ user }: { user: any }) {
  const { usage } = useUsage(user);
  const isActive = isPlanActive(user);
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<string[]>([]);
  
  // Inputs
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Images
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  
  // Results
  const [results, setResults] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.includes(id) ? [] : [id]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image size too large. Please upload an image smaller than 20MB.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      if (type === 'front') setFrontImage(compressed);
      else setBackImage(compressed);
      setErrorMsg('');
    } catch (error) {
      console.error('Error compressing image:', error);
      setErrorMsg('Failed to process image. Please try another one.');
    }
  };

  const generateListing = async () => {
    if (platforms.length === 0) return;
    setLoading(true);
    setErrorMsg('');
    setLoadingStep('Analyzing Product...');
    
    try {
      const isWithinLimit = await checkLimit(user, 'listingsGenerated');
      if (!isWithinLimit) {
        const planId = user.activePlanId || 'trial';
        const limit = PLAN_LIMITS[planId]?.listingsGenerated || 3;
        setErrorMsg(`Daily listing limit reached (${limit}/${limit}). Please try again tomorrow.`);
        setLoading(false);
        return;
      }

      const productQuery = additionalInfo || 'Product image provided';

      trackAction('Generate Listing', { product: productQuery, platforms });

      const input: ListingInput = {
        imageB64: frontImage || undefined,
        additionalInfo,
        platforms,
        productQuery
      };

      const resultText = await ConductorService.orchestrateListing(input, (step) => {
        setLoadingStep(step);
      });

      if (!resultText) throw new Error("Failed to generate listing");

      let parsedResults: Record<string, any> = {};
      try {
        const text = resultText.replace(/```json\n?|\n?```/g, '').trim();
        parsedResults = JSON.parse(text);
      } catch (e) {
        parsedResults = { [platforms[0]]: resultText };
      }
      
      setResults(parsedResults);
      setActiveTab(Object.keys(parsedResults)[0] || platforms[0]);
      await trackUsage(user.uid, 'listingsGenerated');
      
      // Track Facebook Pixel Event
      trackCustom('ListingGenerated', { 
        platforms: platforms.join(','),
        inputMethod: 'image',
        userEmail: user.email,
        userId: user.uid
      });

      setStep(3); // Move to results view
      
    } catch (error: any) {
      console.error('Error generating listing:', error);
      setErrorMsg(error.message || 'An error occurred while generating the listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!results[activeTab]) return;
    
    let textToCopy = '';
    if (typeof results[activeTab] === 'string') {
      textToCopy = results[activeTab];
    } else {
      const { title, midTitle, shortTitle, description, bulletPoints, keywords, platformSpecificFields } = results[activeTab];
      textToCopy = `Full Title:\n${title}\n\n`;
      if (midTitle) textToCopy += `Mid-length Title:\n${midTitle}\n\n`;
      if (shortTitle) textToCopy += `Short Title:\n${shortTitle}\n\n`;
      
      const bulletArr = Array.isArray(bulletPoints) ? bulletPoints : [];
      const keywordArr = Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : []);
      
      textToCopy += `Description:\n${description}\n\nBullet Points:\n${bulletArr.map((p: string) => `- ${p}`).join('\n')}\n\nKeywords:\n${keywordArr.join(', ')}`;
      
      if (platformSpecificFields && Object.keys(platformSpecificFields).length > 0) {
        textToCopy += `\n\nPlatform Specific Fields:\n`;
        Object.entries(platformSpecificFields).forEach(([key, value]) => {
          textToCopy += `${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
        });
      }
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    if (!results[activeTab]) return;
    
    let content = '';
    let mimeType = '';
    let filename = `listing-${activeTab}-${Date.now()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(results[activeTab], null, 2);
      mimeType = 'application/json';
    } else if (format === 'txt') {
      if (typeof results[activeTab] === 'string') {
        content = results[activeTab];
      } else {
        const { title, midTitle, shortTitle, description, bulletPoints, keywords, platformSpecificFields } = results[activeTab];
        const bulletArr = Array.isArray(bulletPoints) ? bulletPoints : [];
        const keywordArr = Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : []);

        content = `Full Title:\n${title}\n\n`;
        if (midTitle) content += `Mid-length Title:\n${midTitle}\n\n`;
        if (shortTitle) content += `Short Title:\n${shortTitle}\n\n`;
        
        content += `Description:\n${description}\n\nBullet Points:\n${bulletArr.map((p: string) => `- ${p}`).join('\n')}\n\nKeywords:\n${keywordArr.join(', ')}`;
        
        if (platformSpecificFields && Object.keys(platformSpecificFields).length > 0) {
          content += `\n\nPlatform Specific Fields:\n`;
          Object.entries(platformSpecificFields).forEach(([key, value]) => {
            content += `${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
          });
        }
      }
      mimeType = 'text/plain';
    } else if (format === 'csv') {
      if (typeof results[activeTab] === 'string') {
        content = `"Content"\n"${results[activeTab].replace(/"/g, '""')}"`;
      } else {
        const { title, midTitle, shortTitle, description, bulletPoints, keywords, platformSpecificFields } = results[activeTab];
        const bulletArr = Array.isArray(bulletPoints) ? bulletPoints : [];
        const keywordArr = Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : []);

        content = `Field,Value\n`;
        content += `"Full Title","${(title || '').replace(/"/g, '""')}"\n`;
        if (midTitle) content += `"Mid Title","${midTitle.replace(/"/g, '""')}"\n`;
        if (shortTitle) content += `"Short Title","${shortTitle.replace(/"/g, '""')}"\n`;
        content += `"Description","${(description || '').replace(/"/g, '""')}"\n`;
        content += `"Bullet Points","${bulletArr.join('; ').replace(/"/g, '""')}"\n`;
        content += `"Keywords","${keywordArr.join(', ').replace(/"/g, '""')}"\n`;
        
        if (platformSpecificFields) {
          Object.entries(platformSpecificFields).forEach(([key, value]) => {
            content += `"${key}","${String(Array.isArray(value) ? value.join('; ') : value).replace(/"/g, '""')}"\n`;
          });
        }
      }
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <AnimatePresence>
        {loading && <SpaceLoader step={loadingStep} />}
      </AnimatePresence>
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
                Aapka trial ya subscription khatam ho gaya hai. Listing generate karne ke liye naya plan buy karein.
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

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Section */}
      <div className="relative mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
            >
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400">SEOMachine v2.0 Platform</span>
            </motion.div>
            <h2 className="text-3xl lg:text-6xl font-black tracking-tight text-white mb-4 font-display leading-[1.1] lg:leading-[0.9]">
              Sell <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Everywhere</span>,<br />
              Effortlessly.
            </h2>
            <p className="text-sm lg:text-lg font-medium text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Transform your product ideas into high-converting listings optimized for global marketplaces in seconds.
            </p>
          </div>
          
          <div className="flex flex-col items-center lg:items-end gap-6">
            <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl w-full lg:w-auto">
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="flex-1 lg:flex-none">
                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 font-mono">Daily Credits</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 lg:w-32 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" 
                      style={{ width: `${Math.min(100, (usage.listingsGenerated / (PLAN_LIMITS[user.activePlanId || 'trial']?.listingsGenerated || 3)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs lg:text-sm font-black text-white whitespace-nowrap font-mono">{usage.listingsGenerated} / {PLAN_LIMITS[user.activePlanId || 'trial']?.listingsGenerated || 3}</span>
                </div>
              </div>
            </div>
            
            {step < 3 && (
              <div className="flex items-center gap-4">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                      step >= s ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-300 border border-slate-200'
                    }`}>
                      {s}
                    </div>
                    {s === 1 && <div className={`h-0.5 w-12 rounded-full transition-all duration-500 ${step > 1 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-6 rounded-[2rem] bg-red-50 border border-red-100 flex items-center gap-4 text-red-700 shadow-xl shadow-red-500/5"
        >
          <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1">Action Required</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {/* Step 1: Marketplaces */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 lg:space-y-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {MARKETPLACES.map((p, idx) => {
              const isActive = platforms.includes(p.id);
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => togglePlatform(p.id)}
                  className={`group relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-blue-500 bg-slate-900 shadow-2xl shadow-blue-500/20 lg:-translate-y-2' 
                      : 'border-white/5 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-white/10 hover:bg-slate-900/60 lg:hover:-translate-y-2'
                  }`}
                >
                  <div className={`text-3xl lg:text-4xl mb-3 lg:mb-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                    {p.icon}
                  </div>
                  <span className={`font-black text-base lg:text-xl mb-1 font-display transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{p.name}</span>
                  <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>{p.type}</span>
                  
                  {isActive && (
                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6 h-5 w-5 lg:h-6 lg:w-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Check className="h-2 w-2 lg:h-3 lg:w-3 text-white" strokeWidth={4} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setStep(2)}
              disabled={platforms.length === 0}
              className={`group relative w-full lg:w-auto px-12 py-5 rounded-[1.5rem] lg:rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all ${
                platforms.length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:shadow-2xl hover:shadow-blue-600/30 active:scale-95'
              }`}
            >
              Continue to Details
              <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${platforms.length > 0 ? 'group-hover:translate-x-2' : ''}`} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Product Details */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 shadow-2xl mb-8 lg:mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
            
            <AnimatePresence mode="wait">
                <motion.div
                  key="image"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                    {[
                      { type: 'front', label: 'Primary View', ref: frontInputRef, state: frontImage },
                      { type: 'back', label: 'Secondary View', ref: backInputRef, state: backImage }
                    ].map((img) => (
                      <div key={img.type}>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{img.label}</label>
                        <input 
                          type="file" 
                          ref={img.ref as any} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, img.type as any)}
                        />
                        <div 
                          onClick={() => (img.ref as any).current?.click()}
                          className={`group relative h-64 lg:h-80 border-2 border-dashed rounded-[1.5rem] lg:rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                            img.state ? 'border-blue-600 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'
                          }`}
                        >
                          {img.state ? (
                            <>
                              <img src={img.state} alt={img.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-black uppercase tracking-widest text-[10px]">Change Image</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl lg:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="h-6 w-6 lg:h-8 w-8 text-blue-600" />
                              </div>
                              <span className="text-[11px] lg:text-sm font-black text-slate-700">Drop or Click to Upload</span>
                              <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Max 20MB</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Contextual Intelligence (Optional)</label>
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Add specific details like material, size, or special features..."
                      className="w-full h-24 lg:h-32 rounded-xl lg:rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 p-4 lg:p-6 text-slate-900 placeholder-slate-300 focus:border-blue-600 focus:bg-white focus:ring-0 transition-all resize-none font-bold text-sm leading-relaxed"
                    />
                  </div>
                </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-10 py-4 rounded-full font-black text-[10px] lg:text-xs uppercase tracking-widest flex items-center justify-center gap-3 text-slate-500 hover:bg-white hover:shadow-xl transition-all border border-slate-200 bg-white"
            >
              <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
              Back
            </button>
            <button
              onClick={generateListing}
              disabled={loading}
              className={`w-full sm:w-auto px-12 py-5 rounded-full font-black text-xs lg:text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/20 ${
                loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="cssanimation leRolling tracking-widest">{loadingStep}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Ignite Listing
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Results */}
      {step === 3 && Object.keys(results).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Results Navigation */}
          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[3rem] border border-slate-200 shadow-2xl sticky top-8 z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar px-2">
              {Object.keys(results).map(p => (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === p
                      ? 'bg-slate-900 text-white shadow-xl'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-[1.25rem] border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Reset
              </button>
              
              <div className="relative group">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center justify-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-30"
                    >
                      {['json', 'csv', 'txt'].map((fmt) => (
                        <button 
                          key={fmt}
                          onClick={() => { handleExport(fmt as any); setShowExportMenu(false); }} 
                          className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-0"
                        >
                          {fmt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-3 rounded-[1.25rem] bg-blue-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 15
                }
              }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 cssanimation leFadeInUp"
            >
              {/* Left Column: Core Content */}
              <div className="lg:col-span-8 space-y-10">
                {/* Main Content Card */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-30"></div>
                  
                  {typeof results[activeTab] === 'string' ? (
                    <div className="whitespace-pre-wrap font-mono text-sm text-slate-600 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      {results[activeTab]}
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {/* Title Section */}
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-1 w-12 bg-blue-600 rounded-full cssanimation leFadeInLeft"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Full Optimized Title</h4>
                          </div>
                          <p className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight font-display">{results[activeTab].title}</p>
                        </div>

                        {results[activeTab].midTitle && (
                          <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mid-length Title</h4>
                            </div>
                            <p className="text-xl font-bold text-slate-700 leading-snug">{results[activeTab].midTitle}</p>
                          </div>
                        )}

                        {results[activeTab].shortTitle && (
                          <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-1 w-6 bg-emerald-500 rounded-full"></div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Short Title</h4>
                            </div>
                            <p className="text-lg font-bold text-slate-600 leading-snug italic">{results[activeTab].shortTitle}</p>
                          </div>
                        )}
                      </div>

                      {/* SEO Meta */}
                      {results[activeTab].seoTitle && (
                        <div className="p-8 rounded-[2rem] bg-blue-50/50 border border-blue-100 relative group">
                          <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-blue-400">SEO Meta</div>
                          <p className="text-lg font-bold text-blue-700 leading-snug">{results[activeTab].seoTitle}</p>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Product Description</h4>
                        </div>
                        <div className="prose prose-slate max-w-none">
                          <div className="text-lg font-medium text-slate-600 leading-relaxed description-content">
                            {/* Filter out AI tips and actually show the content */}
                            {(results[activeTab].description || '').replace(/^Suggestion:|^Tip:|^Note:/i, '').trim()}
                          </div>
                        </div>
                      </div>

                      {/* Platform Specifics */}
                      {results[activeTab].platformSpecificFields && Object.keys(results[activeTab].platformSpecificFields).length > 0 && (
                        <div className="pt-8 border-t border-slate-100">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Platform Specifics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(results[activeTab].platformSpecificFields).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">{key}</span>
                                <div className="text-sm font-bold text-slate-800 leading-relaxed">
                                  {Array.isArray(value) ? (
                                    value.join(', ')
                                  ) : typeof value === 'object' && value !== null ? (
                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                      {Object.entries(value).map(([k, v]: [string, any]) => (
                                        <div key={k} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                                          <span className="text-[8px] font-black text-slate-400 uppercase">{k}</span>
                                          <span className="text-[10px] font-bold text-slate-900">{String(v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    String(value)
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features Grid */}
                {results[activeTab].bulletPoints && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results[activeTab].bulletPoints.map((point: string, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex gap-6 group hover:-translate-y-1 transition-all"
                      >
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <Check className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">{point}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Intelligence & SEO */}
              <div className="lg:col-span-4 space-y-10">
                {/* SEO Score Card */}
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl -mb-16 -mr-16 opacity-40"></div>
                  
                  <div className="flex items-center justify-between mb-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">SEO Performance</h4>
                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mb-12">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90">
                        <circle cx="48" cy="48" r="42" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                        <circle 
                          cx="48" cy="48" r="42" fill="transparent" 
                          stroke={results[activeTab].seoScore > 80 ? '#10b981' : results[activeTab].seoScore > 60 ? '#f59e0b' : '#ef4444'} 
                          strokeWidth="8" 
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * results[activeTab].seoScore) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute text-2xl font-black">{results[activeTab].seoScore}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-300">Optimization Level</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">
                        {results[activeTab].seoScore > 80 ? 'Exceptional' : results[activeTab].seoScore > 60 ? 'Good' : 'Needs Work'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: 'Title', score: results[activeTab].seoAnalysis?.titleScore },
                      { label: 'Description', score: results[activeTab].seoAnalysis?.descriptionScore },
                      { label: 'Keywords', score: results[activeTab].seoAnalysis?.keywordScore }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span>{item.score}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions Card */}
                <div className="bg-blue-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-600/20">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-8">AI Suggestions</h4>
                  <ul className="space-y-6">
                    {Array.isArray(results[activeTab].seoAnalysis?.suggestions) && results[activeTab].seoAnalysis.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 group">
                        <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white group-hover:text-blue-600 transition-all">
                          <Lightbulb className="h-3 w-3" />
                        </div>
                        <p className="text-xs font-bold leading-relaxed text-blue-50">{s}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Market Intelligence */}
                {results[activeTab].marketInsights && (
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Market Intelligence</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HSN Code</span>
                        <span className="text-lg font-black text-slate-900 font-mono tracking-tight">{results[activeTab].marketInsights.hsnCode || 'N/A'}</span>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GST Rate</span>
                        <span className="text-lg font-black text-slate-900 font-mono tracking-tight">{results[activeTab].marketInsights.gstRate || 'N/A'}</span>
                      </div>
                    </div>

                    {/* NEW: PROFIT CALCULATOR (ADVANCED FEATURE) */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] -mr-16 -mt-16 opacity-30 group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] font-mono">Advanced Tool</p>
                          <h4 className="text-2xl font-black font-display tracking-tight leading-none">Profit Estimator 💸</h4>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                           <Calculator className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Selling Price (₹)</label>
                          <p className="text-xl font-black font-mono">₹{results[activeTab].marketInsights.competitorPrices?.[0]?.price?.replace('₹', '') || '599'}</p>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estimated Shipping</label>
                          <p className="text-xl font-black font-mono text-emerald-400">₹45</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 relative z-10">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Margin Per Unit</p>
                            <p className="text-3xl font-black font-mono tracking-tighter">₹{parseInt(results[activeTab].marketInsights.competitorPrices?.[0]?.price?.replace('₹', '') || '599') - 180}</p>
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
                            High Profitability
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {results[activeTab].marketInsights.competitorPrices && results[activeTab].marketInsights.competitorPrices.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Competitor Pricing</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {results[activeTab].marketInsights.competitorPrices.map((cp: any, i: number) => (
                            <div key={i} className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
                              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{cp.platform}</span>
                              <span className="text-lg font-black text-blue-700 font-mono">{cp.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results[activeTab].marketInsights.competitorDeepDive && results[activeTab].marketInsights.competitorDeepDive.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-slate-100 relative">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Advanced Competitor Deep-Dive</span>
                        
                        <div className={`space-y-4 ${user.subscriptionPlan !== 'pro' ? 'blur-md pointer-events-none select-none' : ''}`}>
                          {results[activeTab].marketInsights.competitorDeepDive.map((cd: any, i: number) => (
                            <div key={i} className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{cd.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[8px] font-black text-blue-600 uppercase italic">★ {cd.rating}</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                                  <p className="text-[10px] font-bold text-slate-600"><span className="text-emerald-600">USP:</span> {cd.usp}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5"></div>
                                  <p className="text-[10px] font-bold text-slate-600"><span className="text-red-500">Weakness:</span> {cd.weakness}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {user.subscriptionPlan !== 'pro' && (
                          <div className="absolute inset-x-0 bottom-0 top-8 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-3xl z-10 border border-slate-200 shadow-xl p-8 text-center space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                              <Lock className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                              <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Competitor Intelligence Locked</h5>
                              <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Upgrade to a Pro Plan to unlock deep-dive research into your rivals' weaknesses.</p>
                            </div>
                            <button 
                              onClick={() => window.location.hash = '#subscription'}
                              className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                            >
                              Unlock Full Analysis
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Opportunity Heatmap</span>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                        <div className="grid grid-cols-5 gap-1 h-32">
                          {[...Array(25)].map((_, i) => {
                            const intensity = Math.floor(Math.random() * 5);
                            const colors = ['bg-slate-100', 'bg-blue-100', 'bg-blue-300', 'bg-blue-500', 'bg-blue-700'];
                            return (
                              <div key={i} className={`rounded-sm transition-all hover:scale-110 cursor-help ${colors[intensity]}`} title="High Demand Area"></div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-4">
                           <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-slate-200"></div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Low Competition</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest text-right">High Demand</span>
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                           </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 shadow-xl flex items-center gap-2">
                              <Sparkles className="h-3 w-3 text-blue-600" />
                              <span className="text-[10px] font-black text-slate-900 uppercase">Growth Pocket Identified</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    {results[activeTab].marketInsights.pricingStrategy && (
                      <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 italic">
                        <p className="text-[10px] font-bold text-emerald-800 leading-relaxed shadow-emerald-500/10">
                          💡 <span className="font-black">Winning Strategy:</span> {results[activeTab].marketInsights.pricingStrategy}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords Card */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Backend Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const keywords = results[activeTab].keywords;
                      const keywordArr = Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : []);
                      return keywordArr.map((keyword: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-all cursor-default">
                          {keyword}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                {/* Step-by-Step Guide */}
                {results[activeTab].optimizationSteps && (
                  <div className="bg-emerald-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-emerald-600/20">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 mb-8">Listing Roadmap</h4>
                    <div className="space-y-6">
                      {results[activeTab].optimizationSteps.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-white group-hover:text-emerald-600 transition-all">{i + 1}</div>
                          <p className="text-xs font-bold text-emerald-50 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { UploadCloud, Search, CheckCircle2, ChevronRight, Download, Eye, FileText, Zap, X, Image as ImageIcon, Box, RefreshCw } from 'lucide-react';
import { trackUsage, checkLimit, PLAN_LIMITS } from '../lib/usage';
import { useUsage } from '../hooks/useUsage';

// @ts-ignore - Let Vite handle the worker asset import locally
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface LabelPage {
  imgData: string;
  sku: string;
  size: string;
  qty: number;
  courier: string;
  rawText: string;
  originalName: string;
}

export default function LabelProcessor({ user }: { user: any }) {
  const { usage } = useUsage(user);
  const [files, setFiles] = useState<File[]>([]);
  const [platform, setPlatform] = useState<'meesho' | 'flipkart'>('meesho');
  const [sortBy, setSortBy] = useState<'sku' | 'courier'>('sku');
  const [withInvoice, setWithInvoice] = useState(false);
  const [generateCSV, setGenerateCSV] = useState<boolean>(true);
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    if ((PLAN_LIMITS[user.activePlanId || 'trial']?.labelCrops || 0) > 0) {
      const isWithinLimit = await checkLimit(user, 'labelCrops');
      if (!isWithinLimit) {
        const planId = user.activePlanId || 'trial';
        const limit = PLAN_LIMITS[planId]?.labelCrops || 1;
        setErrorMsg(`Daily label crop limit reached (${limit}/${limit}). Please try again tomorrow.`);
        return;
      }
    }
    
    setProcessing(true);
    setErrorMsg('');
    setProgressMsg('Initializing PDF Worker...');
    
    try {
      const allPages: LabelPage[] = [];

      for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
        const file = files[fileIdx];
        setProgressMsg(`Reading file ${fileIdx + 1}/${files.length}: ${file.name}`);
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          setProgressMsg(`Processing page ${pageNum}/${numPages} of ${file.name}...`);
          const page = await pdf.getPage(pageNum);
          
          // Render to canvas
          const scale = 3.5; // High resolution
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          }).promise;

          // Extract text
          const textContent = await page.getTextContent();
          let joinedText = (textContent.items as any[]).map((item: any) => item.str).join(' ');

          // Deep OCR Fallback if it seems to be an image (Flipkart sometimes does this)
          if (joinedText.replace(/\s+/g, "").length < 30) {
             setProgressMsg(`Low text detected on page ${pageNum}. Running Deep OCR...`);
             const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
             joinedText = text;
          }

          // Regex matching for SKU
          let sku = "Unknown";
          let size = "N/A";
          let qty = 1;
          if (platform === 'meesho') {
             const meeshoRegex = /(?:Order\s*No\.?|Order\s*ID)\s+([\s\S]+?)\s+([^\s]+(?:\s+size)?)\s+(\d+)\s+([a-zA-Z\s\/\-&]+?)\s+([0-9A-Z_-]{10,})/i;
             const meeshoFallback = /(?:Order\s*No\.?|Order\s*ID)\s+([\s\S]+?)\s+([^\s]+(?:\s+size)?)\s+(\d+)/i;
             
             let match = joinedText.match(meeshoRegex);
             if (match && match[1]) {
                 sku = match[1].trim();
                 size = match[2].trim();
                 qty = parseInt(match[3]) || 1;
             } else {
                 match = joinedText.match(meeshoFallback);
                 if (match && match[1]) {
                     sku = match[1].trim();
                     size = match[2].trim();
                     qty = parseInt(match[3]) || 1;
                 }
             }
          } else {
             const flipkartRegex = /(?:SKU ID\s*\|\s*Description\s*QTY)\s*(\d+)\s+([^|]+?)\s*\|/i;
             const flipkartFallback = /Description\s*(?:QTY)?\s*(\d+)\s+([^|]+?)\s*\|/i;
             
             let match = joinedText.match(flipkartRegex);
             if (match && match[2]) {
                 qty = parseInt(match[1]) || 1;
                 sku = match[2].trim();
             } else {
                 match = joinedText.match(flipkartFallback);
                 if (match && match[2]) {
                     qty = parseInt(match[1]) || 1;
                     sku = match[2].trim();
                 }
             }
          }

          // Extract Courier
          let courier = "Unknown";
          const couriers = ["E-Kart", "Valmo", "Shadowfax", "Delhivery", "XpressBees", "BlueDart", "Amazon Shipping", "Ecom Express"];
          for (const c of couriers) {
              if (joinedText.toLowerCase().includes(c.toLowerCase())) {
                  courier = c;
                  break;
              }
          }

          // Look for invoice anchors
          let invoicePdfY = -1;
          for (const item of textContent.items as any[]) {
             const str = typeof item.str === 'string' ? item.str.toUpperCase() : '';
             if ((platform === 'meesho' && str.includes('TAX INVOICE')) ||
                 (platform === 'flipkart' && str.includes('NOT FOR RESALE'))) {
                 invoicePdfY = item.transform[5]; // Y offset in PDF coordinates
                 break;
             }
          }

          let invoiceCanvasY = -1;
          if (invoicePdfY !== -1) {
             const pt = viewport.convertToViewportPoint(0, invoicePdfY);
             invoiceCanvasY = pt[1];
          }

          // Smart Canvas Cropping
          let croppedCanvas = canvas;
          setProgressMsg(`Analyzing boundaries for page ${pageNum}...`);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let top = canvas.height, left = canvas.width, right = 0, bottom = 0;
          
          // Loop to find bounds
          for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                  const idx = (y * canvas.width + x) * 4;
                  const r = data[idx], g = data[idx+1], b = data[idx+2];
                  if (r < 220 && g < 220 && b < 220) {
                      if (y < top) top = y;
                      if (y > bottom) bottom = y;
                      if (x < left) left = x;
                      if (x > right) right = x;
                  }
              }
          }

          if (right > left && bottom > top) {
             if (!withInvoice) {
                if (platform === "flipkart") {
                  let foundDashed = false;
                  const startScanY = top + Math.floor((bottom - top) * 0.4);

                  if (invoiceCanvasY !== -1 && invoiceCanvasY > top && invoiceCanvasY < bottom) {
                      let validCutY = Math.floor(invoiceCanvasY) + Math.floor(15 * scale);
                      for (let scanY = Math.floor(invoiceCanvasY); scanY < bottom; scanY++) {
                        let lineBlackCount = 0;
                        for (let x = left; x < right; x++) {
                          const idx = (scanY * canvas.width + x) * 4;
                          if (data[idx] < 80 && data[idx + 1] < 80 && data[idx + 2] < 80) lineBlackCount++;
                        }
                        if (lineBlackCount > Math.floor((right - left) * 0.4)) {
                          validCutY = scanY + 5;
                          break;
                        }
                      }
                      bottom = validCutY;
                      foundDashed = true;
                  }

                  for (let scanY = startScanY; scanY < bottom && !foundDashed; scanY++) {
                    let darkSegments = 0;
                    let isDarkRun = false;

                    for (let x = left + 10; x < right - 10; x++) {
                      const idx = (scanY * canvas.width + x) * 4;
                      const isDark = data[idx] < 100 && data[idx + 1] < 100 && data[idx + 2] < 100;

                      if (isDark && !isDarkRun) {
                        isDarkRun = true;
                        darkSegments++;
                      } else if (!isDark && isDarkRun) {
                        isDarkRun = false;
                      }
                    }

                    if (darkSegments > 15) {
                      bottom = scanY - 5;
                      foundDashed = true;
                      break;
                    }
                  }

                  let newLeft = right, newRight = left;
                  for (let y = top; y < bottom; y++) {
                    for (let x = left; x < right; x++) {
                      const idx = (y * canvas.width + x) * 4;
                      if (data[idx] < 220 && data[idx+1] < 220 && data[idx+2] < 220) {
                          if (x < newLeft) newLeft = x;
                          if (x > newRight) newRight = x;
                      }
                    }
                  }
                  if (newRight > newLeft) {
                     left = newLeft; right = newRight;
                  }

                } else if (invoiceCanvasY !== -1 && invoiceCanvasY > top && invoiceCanvasY < bottom) {
                  let validCutY = invoiceCanvasY - (6 * scale);
                  for (let scanY = Math.floor(invoiceCanvasY); scanY > top; scanY--) {
                    let lineBlackCount = 0;
                    for (let x = left; x < right; x++) {
                      const idx = (scanY * canvas.width + x) * 4;
                      if (data[idx] < 80 && data[idx + 1] < 80 && data[idx + 2] < 80) lineBlackCount++;
                    }
                    if (lineBlackCount > Math.floor((right - left) * 0.5)) {
                      validCutY = scanY + 5;
                      break;
                    }
                  }
                  bottom = validCutY;
                }
             }

             // Add some padding to bounds
             const pad = 20;
             top = Math.max(0, top - pad);
             left = Math.max(0, left - pad);
             bottom = Math.min(canvas.height, bottom + pad);
             right = Math.min(canvas.width, right + pad);
             
             const cropWidth = right - left;
             const cropHeight = bottom - top;
             
             croppedCanvas = document.createElement('canvas');
             const cropCtx = croppedCanvas.getContext('2d');
             if (cropCtx) {
                croppedCanvas.width = cropWidth;
                croppedCanvas.height = cropHeight;
                cropCtx.fillStyle = '#ffffff';
                cropCtx.fillRect(0, 0, cropWidth, cropHeight);
                cropCtx.drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
             }
          }

          const imgData = croppedCanvas.toDataURL("image/jpeg", 0.95);
          
          allPages.push({
             imgData,
             sku,
             size,
             qty,
             courier,
             rawText: joinedText,
             originalName: file.name
          });
        }
      }

      // Sorting
      setProgressMsg('Sorting labels...');
      allPages.sort((a, b) => {
         if (sortBy === 'sku') {
            return a.sku.localeCompare(b.sku);
         } else {
            return a.courier.localeCompare(b.courier);
         }
      });

      // PDF Generation
      setProgressMsg('Generating final PDF...');
      const isLandscape = platform === 'meesho' && !withInvoice;
      const pdfW = isLandscape ? 152.4 : 101.6;
      const pdfH = isLandscape ? 101.6 : 152.4;

      const doc = new jsPDF({
         orientation: isLandscape ? 'l' : 'p',
         unit: 'mm',
         format: [101.6, 152.4] // 4x6 standard label
      });
      
      const paddingX = pdfW * 0.02; // 2% padding
      const paddingY = pdfH * 0.02;
      const finalW = pdfW - (paddingX * 2);
      const finalH = pdfH - (paddingY * 2);
      const finalX = paddingX;
      const finalY = paddingY;

      for (let i = 0; i < allPages.length; i++) {
         if (i > 0) doc.addPage();
         
         const page = allPages[i];
         
         // Inject Invisible Text for Searchability
         doc.setTextColor(255, 255, 255); // White text so it's invisible on white bg
         doc.setFontSize(4);
         const safeText = page.rawText.replace(/[^\x20-\x7E]/g, ' '); 
         const lines = doc.splitTextToSize(`SKU: ${page.sku} Courier: ${page.courier} ${safeText}`, finalW - 4);
         
         // Use normal array length vs max to avoid division by zero
         const lineCount = Math.max(lines.length, 1);
         const lineSpacing = finalH / lineCount;
         
         for (let j = 0; j < lines.length; j++) {
            // Draw invisible text throughout page height
            doc.text(lines[j], finalX + 2, finalY + (j * lineSpacing) + 2);
         }
         
         // Draw Image FAST
         doc.addImage(page.imgData, "JPEG", finalX, finalY, finalW, finalH, `page${i}`, "FAST");
      }

      setProgressMsg('Saving file...');
      doc.save(`${platform}_optimized_labels_${Date.now()}.pdf`);
      
      if (generateCSV) {
          setProgressMsg('Generating CSV Summary...');
          const skuCounts: Record<string, { sku: string, size: string, qty: number }> = {};
          
          allPages.forEach(p => {
              const key = `${p.sku}|${p.size}`;
              if (!skuCounts[key]) {
                  skuCounts[key] = { sku: p.sku, size: p.size, qty: 0 };
              }
              skuCounts[key].qty += p.qty;
          });
          
          let csvContent = "\uFEFFSKU,Size,QTY\n";
          const sortedEntries = Object.values(skuCounts).sort((a, b) => b.qty - a.qty);
          
          sortedEntries.forEach((entry) => {
              let safeSku = entry.sku.replace(/,/g, ' ').replace(/"/g, '');
              let safeSize = entry.size.replace(/,/g, ' ').replace(/"/g, '');
              if (/^[=+\-@]/.test(safeSku)) {
                  safeSku = "'" + safeSku;
              }
              if (/^[=+\-@]/.test(safeSize)) {
                  safeSize = "'" + safeSize;
              }
              csvContent += `"${safeSku}","${safeSize}",${entry.qty}\n`;
          });
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${platform}_SKU_Summary_${Date.now()}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      }

      setProgressMsg('Completed successfully!');
      setTimeout(() => setProgressMsg(''), 3000);
      
      // Track usage
      if ((PLAN_LIMITS[user.activePlanId || 'trial']?.labelCrops || 0) > 0) {
        await trackUsage(user.uid, 'labelCrops');
      }
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Error processing files: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6 relative">
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-between">
          <p className="text-sm font-medium">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <AnimatePresence>
      </AnimatePresence>
      {/* Header */}
       <div className="flex justify-between items-end">
         <div>
           <h2 className="text-2xl lg:text-3xl font-black text-white font-display uppercase tracking-tight flex items-center gap-3">
             Crop <span className="text-blue-500">Labels</span>
             <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-black tracking-widest rounded-lg border border-emerald-500/20">Alpha</span>
           </h2>
           <p className="text-slate-400 font-medium text-xs lg:text-sm mt-1">Smart OCR, Cropping, and Bulk Sorting for Meesho & Flipkart.</p>
         </div>
         {PLAN_LIMITS[user.activePlanId || 'trial']?.labelCrops > 0 && PLAN_LIMITS[user.activePlanId || 'trial']?.labelCrops < 99999 && (
           <div className="hidden lg:flex items-center gap-3">
             <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Limit</p>
               <p className="text-sm font-medium text-slate-300">
                 {usage.labelCrops} / {PLAN_LIMITS[user.activePlanId || 'trial']?.labelCrops || 1}
               </p>
             </div>
             <div className="h-10 w-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
               <Zap className="h-4 w-4 text-emerald-400" />
             </div>
           </div>
         )}
       </div>

       <div className="grid lg:grid-cols-3 gap-6 flex-1">
         {/* Left Col - Settings & Dropper */}
         <div className="lg:col-span-2 space-y-6 flex flex-col">
            <div 
              className={`flex-1 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-12 transition-all group relative overflow-hidden bg-slate-900/50 backdrop-blur-xl ${processing ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500 hover:bg-blue-500/5'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !processing && fileInputRef.current?.click()}
            >
               <AnimatePresence>
                 {processing && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-[50] flex flex-col items-center justify-center p-8 text-center"
                   >
                     <div className="relative mb-8">
                       <div className="h-24 w-24 border-b-2 border-l-2 border-blue-500 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                         <div className="h-16 w-16 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center">
                         <Box className="h-8 w-8 text-white animate-pulse" />
                       </div>
                     </div>
                     <div className="space-y-4 max-w-sm">
                       <h3 className="text-2xl font-black text-white tracking-tight uppercase font-display italic">
                         {progressMsg || "Processing Labels..."}
                       </h3>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div 
                           className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                           animate={{ 
                             x: ["-100%", "100%"] 
                           }}
                           transition={{ 
                             repeat: Infinity, 
                             duration: 1.5,
                             ease: "easeInOut"
                           }}
                         />
                       </div>
                       <p className="text-slate-400 text-sm font-bold tracking-widest uppercase opacity-60">ListingAI Label Pipeline V2.0</p>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
               <input type="file" multiple accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
               
               <div className="h-24 w-24 rounded-full bg-slate-800/80 group-hover:bg-blue-600 border border-white/5 flex items-center justify-center mb-6 transition-colors relative z-10 shadow-2xl">
                  <Box className="h-10 w-10 text-slate-400 group-hover:text-white transition-colors" />
               </div>

               <div className="text-center relative z-10">
                  <h3 className="text-xl font-black text-white mb-2 font-display">Drag PDF Labels Here</h3>
                  <p className="text-slate-400 text-sm font-medium">or click to browse from your device</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                     <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-slate-300 uppercase tracking-widest">+ Infinite Pages</span>
                     <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-slate-300 uppercase tracking-widest">Auto-Crop</span>
                  </div>
               </div>
            </div>

           {/* File List */}
           {files.length > 0 && (
             <div className="bg-slate-900/80 rounded-[2rem] p-6 border border-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-4">Queued Files ({files.length})</h4>
                <div className="space-y-2">
                   {files.map((f, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-800/50 px-4 py-3 rounded-xl border border-white/5">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                            <span className="text-sm font-medium text-slate-200 truncate">{f.name}</span>
                         </div>
                         <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0">
                            <X className="h-4 w-4" />
                         </button>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Right Col - Controls */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 flex flex-col space-y-8">
           <div className="space-y-6 flex-1">
              {/* Platform */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Platform Setting</label>
                 <div className="grid grid-cols-2 gap-3">
                    {['meesho', 'flipkart'].map((p) => (
                       <button
                          key={p}
                          onClick={() => setPlatform(p as any)}
                          className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${platform === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                       >
                          {p}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Sorting */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Sort Pages By</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                       onClick={() => setSortBy('sku')}
                       className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${sortBy === 'sku' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    >
                       SKU
                    </button>
                    <button
                       onClick={() => setSortBy('courier')}
                       className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${sortBy === 'courier' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    >
                       Courier
                    </button>
                 </div>
              </div>

              {/* Crop Mode */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Operations</label>
                 <button
                    onClick={() => setWithInvoice(!withInvoice)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${!withInvoice ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                 >
                    <div className="flex items-center gap-3">
                       <Zap className={`h-5 w-5 ${!withInvoice ? 'text-emerald-400' : 'text-slate-500'}`} />
                       <span className="text-sm font-black uppercase tracking-widest">Aggressive Crop</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${!withInvoice ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                       <div className={`absolute top-1 max-w-[12px] min-w-[12px] h-3 rounded-full bg-white transition-all ${!withInvoice ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </button>
                 <p className="text-[10px] text-slate-500 font-medium px-2 leading-relaxed">
                    Crop mode isolates the 4x6 shipping label using pixel analysis. Turning this off retains the full invoice.
                 </p>
                 <button
                    onClick={() => setGenerateCSV(!generateCSV)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${generateCSV ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                 >
                    <div className="flex items-center gap-3">
                       <FileText className={`h-5 w-5 ${generateCSV ? 'text-indigo-400' : 'text-slate-500'}`} />
                       <span className="text-sm font-black uppercase tracking-widest">Export CSV/Excel</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${generateCSV ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                       <div className={`absolute top-1 max-w-[12px] min-w-[12px] h-3 rounded-full bg-white transition-all ${generateCSV ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </button>
                 <p className="text-[10px] text-slate-500 font-medium px-2 leading-relaxed">
                    Exports an Excel-compatible CSV summary of SKU counts aggregated from all pages.
                 </p>
              </div>
           </div>

           {/* Status & Action */}
           <div className="space-y-4">
              <AnimatePresence>
                 {errorMsg && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className="p-4 rounded-xl text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20"
                    >
                       {errorMsg}
                    </motion.div>
                 )}
              </AnimatePresence>

              <button
                 onClick={processFiles}
                 disabled={processing || files.length === 0}
                 className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-white/10"
              >
                 {processing ? (
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce"></span>
                      </div>
                      <span className="tracking-widest">Processing...</span>
                    </div>
                 ) : (
                    <>
                       <Download className="h-5 w-5 text-blue-600" />
                       Run Pipeline
                    </>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

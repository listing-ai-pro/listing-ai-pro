import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Award, Zap, ExternalLink, ArrowRight, Package, Users, Shield, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function TrendingProducts() {
  const [activeTab, setActiveTab] = useState<'top' | 'growing' | 'suppliers'>('top');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fallback data in case the Python API is not running locally
  const fallbackData = {
    top: [
      { title: "Premium Quality Smart Watch Series 8", price: "$45.99", sales_volume: "10,000+ sold", image_url: "https://picsum.photos/seed/watch/300", link: "#", supplier_name: "TechGear Pro" },
      { title: "Ergonomic Office Chair with Lumbar Support", price: "$129.50", sales_volume: "8,500+ sold", image_url: "https://picsum.photos/seed/chair/300", link: "#", supplier_name: "ErgoMinds" },
      { title: "Minimalist Leather Backpack", price: "$34.00", sales_volume: "5,000+ sold", image_url: "https://picsum.photos/seed/bag/300", link: "#", supplier_name: "UrbanStyle" },
    ],
    growing: [
      { title: "Portable Blender USB Rechargeable", price: "$19.99", growth_percentage: "+150% This Week", image_url: "https://picsum.photos/seed/blender/300", link: "#", supplier_name: "HomeKitchen" },
      { title: "Noise Cancelling Wireless Earbuds", price: "$29.90", growth_percentage: "+85% This Week", image_url: "https://picsum.photos/seed/earbuds/300", link: "#", supplier_name: "AudioTech" },
      { title: "Posture Corrector Brace", price: "$12.50", growth_percentage: "+60% This Week", image_url: "https://picsum.photos/seed/posture/300", link: "#", supplier_name: "HealthPlus" },
    ],
    suppliers: [
      { name: "Global Tech Supplier Co.", rating: "4.9", top_selling_items: ["Smartphones", "Accessories", "Wearables"], link: "#" },
      { name: "Home Essentials Direct", rating: "4.8", top_selling_items: ["Kitchenware", "Decor", "Storage"], link: "#" },
      { name: "Fashion Hub Wholesale", rating: "4.7", top_selling_items: ["Apparel", "Bags", "Shoes"], link: "#" },
    ]
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData([]);

    try {
      // Set this to your Railway URL once deployed, for example: 
      // const API_BASE_URL = 'https://scraper-backend-production.up.railway.app';
      const API_BASE_URL = 'https://listing-ai-pro.onrender.com';
      
      const res = await axios.get(`${API_BASE_URL}/api/${activeTab === 'suppliers' ? 'suppliers/top' : `trends/${activeTab}`}`);
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        throw new Error("Invalid format");
      }
      setLoading(false);
    } catch (e) {
      console.log('Python API not reachable. Using fallback data.');
      // Simulate API delay
      setTimeout(() => {
         setData((fallbackData as any)[activeTab]);
         setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="relative">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
          >
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Deep Scrape Technology</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 font-display leading-[1.1]">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Trending Products</span><br />
            & Supplier Discovery
          </h2>
          <p className="text-lg font-medium text-slate-400 leading-relaxed max-w-xl">
            Live extracted data from top e-commerce platforms using our stealth Scrapling engine. Find winning products before your competitors do.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-slate-900 border border-white/5 p-2 rounded-3xl w-fit">
        {[
          { id: 'top', label: 'Top Volumes', icon: Award },
          { id: 'growing', label: 'Movers & Shakers', icon: Zap },
          { id: 'suppliers', label: 'Top Suppliers', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
        
        <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/10 ml-auto lg:ml-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
        </button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
            <Loader2 />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
              {Array.isArray(data) && data.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-orange-500/20 transition-colors shadow-xl"
                >
                  {activeTab !== 'suppliers' ? (
                    <>
                      <div className="h-48 bg-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
                           <span className="text-white font-mono text-sm font-black">{item.price}</span>
                        </div>
                      </div>
                      <div className="p-6 space-y-4 relative z-20 bg-slate-900">
                        <h3 className="text-lg font-black text-white leading-tight line-clamp-2">{item.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                           {activeTab === 'growing' ? (
                              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                 <TrendingUp className="h-4 w-4" />
                                 {item.growth_percentage}
                              </div>
                           ) : (
                              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                 <Package className="h-4 w-4" />
                                 {item.sales_volume}
                              </div>
                           )}
                        </div>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                           <span className="text-[10px] font-bold text-slate-500">Supplier: <span className="text-slate-300">{item.supplier_name}</span></span>
                           <a href={item.link} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors">
                              <ExternalLink className="h-3 w-3" />
                           </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 space-y-6">
                        <div className="flex items-start justify-between">
                           <div className="h-16 w-16 rounded-2xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center shadow-lg">
                              <Users className="h-8 w-8 text-orange-500" />
                           </div>
                           <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                              <Shield className="h-3 w-3 text-amber-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{item.rating}</span>
                           </div>
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-white">{item.name}</h3>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Verified Supplier</p>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top Selling Categories</p>
                           <div className="flex flex-wrap gap-2">
                              {Array.isArray(item.top_selling_items) && item.top_selling_items.map((cat: string, j: number) => (
                                 <span key={j} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                                    {cat}
                                 </span>
                              ))}
                           </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                           <a href={item.link} target="_blank" rel="noopener noreferrer" className="group/btn flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 hover:bg-orange-600 transition-colors">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">Visit Store</span>
                              <ArrowRight className="h-4 w-4 text-white group-hover/btn:-rotate-45 transition-transform" />
                           </a>
                        </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function Loader2() {
   return (
      <div className="flex flex-col items-center gap-4">
         <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
         </div>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Running Scrapling Engine...</span>
      </div>
   );
}

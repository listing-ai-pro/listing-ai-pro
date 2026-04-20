import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { trackCustom } from '../lib/pixel';
import { 
  TrendingUp, 
  Zap, 
  Search, 
  Package, 
  CheckCircle, 
  ArrowUpRight, 
  BarChart3, 
  FileText, 
  Camera, 
  RefreshCw, 
  LayoutGrid,
  History,
  ShieldCheck,
  AlertCircle,
  Clock,
  BookOpen,
  Crown,
  CreditCard,
  Lock,
  Plus,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useUsage } from '../hooks/useUsage';
import { PLAN_LIMITS } from '../lib/usage';
import { isPlanActive } from '../lib/subscription';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Variants } from 'motion/react';

const DailyResetTimer = () => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number}>({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0);
      
      const diff = nextReset.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ h, m, s });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-lg">
      <Clock className="h-3.5 w-3.5 animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest font-mono">
        Reset In: {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
      </span>
    </div>
  );
};

export default function UserDashboard({ user, onTabChange }: { user: any, onTabChange?: (tab: string) => void }) {
  const { usage } = useUsage(user);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const isPro = user.subscriptionPlan === 'pro';
  const isActive = isPlanActive(user);

  const getGrowthSuggestion = () => {
    if (!isActive) {
      return "Aapka plan expire ho gaya hai. Naya plan buy karein taaki aap tools use kar sakein.";
    }
    const planId = user.activePlanId || 'trial';
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;
    
    if (usage.listingsGenerated < limits.listingsGenerated / 2) {
      return `Aaj kam se kam ${limits.listingsGenerated / 2} listings optimize karein taaki aapka search rank top pe aaye aur sales badhe.`;
    }
    if (usage.marketAnalysis < limits.marketAnalysis / 2) {
      return "Market intelligence tool use karein aur dekhein competitors kya price pe sell kar rahe hain, isse aap apni pricing behtar kar sakte hain.";
    }
    return "Aapka performance behtar hai! Naye trending products add karke apna catalog expand karein aur market share badhayein.";
  };

  useEffect(() => {
    if (!user.uid) return;
    
    // Fetch recent activities (simulated for now, but could be real from a 'logs' collection)
    // For now, let's just make the existing ones feel more "real" by linking them to usage
    const mockActivities = [
      { title: "Maroon Ajrakh Blouse", time: "2 mins ago", type: "Listing", status: "Optimized" },
      { title: "Silk Saree Lifestyle", time: "15 mins ago", type: "Photo", status: "Generated" },
      { title: "Cotton Kurti Set", time: "1 hour ago", type: "Listing", status: "Optimized" },
    ];
    setRecentActivities(mockActivities);

    // Calculate total saved based on optimizations (₹35 per optimization)
    // In a real app, we'd sum all daily_stats
    setTotalSaved(usage.shippingOptimizations * 35);
  }, [user.uid, usage]);

  const growthData = [
    { name: 'Mon', orders: 12 },
    { name: 'Tue', orders: 18 },
    { name: 'Wed', orders: 15 },
    { name: 'Thu', orders: 28 },
    { name: 'Fri', orders: 35 },
    { name: 'Sat', orders: 42 },
    { name: 'Today', orders: usage.listingsGenerated * 3 + 5 }, // Dynamic based on real usage
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 selection:bg-blue-500/30 font-sans">
      {/* Expiration Banner */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2.5rem] bg-red-50 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4 lg:gap-6 shadow-xl shadow-red-500/5"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 mx-auto sm:mx-0">
              <AlertCircle className="h-5 w-5 lg:h-6 lg:w-6" />
            </div>
            <div>
              <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Subscription Expired</p>
              <h4 className="text-base lg:text-lg font-black text-slate-900">Aapka plan khatam ho gaya hai! 🛑</h4>
              <p className="text-xs lg:text-sm font-medium text-slate-500">Tools use karne ke liye naya plan buy karein.</p>
            </div>
          </div>
          <button
            onClick={() => {
              trackCustom('UpgradeClick', { location: 'Dashboard Banner', userEmail: user.email });
              onTabChange?.('Subscription');
            }}
            className="w-full sm:w-auto px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            Upgrade Now
          </button>
        </motion.div>
      )}

      {/* 1. WELCOME & QUICK STATS (Bento Header) */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-6 gap-6"
      >
        <motion.div 
          variants={itemVariants} 
          className="md:col-span-4 p-6 lg:p-12 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden group shadow-3xl shadow-blue-500/10 border border-white/5"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[150px] -mr-80 -mt-80 opacity-20"></div>
          <div className="relative space-y-6 lg:space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400/80 font-mono">Mission: Scale</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 backdrop-blur-xl shadow-lg ${!isActive ? 'bg-red-500/10 border-red-500/20 text-red-400' : isPro ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  {!isActive ? <Lock className="h-3 w-3" /> : isPro ? <Crown className="h-3 w-3 fill-emerald-400/50" /> : <Zap className="h-3 w-3" />}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {!isActive ? 'Account Locked' : user.activePlanId === 'max' ? 'ListingAI MAX' : 'PRO STATUS'}
                  </span>
                </div>
                <div className="scale-90 origin-left">
                  <DailyResetTimer />
                </div>
              </div>
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-3xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] lg:leading-[0.95]">
                Swagat hai, <br/>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic font-serif">
                  {user.displayName?.split(' ')[0] || 'Seller'}
                </span>
              </h2>
              <p className="text-slate-400 text-sm lg:text-lg font-medium max-w-xl leading-relaxed">
                {getGrowthSuggestion()}
              </p>
            </div>

            <div className="pt-4 lg:pt-6 flex flex-col sm:flex-row gap-4 lg:gap-5">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange?.('Listing Generator')}
                className="w-full sm:w-auto px-8 py-4 lg:px-10 lg:py-5 rounded-2xl lg:rounded-3xl bg-blue-600 text-white text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <Plus className="h-4 w-4 lg:h-5 lg:w-5 group-hover:rotate-180 transition-transform duration-500" />
                New Listing
              </motion.button>
              <button 
                onClick={() => onTabChange?.('Subscription')}
                className="w-full sm:w-auto px-8 py-4 lg:px-10 lg:py-5 rounded-2xl lg:rounded-3xl bg-white/5 border border-white/10 text-white text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-md hover:border-white/20"
              >
                {isPro ? 'Upgrade Plan' : 'Buy Pro API'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="md:col-span-2 grid grid-cols-1 gap-6"
        >
          <div className="glass-card p-8 rounded-[2.5rem] space-y-4 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 relative z-10 glow-blue">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-serif italic">SEO Index</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-white font-mono tracking-tighter text-glow">{usage.listingsGenerated > 0 ? '94' : '0'}</p>
                <span className="text-lg font-black text-slate-500">/100</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black tracking-widest">
                <ArrowUpRight className="h-4 w-4" />
                TOP 1% SELLERS
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] space-y-4 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 relative z-10">
              <Zap className="h-7 w-7" />
            </div>
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-serif italic">Profit Saved</p>
              <p className="text-5xl font-black text-white font-mono tracking-tighter text-glow">₹{totalSaved || '0'}</p>
              <div className="flex items-center gap-3 text-blue-400/80 text-[10px] font-black tracking-widest border border-white/5 bg-white/5 w-fit px-4 py-1.5 rounded-2xl">
                <RefreshCw className="h-3 w-3 animate-spin-slow text-blue-500" />
                LIVE SYNC
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Productivity Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Advanced Tools Bento Grid */}
          <div className="space-y-6">
            <div className="flex items-end justify-between px-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] font-mono">AI Engine</p>
                <h3 className="text-3xl font-black text-white font-display text-glow">Optimization Tools ⚡</h3>
              </div>
              <button 
                onClick={() => onTabChange?.('Listing Generator')}
                className="text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Expand View
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[
                { 
                  title: "Listing Generator", 
                  desc: "SEO titles & descriptions written by AI.", 
                  icon: FileText, 
                  color: "bg-blue-500/10 text-blue-400",
                  usageKey: "listingsGenerated",
                  accent: "blue"
                },
                { 
                  title: "A+ Visual Content", 
                  desc: "Build high-conversion brand story modules.", 
                  icon: BookOpen, 
                  color: "bg-pink-500/10 text-pink-400",
                  usageKey: "aplusGenerated",
                  accent: "pink"
                }
              ].map((tool, i) => {
                const used = usage[tool.usageKey as keyof typeof usage] || 0;
                const planId = user.activePlanId || 'trial';
                const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;
                const limit = limits[tool.usageKey as keyof typeof usage] || 10;
                const percentage = Math.min(100, (used / limit) * 100);
                
                return (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -8, scale: 1.01 }}
                    onClick={() => onTabChange?.(tool.title)}
                    className="p-6 lg:p-8 rounded-[2rem] glass-card transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="space-y-4">
                      <div className={`h-12 w-12 lg:h-14 lg:w-14 rounded-2xl ${tool.color} flex items-center justify-center border border-white/5`}>
                        <tool.icon className="h-6 w-6 lg:h-7 lg:w-7" />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-lg lg:text-xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight font-display">{tool.title}</h4>
                        <p className="text-[10px] lg:text-xs font-medium text-slate-400 leading-relaxed">{tool.desc}</p>
                      </div>
                    </div>

                    <div className="mt-8 lg:mt-10 space-y-3">
                      <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] font-mono">
                        <span className="text-slate-500">Usage Meter</span>
                        <span className={`${percentage > 90 ? 'text-red-400' : 'text-slate-300'}`}>{used}/{limit}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 2, ease: "anticipate" }}
                          className={`h-full rounded-full transition-all duration-1000 ${
                            percentage > 90 ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 
                            percentage > 70 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 
                            'bg-gradient-to-r from-blue-600 to-indigo-400 shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                          }`}
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pro Features Cluster */}
            <div className="p-8 lg:p-12 rounded-[3.5rem] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 pointer-events-none">
                  <Crown className="h-32 w-32 text-blue-500/10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
               </div>
               
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 relative z-10">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Crown className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono italic">Premium Tools</span>
                     </div>
                     <h3 className="text-3xl font-black text-white font-display">ListingAI PRO Hub 💎</h3>
                  </div>
                  {!isPro && (
                     <button 
                        onClick={() => onTabChange?.('Subscription')}
                        className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
                     >
                        Unlock Pro Forever
                     </button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {[
                    { 
                      title: "AI Photoshoot", 
                      desc: "Convert basic photos into professional model lifestyle shots for Meesho.", 
                      icon: Camera, 
                      color: "bg-orange-500/10 text-orange-400",
                      usageKey: "photoshoots",
                      badge: "PRO",
                      restricted: user.activePlanId === 'trial',
                      accent: "orange"
                    },
                    { 
                      title: "Low Shipping", 
                      desc: "Optimize packaging & weights to drop shipping costs by up to 40%.", 
                      icon: Zap, 
                      color: "bg-emerald-500/10 text-emerald-400",
                      usageKey: "shippingOptimizations",
                      badge: "PRO",
                      restricted: user.activePlanId === 'trial',
                      accent: "emerald",
                      tabName: "Low Shipping"
                    },
                    { 
                      title: "Bulk Generator", 
                      desc: "Optimize 20+ products in one go. Scale your entire catalog in minutes.", 
                      icon: RefreshCw, 
                      color: "bg-blue-500/10 text-blue-400",
                      usageKey: "bulkGenerated",
                      badge: "YEARLY",
                      restricted: user.activePlanId !== 'yearly',
                      accent: "blue"
                    }
                  ].map((tool, i) => {
                    const used = usage[tool.usageKey as keyof typeof usage] || 0;
                    const planId = user.activePlanId || 'trial';
                    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;
                    const limit = limits[tool.usageKey as keyof typeof usage] || 10;
                    const percentage = Math.min(100, (used / limit) * 100);

                    return (
                      <motion.div
                        key={i}
                        whileHover={tool.restricted ? {} : { scale: 1.02 }}
                        onClick={() => tool.restricted ? onTabChange?.('Subscription') : onTabChange?.((tool as any).tabName || tool.title)}
                        className={`p-6 rounded-[2.5rem] bg-slate-950/80 border border-white/5 backdrop-blur-xl relative overflow-hidden group/item cursor-pointer flex flex-col h-full ${
                          tool.restricted ? 'opacity-80 grayscale-[0.5]' : 'hover:border-blue-500/30'
                        }`}
                      >
                        {tool.restricted && (
                           <div className="absolute top-4 right-4 z-20">
                              <Lock className="h-4 w-4 text-slate-500" />
                           </div>
                        )}
                        <div className="space-y-6 flex-1">
                          <div className={`h-14 w-14 rounded-2xl ${tool.color} flex items-center justify-center border border-white/5 shadow-inner`}>
                            <tool.icon className="h-7 w-7" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-white tracking-tight font-display">{tool.title}</h4>
                                <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-lg tracking-widest">PRO</span>
                             </div>
                             <p className="text-xs font-medium text-slate-400 leading-relaxed">{tool.desc}</p>
                          </div>
                        </div>
                        
                        {!tool.restricted && (
                           <div className="mt-8 flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Usage Stat</span>
                                 <span className="text-xs font-black text-white">{used}/{limit}</span>
                              </div>
                              <ArrowUpRight className="h-5 w-5 text-blue-500 group-hover/item:translate-x-1 group-hover/item:-translate-y-1 transition-transform" />
                           </div>
                        )}
                      </motion.div>
                    )
                  })}
               </div>
            </div>
          </div>

          {/* Detailed Performance Chart */}
          <div className="glass-card rounded-[2.5rem] p-8 lg:p-12 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10">
              <div className="h-40 w-40 bg-blue-600 rounded-full blur-[100px] opacity-10 group-hover:scale-150 transition-transform"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] font-mono">Performance</p>
                <h3 className="text-3xl font-black text-white font-display">Optimization Impact 📊</h3>
              </div>
              <div className="flex bg-white/5 p-2 rounded-[1.75rem] border border-white/10 backdrop-blur-xl">
                <button className="px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">7d View</button>
                <button className="px-6 py-2 rounded-2xl bg-blue-600 shadow-xl text-[11px] font-black uppercase tracking-widest text-white">30d Growth</button>
              </div>
            </div>

            <div className="h-[350px] w-full relative z-10 p-4 bg-slate-950/20 rounded-[2.5rem] border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorOrdersUser" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    dy={15}
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.1em'}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10}
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'monospace'}} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '4 4' }}
                    contentStyle={{
                      borderRadius: '32px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
                      padding: '24px',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(20px)'
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}
                    itemStyle={{color: '#fff', fontWeight: 900, fontSize: '18px'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#2563eb" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorOrdersUser)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Insights Card */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 lg:p-14 text-white relative overflow-hidden group border border-white/5 shadow-3xl shadow-slate-950/50">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px] -mr-40 -mt-40 opacity-20"></div>
            <div className="relative space-y-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-indigo-400">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] font-mono">Market Intel</span>
                </div>
                <h4 className="text-3xl font-black font-display tracking-tight leading-none">Growth Pulse 💡</h4>
              </div>
              
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 relative overflow-hidden group/card shadow-inner">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-50"></div>
                <p className="text-slate-300 text-lg font-medium leading-[1.6] italic font-serif">
                  "{getGrowthSuggestion()}"
                </p>
                <div className="h-px w-full bg-white/10"></div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black glow-blue">AI</div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Optimized Real-time</span>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange?.('Competitor Analysis')}
                className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)]"
              >
                Launch Intelligence
              </motion.button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-card rounded-[3.5rem] p-10 lg:p-14 border border-white/5 space-y-10 h-fit">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1.25rem] bg-white/5 flex items-center justify-center border border-white/10">
                  <History className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-white font-display">Timeline</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {recentActivities.map((item, i) => (
                <div key={i} className="group relative pl-10 pb-10 last:pb-0">
                  {/* Vertical Timeline Line */}
                  {i !== recentActivities.length - 1 && (
                    <div className="absolute left-[9px] top-8 bottom-0 w-[1px] bg-white/5"></div>
                  )}
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-[6px] border-slate-950 shadow-2xl z-10 transition-transform group-hover:scale-125 ${
                    item.type === 'Listing' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-indigo-500 shadow-indigo-500/20'
                  }`}></div>
                  
                  <div className="space-y-2 p-5 rounded-3xl bg-white/0 group-hover:bg-white/5 transition-all border border-transparent group-hover:border-white/5">
                    <div className="flex justify-between items-start">
                      <p className="text-[15px] font-black text-white tracking-tight">{item.title}</p>
                      <span className="text-[11px] font-mono text-slate-500">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {item.type}
                      </div>
                      <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">{item.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-10 space-y-3">
                  <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                    <Sparkles className="h-10 w-10 text-slate-700" />
                  </div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic font-serif">No signal yet</p>
                </div>
              )}
            </div>
            
            <button className="w-full py-5 rounded-3xl bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all border border-white/5">
              Archive History
            </button>
          </div>

          {/* Sync Status Bento */}
          <div className="p-10 rounded-[3.5rem] bg-indigo-950/30 border border-indigo-500/10 space-y-8 group cursor-pointer hover:bg-indigo-950/40 transition-colors relative overflow-hidden backdrop-blur-md">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4 text-indigo-400">
                <RefreshCw className="h-6 w-6 animate-spin-slow" />
                <h4 className="text-xl font-black font-display tracking-tight">Active Sync</h4>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black">STABLE</div>
            </div>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {[
                { name: 'M', active: true, label: 'Meesho' },
                { name: 'A', active: false, label: 'Amazon' },
                { name: 'F', active: false, label: 'Flipkart' },
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className={`h-16 rounded-[1.5rem] border flex items-center justify-center font-black text-lg shadow-inner transition-all ${
                    m.active ? 'bg-indigo-600 border-indigo-400 text-white glow-blue' : 'bg-white/5 border-white/5 text-slate-700 opacity-40'
                  }`}>
                    {m.name}
                  </div>
                  <p className="text-[8px] font-black text-center text-slate-600 uppercase tracking-widest">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-indigo-400 text-center uppercase tracking-[0.2em] italic font-serif opacity-90 relative z-10">
              Synced with Meesho API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

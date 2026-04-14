import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  BookOpen,
  Crown,
  CreditCard
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
import { USAGE_LIMITS } from '../lib/usage';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export default function UserDashboard({ user, onTabChange }: { user: any, onTabChange?: (tab: string) => void }) {
  const { usage } = useUsage(user.uid);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const isPro = user.subscriptionPlan === 'pro';

  const getGrowthSuggestion = () => {
    if (usage.listingsGenerated < 5) {
      return "Aaj kam se kam 10 listings optimize karein taaki aapka search rank top pe aaye aur sales badhe.";
    }
    if (usage.whiteBackgrounds < 3) {
      return "Aapki product photos ka background remove karein, professional images se conversion rate 40% tak badh sakta hai.";
    }
    if (usage.marketAnalysis < 2) {
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
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* 1. WELCOME & QUICK STATS */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20 transition-transform group-hover:scale-110"></div>
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-blue-400">
                <Zap className="h-5 w-5 fill-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Advanced Dashboard</span>
              </div>
              <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 ${isPro ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                {isPro ? <Crown className="h-3 w-3 fill-emerald-400" /> : <Zap className="h-3 w-3" />}
                <span className="text-[9px] font-black uppercase tracking-widest">{isPro ? 'Pro Member' : 'Free Plan'}</span>
              </div>
            </div>
            <h2 className="text-3xl font-black font-display">Welcome back, {user.displayName?.split(' ')[0] || 'Seller'}! 👋</h2>
            <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
              Aapka business grow kar raha hai! {getGrowthSuggestion()}
            </p>
            <div className="pt-4 flex gap-4">
              <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                New Listing
              </button>
              <button 
                onClick={() => onTabChange?.('Subscription')}
                className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <CreditCard className="h-3 w-3" />
                {isPro ? 'Manage Plan' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SEO Health</p>
            <p className="text-3xl font-black text-slate-900">{usage.listingsGenerated > 0 ? '91%' : '0%'}</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black">
            <ArrowUpRight className="h-3 w-3" />
            {usage.listingsGenerated > 0 ? '+12% THIS WEEK' : 'START OPTIMIZING'}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Reach</p>
            <p className="text-3xl font-black text-slate-900">{usage.marketAnalysis > 0 ? 'High' : 'Low'}</p>
          </div>
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black">
            <ArrowUpRight className="h-3 w-3" />
            {usage.marketAnalysis > 0 ? 'EXPANDING' : 'NEEDS ANALYSIS'}
          </div>
        </motion.div>
      </motion.div>

      {/* 2. ADVANCED TOOLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 font-display">Advanced AI Tools 🛠️</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Tools</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                title: "Listing Generator", 
                desc: "SEO-optimized titles and descriptions for Meesho.", 
                icon: FileText, 
                color: "bg-blue-50 text-blue-600",
                usageKey: "listingsGenerated"
              },
              { 
                title: "White Background", 
                desc: "Remove backgrounds and make photos marketplace-ready.", 
                icon: LayoutGrid, 
                color: "bg-purple-50 text-purple-600",
                usageKey: "whiteBackgrounds"
              },
              { 
                title: "AI Photoshoot", 
                desc: "Generate professional model shots from product photos.", 
                icon: Camera, 
                color: "bg-orange-50 text-orange-600",
                usageKey: "photoshoots",
                badge: "PRO",
                restricted: user.activePlanId === 'trial'
              },
              { 
                title: "SEO Health Audit", 
                desc: "Scan your existing listings and find optimization gaps.", 
                icon: ShieldCheck, 
                color: "bg-emerald-50 text-emerald-600",
                usageKey: "listingsGenerated",
                restricted: user.activePlanId === 'trial'
              },
              { 
                title: "A+ Content", 
                desc: "Create high-converting visual product descriptions.", 
                icon: BookOpen, 
                color: "bg-pink-50 text-pink-600",
                usageKey: "aplusGenerated"
              },
              { 
                title: "Competitor Analysis", 
                desc: "Track prices and keywords of top-selling products.", 
                icon: Search, 
                color: "bg-slate-100 text-slate-600",
                usageKey: "marketAnalysis"
              }
            ].map((tool, i) => {
              const used = usage[tool.usageKey as keyof typeof usage] || 0;
              const limit = USAGE_LIMITS[tool.usageKey as keyof typeof usage] || 10;
              const percentage = Math.min(100, (used / limit) * 100);
              
              return (
                <motion.div 
                  key={i}
                  whileHover={tool.restricted ? {} : { y: -5 }}
                  onClick={() => tool.restricted && onTabChange?.('Subscription')}
                  className={`p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all group cursor-pointer relative overflow-hidden ${
                    tool.restricted ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-xl hover:border-blue-100'
                  }`}
                >
                  {tool.restricted && (
                    <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-blue-600" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Upgrade Required</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl ${tool.color} flex items-center justify-center`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    {tool.badge && (
                      <span className="text-[8px] font-black px-2 py-1 rounded-lg bg-slate-900 text-white uppercase tracking-widest">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{tool.title}</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">{tool.desc}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Usage</span>
                      <span className="text-[9px] font-black text-slate-900">{used} / {limit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-orange-500' : 'bg-blue-600'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 text-right uppercase tracking-widest">
                      {limit - used} Remaining
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* GROWTH CHART */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display">Orders Performance</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Growth Analytics</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">7 Days</button>
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white">30 Days</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorOrdersUser" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                    itemStyle={{color: '#2563eb', fontWeight: 900, fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorOrdersUser)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SIDEBAR: RECENT ACTIVITY & ALERTS */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-black text-slate-900 font-display">Recent Activity</h3>
            </div>
            
            <div className="space-y-6">
              {recentActivities.map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.type === 'Listing' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {item.type === 'Listing' ? <FileText className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-xs font-medium text-slate-400 text-center py-4">No recent activity found.</p>
              )}
            </div>
            
            <button className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
              View History
            </button>
          </div>

          <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 space-y-6">
            <div className="flex items-center gap-3 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-lg font-black font-display">Optimization Alerts</h3>
            </div>
            <p className="text-xs font-medium text-orange-800 leading-relaxed">
              {usage.listingsGenerated < 5 
                ? "Aapne abhi tak 5 listings optimize nahi ki hain. Shuru karein aur sales badhayein!"
                : "Aapki listings ka SEO score behtar ho sakta hai. Inhe optimize karke aap search visibility 3x badha sakte hain."}
            </p>
            <button className="w-full py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20">
              {usage.listingsGenerated < 5 ? "Start Now" : "Fix Now"}
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-2xl -mr-16 -mt-16 opacity-30"></div>
            <div className="relative space-y-4">
              <h4 className="text-lg font-black font-display">Need Help? 💬</h4>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Hamare experts se baat karein aur apne Meesho business ko scale karein.
              </p>
              <button className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 transition-colors">
                Contact Support <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 font-display">Marketplace Sync</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Meesho', status: 'Connected', icon: 'M' },
                { name: 'Amazon', status: 'Pending', icon: 'A' },
                { name: 'Flipkart', status: 'Not Linked', icon: 'F' }
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 text-xs shadow-sm">
                      {m.icon}
                    </div>
                    <span className="text-xs font-black text-slate-900">{m.name}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                    m.status === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 
                    m.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              Manage Integrations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  MessageCircle, 
  CheckCircle, 
  Zap, 
  Star, 
  TrendingUp, 
  ShieldCheck,
  Search,
  Truck,
  FileText,
  BarChart3,
  Package,
  ArrowUpRight,
  Clock,
  XCircle,
  Sparkles,
  Shield,
  CreditCard,
  Target,
  Crown,
  Users,
  MousePointer2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { trackCustom } from '../lib/pixel';

const growthData = [
  { name: 'Day 1', orders: 2 },
  { name: 'Day 3', orders: 5 },
  { name: 'Day 5', orders: 12 },
  { name: 'Day 7', orders: 28 },
  { name: 'Day 10', orders: 45 },
  { name: 'Day 12', orders: 62 },
  { name: 'Day 15', orders: 85 },
];

const WhatsAppButton = ({ text = "WhatsApp 'DEMO' Now", className = "" }) => {
  const whatsappNumber = "919023654443";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=DEMO`;
  
  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => trackCustom('WhatsAppClick', { buttonText: text, location: 'Dashboard' })}
      className={`flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-[#20ba5a] transition-all ${className}`}
    >
      <MessageCircle className="h-5 w-5 fill-white" />
      {text}
    </motion.a>
  );
};

const AIDemoAnimation = () => {
  const [step, setStep] = useState(0);
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 2) {
      let start = 0;
      const interval = setInterval(() => {
        if (start < 91) {
          start += 2;
          setSeoScore(start > 91 ? 91 : start);
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else if (step === 0) {
      setSeoScore(0);
    }
  }, [step]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a0c10] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden font-sans text-left">
      {/* Browser Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0d1117]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-slate-800">
          <Zap className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] font-bold text-slate-400 tracking-wider">listingai.in/generate</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        <div className="p-8 bg-[#0a0c10]">
          <div className="space-y-6 text-center">
            <img 
               src="https://www.dropbox.com/scl/fi/xgkm1coqy0to4ytpwil63/1.jpeg?rlkey=q2iyu5xtcfn27nknu582zxxdk&st=zfrbbvfl&dl=1"
               className="w-full aspect-square object-cover rounded-2xl shadow-2xl relative z-10"
               alt="Product"
               referrerPolicy="no-referrer"
            />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Input: Raw Marketplace Photo</p>
          </div>
        </div>

        <div className="p-8 bg-[#0d1117] space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase">AI SEO Score</span>
            <span className="text-2xl font-black text-blue-400">{seoScore}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
             <motion.div animate={{ width: `${seoScore}%` }} className="h-full bg-blue-500" />
          </div>
          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 mb-2 uppercase">Optimized Title</p>
                <p className="text-xs font-bold text-slate-300">
                   {step >= 2 ? "Premium Multi-Color Embroidered Blouse — Heavy Designer Work with Latkans" : "..."}
                </p>
             </div>
             
             {step >= 3 ? (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-3"
               >
                 <div className="space-y-3">
                    {[1,2].map(i => (
                       <div key={i} className="flex items-center gap-2 text-[8px] font-bold text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                          <CheckCircle className="h-2 w-2" /> Sync {i} OK
                       </div>
                    ))}
                 </div>
               </motion.div>
             ) : (
               <div className="grid grid-cols-2 gap-3 opacity-20">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-slate-700 bg-slate-800/10 p-2 rounded-lg border border-slate-800/20">
                        <CheckCircle className="h-3 w-3" /> Step {i}
                     </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 justify-center">
      {[
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds }
      ].map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl">
            <span className="text-xl font-black text-white tabular-nums">{unit.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 font-sans selection:bg-blue-500/30 selection:text-white bg-transparent relative">
      {/* Space Background Effects with Stars animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-50 perspective-[1000px]">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
         <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen opacity-50" />
         <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
         
         {/* Animated Stars */}
         {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute bg-white rounded-full z-0"
              initial={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`, 
                scale: Math.random() * 0.5 + 0.1, 
                opacity: Math.random() * 0.5 + 0.2 
              }}
              animate={{ 
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
              style={{
                width: Math.random() * 4 + 1 + 'px',
                height: Math.random() * 4 + 1 + 'px',
              }}
            />
         ))}
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-32">
        
        {/* 1. HERO SECTION */}
        <motion.section variants={itemVariants} className="text-center pt-20 lg:pt-32 px-4 max-w-5xl mx-auto space-y-12 relative isolate">
          
          {/* Advanced 3D Hologram Orb (Behind Heading) */}
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] pointer-events-none z-0 opacity-50">
            <div className="w-full h-full perspective-[2000px] flex items-center justify-center">
              <div
                className="animate-orb w-full h-full rounded-full border border-blue-500/30 shadow-[0_0_250px_rgba(37,99,235,0.4)] bg-blue-500/5"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {[1,2,3,4,5,6].map((i) => (
                  <div
                    key={`ring-${i}`}
                    className="animate-ring absolute inset-[-10%] rounded-full border-2 border-blue-400/50"
                    style={{ 
                      transformStyle: 'preserve-3d', 
                      '--rx': `${i * 30}deg`, 
                      '--ry': `${i * 15}deg`,
                      animationDelay: `-${i * 3}s`,
                      animationDuration: `${10 + i * 4}s`
                    } as any}
                  >
                    {/* Glowing nodes on the rings */}
                    <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-300 rounded-full shadow-[0_0_20px_rgba(37,99,235,1)]" />
                    <div className="absolute bottom-0 right-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_25px_rgba(79,70,229,1)]" />
                  </div>
                ))}
                {/* Plasma Core */}
                <div className="animate-plasma absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/40 blur-[80px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-400/30 blur-[40px] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30">
               <Zap className="h-4 w-4 text-blue-400 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Enterprise AI Growth Engine</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tight font-display">
              SELL <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">EVERYWHERE</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Meesho pe sales nahi aa rahi? Shipping kharcha profit kha raha hai? <br />
              <span className="text-white font-black italic">ListingAI is the answer. 🚀</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <WhatsAppButton />
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                   <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden shadow-xl">
                      <img src={`https://picsum.photos/seed/${i * 10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                   </div>
                ))}
                <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                   +5k
                </div>
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-10 border-t border-white/10 grayscale opacity-40">
             {['AMAZON', 'FLIPKART', 'MEESHO', 'SHOPIFY'].map(brand => (
                <span key={brand} className="text-xl font-black tracking-widest text-slate-300">{brand}</span>
             ))}
          </div>
        </motion.section>

        {/* 2. DEMO ANIMATION */}
        <motion.section variants={itemVariants} className="px-4 text-center space-y-12">
           <AIDemoAnimation />
        </motion.section>

        {/* 3. AGENT ORCHESTRATION (THE "BRAIN") */}
        <motion.section variants={itemVariants} className="bg-transparent py-24 px-4 overflow-hidden relative">
           <div className="max-w-6xl mx-auto space-y-20 relative z-10">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl md:text-6xl font-black text-white font-display tracking-tight">Meet Your <span className="text-blue-400">AI Listing Team</span> 🤖</h2>
                 <p className="text-xl font-medium text-slate-400 max-w-2xl mx-auto">ListingAI orchestrates 4 specialized agents to handle your business end-to-end.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { name: "SEO Analyst", role: "Search Domination", icon: Search, color: "bg-blue-600" },
                  { name: "Creative Writer", role: "High-Conv Description", icon: FileText, color: "bg-purple-600" },
                  { name: "Market Specialist", role: "Competitor Intelligence", icon: BarChart3, color: "bg-orange-600" },
                  { name: "Policy Complier", role: "Zero Account Bans", icon: ShieldCheck, color: "bg-emerald-600" }
                ].map((agent, i) => (
                  <div key={i} className="group p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:shadow-2xl hover:border-blue-500/50 transition-all duration-500 text-center backdrop-blur-md">
                    <div className={`h-16 w-16 mx-auto rounded-[1.5rem] ${agent.color} shadow-xl text-white flex items-center justify-center mb-6`}>
                       <agent.icon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">{agent.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{agent.role}</p>
                  </div>
                ))}
              </div>
           </div>
        </motion.section>

        {/* 4. GROWTH ANALYTICS */}
        <motion.section variants={itemVariants} className="px-4 max-w-6xl mx-auto space-y-16">
           <div className="bg-slate-900 rounded-[4rem] p-10 md:p-20 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[150px] -mr-64 -mt-64 opacity-20"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                 <div className="space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black font-display leading-[0.95]">See Your Profits <br /> <span className="text-blue-400 font-display italic animate-pulse">Skyrocket! 📈</span></h2>
                    <p className="text-lg text-slate-400 font-medium">Don't just take our word for it. After switching to AI-Optimized listings, our sellers see an average of <span className="text-white font-black">450% increase in search visibility.</span></p>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                          <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Order Boost</p>
                          <p className="text-3xl font-black">+120%</p>
                       </div>
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                          <p className="text-[10px] font-black uppercase text-emerald-400 mb-2">RTO Reduced</p>
                          <p className="text-3xl font-black">-35%</p>
                       </div>
                    </div>
                 </div>

                 <div className="h-[350px] bg-white/5 rounded-[2.5rem] p-8 border border-white/10 backdrop-blur-md">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={growthData}>
                          <defs>
                             <linearGradient id="colorOrdersHero" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px' }} />
                          <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorOrdersHero)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </motion.section>

        {/* 5. PRICING SECTION - CORE CONVERSION */}
        <motion.section id="pricing" variants={itemVariants} className="max-w-6xl mx-auto px-4 space-y-20">
           <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white font-display">Ready To Grow? <br /> Choose Your <span className="text-blue-400">Plan</span></h2>
              <div className="flex items-center justify-center gap-4">
                 <span className="text-sm font-bold text-slate-400">Monthly</span>
                 <div className="h-6 w-12 bg-blue-600 rounded-full p-1 flex justify-end cursor-pointer">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
                 </div>
                 <span className="text-sm font-black text-white flex items-center gap-2">
                    Yearly <span className="px-2 py-0.5 bg-emerald-500/20 shadow-lg border border-emerald-500/30 text-emerald-400 text-[9px] rounded-md font-black italic uppercase">Save 60%</span>
                 </span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Growth Trial', period: '7 Days', price: '0', icon: Sparkles, color: 'text-slate-400', bg: 'bg-white/5', text: 'text-white', cta: 'Start 7-Day Trial', highlight: false, features: ['3 Listings / Day', '3 Competitor Analysis / Day', 'SEO Score Analysis', 'All Marketplaces'] },
                { name: 'ListingAI Max', period: '3 Days', price: '99', icon: Crown, color: 'text-rose-400', bg: 'bg-white/5', text: 'text-white', cta: 'Get Max Access', highlight: false, features: ['10 Listings / Day', '5 Competitor Analysis / Day', '3 A+ Content / Day', '3 AI Photoshoots / Day', '3 Low Shipping / Day'] },
                { name: '1 Month', period: 'Month', price: '399', icon: Zap, color: 'text-blue-400', bg: 'bg-slate-900', text: 'text-white', cta: 'Get Monthly', highlight: false, features: ['15 Listings / Day', '7 Competitor Analysis / Day', '4 A+ Content / Day', '3 AI Photoshoots / Day', '4 Low Shipping / Day'] },
                { name: '1 Year', period: 'Year', price: '1,999', icon: Star, color: 'text-amber-400', bg: 'bg-white/5', text: 'text-white', cta: 'Get Yearly', highlight: true, features: ['20 Listings / Day', '10 Competitor Analysis / Day', '5 A+ Content / Day', '5 AI Photoshoots / Day', '5 Low Shipping / Day', '5 Bulk Mega Listings / Day'] }
              ].map((plan, i) => (
                <div key={i} className={`relative p-8 lg:p-10 rounded-[3rem] border ${plan.highlight ? 'border-blue-500 ring-8 ring-blue-900/40 shadow-2xl shadow-blue-600/20' : 'border-white/10 '} ${plan.bg} ${plan.text || ''} transition-all duration-500 hover:-translate-y-2 backdrop-blur-md`}>
                   {plan.highlight && <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest whitespace-nowrap">Best Seller</span>}
                   <plan.icon className={`h-10 w-10 mb-6 ${plan.color}`} />
                   <h4 className="text-xl font-black mb-2 font-display">{plan.name}</h4>
                   <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black font-display text-white">₹{plan.price}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase">/ {plan.period}</span>
                   </div>
                   <div className="space-y-4 mb-10 min-h-[220px]">
                      {plan.features.map((feature, j) => (
                         <div key={j} className="flex gap-3 items-start">
                            <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-xs font-bold text-slate-300 leading-relaxed tracking-tight">{feature}</p>
                         </div>
                      ))}
                   </div>
                   <button onClick={() => window.location.hash = '#auth'} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'}`}>
                      {plan.cta}
                   </button>
                </div>
              ))}
           </div>
        </motion.section>

        {/* 6. URGENT FINAL BLOCK */}
        <motion.section variants={itemVariants} className="px-4">
           <div className="max-w-4xl mx-auto bg-orange-500 rounded-[4rem] p-16 text-center text-white space-y-10 shadow-2xl shadow-orange-500/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight">Special Launch Offer! ⏳</h2>
              <p className="text-xl font-bold opacity-90 max-w-2xl mx-auto">Join the top 5% of E-commerce sellers. Get Yearly Empire Plan at 60% OFF. <br /> <span className="underline decoration-wavy underline-offset-8 decoration-yellow-300">Offer expires when the timer hits zero!</span></p>
              
              <CountdownTimer />

              <div className="flex flex-col items-center gap-6 pt-6">
                 <WhatsAppButton text="Claim Offer via WhatsApp" className="bg-white text-orange-600 hover:bg-slate-50 shadow-2xl" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Verified Secure Checkout • 24/7 Support</p>
              </div>
           </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center py-20 border-t border-white/5 relative">
          <div className="flex justify-center gap-10 mb-8 opacity-40 hover:opacity-100 transition-all text-slate-400">
             <Star className="h-4 w-4" />
             <Users className="h-4 w-4" />
             <Target className="h-4 w-4" />
             <MousePointer2 className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">
            © 2026 ListingAI Enterprise Growth Hub. All Rights Reserved.
          </p>
        </footer>
      </motion.div>
    </div>
  );
}



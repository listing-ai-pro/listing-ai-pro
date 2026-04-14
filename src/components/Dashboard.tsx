import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ArrowDownToLine,
  BarChart3,
  Package,
  TrendingDown,
  ArrowUpRight,
  Clock,
  XCircle,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const growthData = [
  { name: 'Day 1', orders: 2 },
  { name: 'Day 3', orders: 5 },
  { name: 'Day 5', orders: 12 },
  { name: 'Day 7', orders: 28 },
  { name: 'Day 10', orders: 45 },
  { name: 'Day 12', orders: 62 },
  { name: 'Day 15', orders: 85 },
];

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
    <div className="w-full max-w-5xl mx-auto bg-[#0a0c10] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden font-sans text-left">
      {/* Browser Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1117]">
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

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="p-8 lg:p-12 border-r border-slate-800 bg-[#0a0c10]">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Input Image</span>
            </div>
            
            <div className="relative aspect-square rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group">
              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Package className="h-10 w-10" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Uploading Product...</p>
                  </motion.div>
                ) : (
                  <motion.img 
                    key="product"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src="https://picsum.photos/seed/blouse-embroidered/800/800"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </AnimatePresence>
              
              {step === 1 && (
                <motion.div 
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="p-8 lg:p-12 bg-[#0d1117] overflow-y-auto max-h-[600px] hide-scrollbar">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Output</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest">
                Meesho Optimized
              </div>
            </div>

            {/* SEO Score */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SEO Score</span>
                <span className="text-xl font-black text-blue-400 tabular-nums">{seoScore}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${seoScore}%` }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>

            {/* Optimized Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Optimized Title</p>
                <div className="min-h-[3rem] bg-slate-900/50 rounded-xl border border-slate-800 p-3 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {step >= 2 ? (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-slate-200 leading-relaxed"
                      >
                        Premium Embroidered Phantom Silk Blouse — Heavy Work Designer Wear
                      </motion.p>
                    ) : (
                      <div className="flex gap-1">
                        <div className="w-2 h-4 bg-slate-800 rounded animate-pulse"></div>
                        <div className="w-16 h-4 bg-slate-800 rounded animate-pulse"></div>
                        <div className="w-12 h-4 bg-slate-800 rounded animate-pulse"></div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Features</p>
                <div className="space-y-2">
                  {[
                    "Heavy Multi-Color Embroidery — Premium Finish",
                    "Phantom Silk Fabric — Elegant & Comfortable",
                    "Designer Back Pattern with Latkans"
                  ].map((f, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-3 text-[10px] font-bold text-slate-400"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      {f}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {["embroidered blouse", "designer blouse", "phantom silk", "meesho blouse"].map((k, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={step >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-500"
                    >
                      {k}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* AI Product Images (Model Transformation) */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Product Images</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Lifestyle', seed: 'fashion-model-blouse' },
                    { label: 'Studio', seed: 'studio-wear' }
                  ].map((img, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0 }}
                      transition={{ delay: 0.5 + (i * 0.2) }}
                      className="relative aspect-[3/4] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group"
                    >
                      <img 
                        src={`https://picsum.photos/seed/${img.seed}/400/533`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        alt={img.label}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-3">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">{img.label}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset for demo urgency
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-2 md:gap-4 justify-center">
      {[
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds }
      ].map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl md:rounded-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-lg">
            <span className="text-xl md:text-2xl font-black text-white tabular-nums">
              {unit.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/60 mt-2">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const whatsappNumber = "919023654443";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=DEMO`;

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

  const WhatsAppButton = ({ text = "WhatsApp 'DEMO' Now", className = "" }) => (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-[#20ba5a] transition-all ${className}`}
    >
      <MessageCircle className="h-5 w-5 fill-white" />
      {text}
    </motion.a>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans selection:bg-green-100 selection:text-green-900">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-16"
      >
        {/* 1. HERO SECTION */}
        <motion.section variants={itemVariants} className="text-center space-y-8 pt-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Meesho Growth Engine</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight font-display">
            Meesho Pe Sales Nahi Aa Rahi? <br />
            <span className="text-blue-600">Shipping Kharcha Kam Karo! 🚚</span>
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Shipping charges zyada hone ki wajah se orders nahi mil rahe? Hamara AI tool aapke product ka weight aur packaging optimize karega aur SEO listings se orders 10x badhayega! 🚀
          </p>

          <div className="flex flex-col items-center gap-6">
            <WhatsAppButton />
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 animate-pulse">
                🔥 Offer Ends In: 🔥
              </p>
              <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl">
                <CountdownTimer />
              </div>
            </div>
          </div>
        </motion.section>

        {/* NEW: AI DEMO ANIMATION SECTION */}
        <motion.section variants={itemVariants} className="space-y-12 px-4 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-display">
              Watch AI Create Your <span className="text-blue-600">Listing</span>
            </h2>
            <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
              Real-time demo — no signup needed. See how ListingAI transforms product images into marketplace-ready listings.
            </p>
          </div>
          
          <AIDemoAnimation />
        </motion.section>

        {/* NEW: PROBLEM & SOLUTION SECTION */}
        <motion.section variants={itemVariants} className="space-y-16 px-4 py-10">
          <div className="text-center space-y-4">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Problem & Solution</p>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-display">
              Listing Creation <span className="text-blue-600">Slows Down Growth</span>
            </h2>
            <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
              Manual listing creation takes time, requires keyword research, and often results in poor marketplace visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-12 border border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-[100px] -mr-16 -mt-16 opacity-10"></div>
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                The Seller's Struggle
              </h3>
              <div className="space-y-6">
                {[
                  "Writing SEO-friendly titles and descriptions manually",
                  "Understanding each platform's specific content requirements",
                  "Maintaining listing quality and consistency at scale",
                  "Spending excessive time on repetitive cataloging work"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[100px] -mr-16 -mt-16 opacity-10"></div>
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                The ListingAI Edge
              </h3>
              <div className="space-y-6">
                {[
                  "SEO-optimized titles tailored per marketplace",
                  "Platform-compliant bullet points and descriptions",
                  "Keyword-rich content generated automatically",
                  "Category and tag suggestions included"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. PROBLEM SECTION */}
        <motion.section variants={itemVariants} className="bg-red-50 rounded-[3rem] p-10 md:p-16 border border-red-100">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 text-center font-display">
            Kya Aapka Profit Shipping Mein Ja Raha Hai? 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "High Shipping Cost", desc: "Weight zyada hone ki wajah se shipping charges profit kha rahe hain." },
              { icon: Search, title: "Low Visibility", desc: "Aapki listing Meesho search mein upar nahi aa rahi? SEO ki kami hai." },
              { icon: BarChart3, title: "High RTO Rates", desc: "Galat packaging aur description ki wajah se returns zyada aa rahe hain." }
            ].map((p, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                  <p.icon className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900">{p.title}</h4>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-red-600 font-bold italic">
            "Meesho pe wahi jeet-ta hai jiska shipping rate sabse kam aur SEO sabse best hota hai!"
          </p>
        </motion.section>

        {/* 3. SOLUTION SECTION */}
        <motion.section variants={itemVariants} className="text-center space-y-8 px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-display">
            ListingAI: Meesho Sellers Ka Secret Weapon ⚡
          </h2>
          <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Hamara AI tool aapke product ka perfect weight calculate karta hai aur aisi SEO optimized listing banata hai jo Meesho algorithm ko pasand aaye. Kam shipping = More Orders!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white text-left space-y-4 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <Package className="h-10 w-10 text-blue-200" />
              <h4 className="text-xl font-black">Low Shipping Tool</h4>
              <p className="text-sm font-medium text-blue-100 leading-relaxed">
                Packaging optimize karke weight category kam karein aur shipping charges pe 30-40% bachayein.
              </p>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-left space-y-4 shadow-xl relative overflow-hidden border-2 border-emerald-500/30 group">
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-bounce">
                Most Popular 🔥
              </div>
              <FileText className="h-10 w-10 text-emerald-400" />
              <h4 className="text-xl font-black text-emerald-400">SEO Listing Generator</h4>
              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                Aise keywords jo Meesho pe search hote hain. Title aur description jo customer ko click karne pe majboor karde.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <ArrowUpRight className="h-4 w-4" />
                Boost Search Rank Instantly
              </div>
            </div>
          </div>
        </motion.section>

        {/* NEW: GROWTH VISUALIZATION SECTION */}
        <motion.section variants={itemVariants} className="space-y-10 px-4">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-2xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-display">Orders Growth Dekhiye! 📈</h2>
              <p className="text-lg font-medium text-slate-500">SEO Listing update karne ke baad orders aise badhte hain.</p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                    itemStyle={{color: '#2563eb', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase'}}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 text-center">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Search Visibility</p>
                <p className="text-3xl font-black text-slate-900">+450%</p>
              </div>
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Order Conversion</p>
                <p className="text-3xl font-black text-slate-900">+120%</p>
              </div>
              <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100 text-center">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">RTO Reduction</p>
                <p className="text-3xl font-black text-slate-900">-35%</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. COMPARISON SECTION */}
        <motion.section variants={itemVariants} className="space-y-10 px-4">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display">Meesho Success Comparison 📊</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Before vs After ListingAI</p>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="grid grid-cols-2 text-center">
              <div className="p-8 bg-slate-50 border-r border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Without Us</p>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-red-500">High Shipping: ₹80+</p>
                  <p className="text-sm font-bold text-red-500">Search Rank: Page 10+</p>
                  <p className="text-sm font-bold text-red-500">Orders: 2-3 Per Day</p>
                </div>
              </div>
              <div className="p-8 bg-emerald-50">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">With ListingAI</p>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-emerald-600">Low Shipping: ₹45-50</p>
                  <p className="text-sm font-bold text-emerald-600">Search Rank: Top 5</p>
                  <p className="text-sm font-bold text-emerald-600">Orders: 50+ Per Day</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. HOW IT WORKS */}
        <motion.section variants={itemVariants} className="bg-slate-900 rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20"></div>
          <h2 className="text-3xl font-black mb-12 text-center font-display">3 Simple Steps To Success 🚀</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              { step: "01", icon: Package, title: "Optimize Weight", desc: "Product details dalein aur lowest shipping category payein." },
              { step: "02", icon: Search, title: "Generate SEO", desc: "AI se Meesho-friendly title aur description banayein." },
              { step: "03", icon: TrendingUp, title: "Scale Orders", desc: "Listing update karein aur orders aate hue dekhein." }
            ].map((s, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto text-blue-400">
                  <s.icon className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{s.step}</span>
                <h4 className="text-xl font-black">{s.title}</h4>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. BENEFITS */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 font-display">Meesho Sellers Ke Liye Best Kyun? 💎</h2>
            <div className="space-y-6">
              {[
                "Lowest Shipping Rates - Har order pe ₹30-40 bachao",
                "High Search Visibility - Listing hamesha top pe rahegi",
                "Zero Technical Knowledge - Sab kuch AI automatic karega",
                "More Profit - Kam kharcha, zyada orders = Huge Profit"
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">{b}</p>
                </div>
              ))}
            </div>
            <WhatsAppButton />
          </div>
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 flex items-center justify-center">
            <Truck className="h-40 w-40 text-blue-100" />
          </div>
        </motion.section>

        {/* 7. SOCIAL PROOF */}
        <motion.section variants={itemVariants} className="text-center space-y-12 px-4">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 font-display">500+ Meesho Sellers Are Growing! 🤝</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-500" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: "Amit", role: "Meesho Gold Seller", text: "Pehle shipping charges ki wajah se margin nahi tha. ListingAI ne weight optimize kiya aur ab har order pe ₹35 extra bach rahe hain!" },
              { name: "Suresh", role: "New Seller", text: "SEO listing generator kamaal hai. 2 din mein hi orders aana shuru ho gaye. Best tool for Meesho!" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left space-y-4">
                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{t.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 8. URGENCY SECTION */}
        <motion.section variants={itemVariants} className="bg-orange-500 rounded-[3rem] p-12 text-center text-white space-y-8 shadow-2xl shadow-orange-500/20">
          <div className="space-y-4">
            <h2 className="text-3xl font-black font-display">Special Meesho Offer! ⏳</h2>
            <p className="text-lg font-bold text-orange-100">
              Join the elite group of Meesho sellers. <br />
              Get Lifetime Access at 70% OFF. Only for today!
            </p>
          </div>
          
          <CountdownTimer />

          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
              <span className="text-2xl font-black">12</span>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Spots Left</p>
            </div>
          </div>
        </motion.section>

        {/* 9. FINAL CTA */}
        <motion.section variants={itemVariants} className="text-center space-y-10 px-4">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-display leading-tight">
              Ready To Dominate <br />
              Meesho Search? 🚀
            </h2>
            <p className="text-lg font-medium text-slate-500">
              Abhi WhatsApp karein aur apna free demo lein!
            </p>
          </div>
          <div className="flex flex-col items-center gap-6">
            <WhatsAppButton text="Send 'DEMO' on WhatsApp now" className="w-full max-w-md h-20 text-lg" />
            <div className="flex items-center gap-4 text-slate-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Trusted by 500+ Meesho Sellers</span>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center pt-10 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
            © 2026 ListingAI Meesho Optimizer. All Rights Reserved.
          </p>
        </footer>
      </motion.div>
    </div>
  );
}

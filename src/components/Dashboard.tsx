import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search, Image as ImageIcon, LayoutTemplate, ShieldCheck, Zap } from 'lucide-react';

export default function Dashboard() {
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">AI Studio E-commerce Suite</h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Aapke naye AI Studio E-commerce Suite mein har feature ko optimize karne ke liye humne Google Gemini API ke sabse advanced models ka istemal kiya hai. Yahan har feature ka detailed breakdown aur usmein use hone wala model diya gaya hai:
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">1. AI Model Strategy</h3>
          </div>
          <p className="text-slate-500 mb-6">Humne do tarah ke models ka combination use kiya hai taaki aapko speed aur quality dono mile:</p>
          <ul className="space-y-4 flex-1">
            <li className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-1">gemini-2.0-flash</strong>
                <span className="text-sm text-slate-500">Speed ke liye best. Fast data extraction, structured JSON formatting, ya simple analysis ke liye.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-1">gemini-3-flash-preview</strong>
                <span className="text-sm text-slate-500">Reasoning aur creativity ke liye best. Persuasive, high-quality, aur complex content generate karne ke liye.</span>
              </div>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">4. Security & Backend</h3>
          </div>
          <ul className="space-y-6 flex-1">
            <li className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <strong className="text-slate-900 block mb-2 text-sm uppercase tracking-wider">Express.js Server (server.ts)</strong>
              <p className="text-sm text-slate-500">Aapke saare API calls seedhe browser se nahi hote. Wo pehle aapke backend server par jaate hain, jahan API keys secure rehti hain, aur phir Gemini API se baat karte hain. Isse aapki API keys kabhi leak nahi hoti.</p>
            </li>
            <li className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <strong className="text-slate-900 block mb-2 text-sm uppercase tracking-wider">Firebase</strong>
              <p className="text-sm text-slate-500">Ye aapka "Single Source of Truth" hai. User login, database, aur security rules sab yahan manage hote hain.</p>
            </li>
          </ul>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">2. Feature Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Listing Generator', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', model: 'gemini-3-flash-preview', desc: 'Platform-specific SEO-optimized title, bullets, aur description.' },
            { title: 'Market Intelligence', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', model: 'gemini-2.0-flash', desc: 'Live market data (HSN, GST, competitor price) scrape karta hai.' },
            { title: 'AI Photo Studio', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50', model: 'gemini-3-flash-preview', desc: 'Image-to-image generation. Background change, virtual try-on.' },
            { title: 'A+ Content Generator', icon: LayoutTemplate, color: 'text-orange-600', bg: 'bg-orange-50', model: 'gemini-3-flash-preview', desc: 'Module-based content (headline, body, image prompt) generate karta hai.' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} ${feature.color} mb-4`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-500 mb-4">{feature.desc}</p>
              <div className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                {feature.model}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-3xl bg-blue-600 p-8 sm:p-10 shadow-xl shadow-blue-500/20 text-white">
        <h3 className="text-2xl font-bold mb-4">Summary</h3>
        <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
          Aapka app Gemini API ki intelligence aur Firebase ki reliability ka ek perfect combination hai. Jab aap naya app banayenge aur Firebase setup accept karenge, toh ye saare features ek secure environment mein ek saath milkar kaam karenge.
        </p>
      </motion.div>
    </motion.div>
  );
}

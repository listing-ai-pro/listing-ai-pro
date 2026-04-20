import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Auth from './Auth';
import JDChatbot from './JDChatbot';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Landing Header */}
      <header className="fixed top-0 left-0 right-0 h-20 lg:h-24 bg-slate-950/50 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl lg:rounded-[1.25rem] bg-blue-600 text-white shadow-2xl shadow-blue-600/20">
            <Sparkles className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-white leading-none font-display">ListingAI</h2>
            <p className="text-[8px] lg:text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase mt-1">Enterprise</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={() => setShowAuth(true)}
            className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>
          <button 
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-2 px-5 lg:px-8 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl bg-white text-slate-900 font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-white/10 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Sign Up Free
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 lg:pt-24">
        <Dashboard />
      </main>

      {/* JD Chatbot */}
      <JDChatbot user={undefined} />

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuth && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowAuth(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg"
            >
              <Auth />
              <button 
                onClick={() => setShowAuth(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

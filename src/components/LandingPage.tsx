import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Auth from './Auth';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Landing Header */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 md:px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none font-display">ListingAI</h2>
            <p className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase mt-1">Enterprise</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAuth(true)}
            className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>
          <button 
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Sign Up Free
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        <Dashboard />
      </main>

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

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CreditCard, X } from 'lucide-react';
import { trackCustom } from '../lib/pixel';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  user: any;
}

export default function TrialExpiredModal({ isOpen, onClose, onUpgrade, user }: TrialExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-10 text-center space-y-8">
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-600 shadow-xl shadow-red-500/10">
              <AlertCircle className="h-10 w-10" />
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-black text-slate-900 font-display">Trial Plan is Over! 🛑</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Aapka 7 days ka free trial khatam ho gaya hai. ListingAI ke tools use karne ke liye please paid plan buy karein.
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={() => {
                  trackCustom('UpgradeClick', { location: 'Trial Expired Modal', userEmail: user.email });
                  onUpgrade();
                  onClose();
                }}
                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Buy Paid Plan Now
              </button>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Scale your business with AI precision
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

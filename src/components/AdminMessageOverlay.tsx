import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, X, Info } from 'lucide-react';

export default function AdminMessageOverlay({ user }: { user: any }) {
  const [activeMessage, setActiveMessage] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Query for active messages
    const q = query(
      collection(db, 'AdminMsg'),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const msg = { id: snapshot.docs[0].id, ...data } as any;
        
        // Check if message is targeted to this user
        const isTargeted = 
          msg.target === 'ALL' || 
          (msg.target === 'PRO' && user.subscriptionPlan === 'pro' && user.activePlanId !== 'trial') ||
          (msg.target === 'TRIAL' && user.activePlanId === 'trial');

        if (isTargeted) {
          setActiveMessage(msg);
          setDismissed(false); // Reset dismissal for new messages
        } else {
          setActiveMessage(null);
        }
      } else {
        setActiveMessage(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!activeMessage || dismissed) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative"
        >
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] -mr-32 -mt-32 opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] -ml-32 -mb-32 opacity-10"></div>

          <div className="p-10 relative space-y-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-bounce">
                <Bell className="h-10 w-10" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                <Info className="h-3 w-3" />
                Admin Announcement
              </div>
              <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight leading-tight">
                Important Update!
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-600 text-sm font-bold leading-relaxed whitespace-pre-wrap">
                  {activeMessage.content}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              I Understand
            </button>
            
            <button 
              onClick={() => setDismissed(true)}
              className="absolute top-6 right-6 h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

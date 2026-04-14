import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          subscriptionPlan: 'free',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[480px] rounded-[3.5rem] bg-white p-12 lg:p-16 shadow-2xl border border-slate-100 text-center relative mx-auto"
    >
      <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
        <Sparkles className="h-10 w-10" />
      </div>
      
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">ListingAI</h1>
        <p className="text-base font-medium text-slate-500 leading-relaxed">
          The enterprise-grade AI engine for modern marketplace sellers.
        </p>
      </div>
      
      <div className="space-y-6">
        <button
          onClick={handleLogin}
          className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl bg-slate-900 px-8 font-black text-xs uppercase tracking-[0.2em] text-white hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group"
        >
          <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
        
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Secure Access</span>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy. Your data is protected by enterprise-grade encryption.
        </p>
      </div>

      {/* Floating Accents */}
      <div className="absolute -bottom-6 -left-6 h-24 w-24 bg-blue-50 rounded-full blur-2xl opacity-50"></div>
      <div className="absolute -top-6 -right-6 h-20 w-20 bg-purple-50 rounded-full blur-2xl opacity-50"></div>
    </motion.div>
  );
}

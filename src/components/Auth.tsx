import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { authPromise } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { dbPromise } from '../firebase';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      const auth = await authPromise;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const db = await dbPromise;
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
        <p className="mb-8 text-slate-500">Sign in to access your AI E-commerce Suite</p>
        
        <button
          onClick={handleLogin}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 font-medium text-white hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
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
      </motion.div>
    </div>
  );
}

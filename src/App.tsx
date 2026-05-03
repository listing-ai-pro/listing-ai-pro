/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import { initPixel } from './lib/pixel';
import { ShieldAlert, Globe, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for Domain Authorization
    const checkDomain = async () => {
      try {
        const domainRef = doc(db, 'settings', 'authorized_domains');
        const snap = await getDoc(domainRef);
        
        if (snap.exists()) {
          const authorizedDomains = snap.data().domains || [];
          const currentHostname = window.location.hostname;
          
          // If the list is empty, allow for initial setup
          if (authorizedDomains.length === 0) {
            setIsAuthorized(true);
            return;
          }

          // Check if current domain is authorized
          const authorized = authorizedDomains.some((d: string) => 
            currentHostname === d || currentHostname.endsWith('.' + d)
          );
          
          setIsAuthorized(authorized);
        } else {
          // If no setting exists, allow all (initial state)
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Domain check failed:", error);
        // On error, let it pass to avoid blocking legitimate users due to network issues
        setIsAuthorized(true);
      }
    };

    checkDomain();

    // Initialize Facebook Pixel
    initPixel();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data());
        } else {
          // Profile might not exist yet if it's a new user
          // Auth component handles creation, but we should handle the transition
          setUserProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [user]);

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 rounded-[3rem] border border-red-500/30 p-12 text-center relative overflow-hidden shadow-2xl shadow-red-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
          <div className="relative z-10 space-y-8">
            <div className="h-20 w-20 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight">Access Restricted</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                This application instance is not authorized to run on <span className="text-white font-bold">{window.location.hostname}</span>. 
                Unauthorized remixes or distributions are blocked.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 w-full">
                <Globe className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-black text-white uppercase tracking-widest">{window.location.hostname}</span>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">Blocked</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Powered by ListingAI Security</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.3)]"></div>
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80 font-mono">Mission: Initialize</p>
            <h4 className="text-xl font-black text-white font-display">ListingAI</h4>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // If user is logged in but profile doesn't exist yet, show a small loading state
  // or wait for Auth component to finish its work. 
  // Usually Auth component redirects/updates state.
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(79,70,229,0.3)]"></div>
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/80 font-mono">Syncing Profile</p>
            <h4 className="text-xl font-black text-white font-display">ListingAI</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={{ ...user, ...userProfile }}>
      <div />
    </Layout>
  );
}

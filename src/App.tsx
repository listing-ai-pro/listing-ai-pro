/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import { initPixel } from './lib/pixel';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

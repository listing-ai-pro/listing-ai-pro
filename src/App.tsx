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
      <div className="flex min-h-screen items-center justify-center bg-[#fcfdfe]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Initializing ListingAI</p>
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
      <div className="flex min-h-screen items-center justify-center bg-[#fcfdfe]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Setting up your profile...</p>
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

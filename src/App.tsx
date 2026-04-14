/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { authPromise } from './firebase';
import Auth from './components/Auth';
import Layout from './components/Layout';

const AUTHORIZED_DOMAINS = ['localhost', '127.0.0.1', 'ais-dev-f3cymepfhmrkugch3kw2nr-104108217777.asia-east1.run.app', 'ais-pre-f3cymepfhmrkugch3kw2nr-104108217777.asia-east1.run.app'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorizedDomain, setIsAuthorizedDomain] = useState(true);

  useEffect(() => {
    const currentDomain = window.location.hostname;
    if (!AUTHORIZED_DOMAINS.includes(currentDomain) && !currentDomain.endsWith('.run.app')) {
      setIsAuthorizedDomain(false);
      setLoading(false);
      return;
    }

    async function initAuth() {
      const auth = await authPromise;
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    }
    initAuth();
  }, []);

  if (!isAuthorizedDomain) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">This application is not authorized to run on this domain.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout user={user}>
      {/* Content is managed by Layout component */}
      <div />
    </Layout>
  );
}

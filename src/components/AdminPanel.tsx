import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { dbPromise, authPromise } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion } from 'motion/react';
import { Settings, BarChart3, Key, Loader2, FileText, Image as ImageIcon, Search, BookOpen } from 'lucide-react';

export default function AdminPanel({ user }: { user: any }) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const path = `users/${user.uid}/daily_stats`;
      try {
        const db = await dbPromise;
        const q = query(collection(db, path), limit(10));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStats(data);
      } catch (error) {
        const auth = await authPromise;
        handleFirestoreError(error, OperationType.LIST, path, auth);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  // Calculate totals
  const totals = stats.reduce((acc, curr) => ({
    listings: acc.listings + (curr.listingsGenerated || 0),
    images: acc.images + (curr.imagesGenerated || 0),
    market: acc.market + (curr.marketAnalysis || 0),
    aplus: acc.aplus + (curr.aplusGenerated || 0)
  }), { listings: 0, images: 0, market: 0, aplus: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="p-8 rounded-[2.5rem] bg-white border border-neutral-200 shadow-xl">
        <div className="mb-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-neutral-400" />
            Admin Panel
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Manage settings and view usage statistics</p>
        </div>
        
        <div className="space-y-12">
          {/* Stats Overview */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Global Statistics Overview
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center p-12 bg-neutral-50 rounded-3xl border border-neutral-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Listings</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{totals.listings}</div>
                </div>
                <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Images</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{totals.images}</div>
                </div>
                <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <Search className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Market Analyses</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{totals.market}</div>
                </div>
                <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">A+ Modules</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{totals.aplus}</div>
                </div>
              </div>
            )}

            {/* Detailed Table */}
            {!loading && stats.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse divide-y divide-neutral-100">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Listings</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Images</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Market Analysis</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">A+ Content</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      {stats.map((stat, idx) => (
                        <tr key={stat.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{stat.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-mono">{stat.listingsGenerated || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-mono">{stat.imagesGenerated || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-mono">{stat.marketAnalysis || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-mono">{stat.aplusGenerated || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {!loading && stats.length === 0 && (
              <div className="text-center bg-neutral-50 p-8 rounded-3xl border border-neutral-100">
                <p className="text-neutral-500 font-medium">No usage data found yet. Start generating content to see stats.</p>
              </div>
            )}
          </div>

          {/* Access Control */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-600" />
              Access Control
            </h3>
            <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 flex flex-col items-center text-center">
              <p className="text-sm font-medium text-neutral-600 mb-6">Manage access codes for restricted features.</p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <input
                  type="text"
                  placeholder="Enter new access code"
                  className="flex-1 rounded-2xl border-2 border-neutral-200 px-6 py-4 text-slate-900 placeholder-neutral-400 focus:border-blue-600 focus:ring-0 transition-all outline-none font-medium text-center sm:text-left"
                />
                <button className="px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10 bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 whitespace-nowrap">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { 
  collection, getDocs, query, orderBy, where, Timestamp, 
  doc, updateDoc, serverTimestamp, addDoc, collectionGroup 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Settings, BarChart3, Key, Loader2, FileText, Image as ImageIcon, 
  Search, BookOpen, Users, RotateCcw, Download, Edit3, 
  Clock, UserX, CheckCircle2, Filter, ChevronRight, MoreHorizontal, Zap, MessageCircle, TrendingUp
} from 'lucide-react';

export default function AdminPanel({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ANALYTICS' | 'SETTINGS' | 'MESSAGES'>('USERS');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED'>('ALL');
  
  // Message state
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'PRO' | 'TRIAL'>('ALL');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Plan Management state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [todayStats, setTodayStats] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const path = 'users';
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Calculate status and expiry
          let status = 'EXPIRED';
          let expiryDate = 'N/A';
          
          if (data.subscriptionPlan === 'pro' && data.subscriptionDate) {
            const subDate = data.subscriptionDate instanceof Timestamp 
              ? data.subscriptionDate.toDate() 
              : new Date(data.subscriptionDate.seconds * 1000);
              
            const now = new Date();
            const diffInMs = now.getTime() - subDate.getTime();
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            let durationDays = 0;
            switch (data.activePlanId) {
              case 'trial': durationDays = 7; break;
              case 'max': durationDays = 3; break;
              case 'monthly': durationDays = 30; break;
              case 'half-yearly': durationDays = 180; break;
              case 'yearly': durationDays = 365; break;
            }

            status = diffInDays <= durationDays ? 'ACTIVE' : 'EXPIRED';
            const expiry = new Date(subDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            expiryDate = expiry.toLocaleDateString();
          }

          return { 
            id: doc.id, 
            ...data,
            status,
            usage: data.usage_listingsGenerated || 0,
            expiryDate
          };
        });
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
        // handleFirestoreError(error, OperationType.LIST, path, auth);
      } finally {
        setLoading(false);
      }
    }
    if (activeTab === 'USERS' || activeTab === 'ANALYTICS') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchTodayStats() {
      const today = new Date().toISOString().split('T')[0];
      try {
        const q = query(collectionGroup(db, 'daily_stats'), where('date', '==', today));
        const querySnapshot = await getDocs(q);
        const stats = querySnapshot.docs.map(doc => doc.data());
        setTodayStats(stats);
      } catch (error) {
        console.error("Error fetching today's stats:", error);
      }
    }
    if (activeTab === 'ANALYTICS') {
      fetchTodayStats();
    }
  }, [activeTab]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    expired: users.filter(u => u.status === 'EXPIRED').length,
    blocked: users.filter(u => u.status === 'BLOCKED').length,
    today: users.filter(u => {
      if (!u.createdAt) return false;
      const date = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
      return date.toDateString() === new Date().toDateString();
    }).length
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.sellerId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'ALL' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleResetTrial = async (userId: string) => {
    setUpdatingPlan(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        hasUsedTrial: false,
        subscriptionPlan: 'free',
        activePlanId: 'free',
        subscriptionDate: null
      });
      setEditingUser(null);
      // Refresh users list
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, hasUsedTrial: false, subscriptionPlan: 'free', activePlanId: 'free' } : u
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error resetting trial:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`, auth);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleUpdatePlan = async (userId: string, plan: 'free' | 'pro', planId: string) => {
    setUpdatingPlan(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscriptionPlan: plan,
        activePlanId: planId,
        subscriptionDate: plan === 'pro' ? serverTimestamp() : null
      });
      setEditingUser(null);
      // Refresh users list
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, subscriptionPlan: plan, activePlanId: planId } : u
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error updating plan:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`, auth);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSendingMessage(true);
    try {
      await addDoc(collection(db, 'AdminMsg'), {
        content: message,
        target: targetAudience,
        active: true,
        createdAt: serverTimestamp()
      });
      setMessageSuccess(true);
      setMessage('');
      setTimeout(() => setMessageSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      handleFirestoreError(error, OperationType.CREATE, 'AdminMsg', auth);
    } finally {
      setSendingMessage(false);
    }
  };

  const renderMessagesTab = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 font-display">Broadcast Message 📢</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Send a notification to your users</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Audience</label>
            <div className="flex gap-3">
              {(['ALL', 'PRO', 'TRIAL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetAudience(t)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    targetAudience === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {t === 'ALL' ? 'All Users' : t === 'PRO' ? 'Pro Members' : 'Trial Users'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your announcement here..."
              className="w-full h-40 p-6 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={sendingMessage || !message.trim()}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
              sendingMessage || !message.trim() ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl'
            }`}
          >
            {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {sendingMessage ? 'Sending...' : 'Broadcast Message'}
          </button>

          {messageSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-center text-[10px] font-black uppercase tracking-widest"
            >
              Message sent successfully to {targetAudience === 'ALL' ? 'everyone' : targetAudience.toLowerCase() + ' users'}!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl lg:text-3xl font-black text-slate-900 font-display">User Management</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitor and control user access</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button className="w-full sm:w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm">
            <RotateCcw className="h-5 w-5" />
          </button>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL USERS', value: stats.total, sub: `+${stats.today} today`, icon: Users, color: 'blue', subColor: 'text-blue-600' },
          { label: 'ACTIVE PLANS', value: stats.active, sub: `${Math.round((stats.active/stats.total)*100 || 0)}% conversion`, icon: CheckCircle2, color: 'emerald', subColor: 'text-emerald-600' },
          { label: 'EXPIRED', value: stats.expired, sub: 'Needs attention', icon: Clock, color: 'orange', subColor: 'text-orange-600' },
          { label: 'BLOCKED', value: stats.blocked, sub: 'Restricted access', icon: UserX, color: 'red', subColor: 'text-red-600' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`h-14 w-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600`}>
              <s.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-display">{s.value}</span>
              </div>
              <p className={`text-[10px] font-bold ${s.subColor} mt-1`}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-4 lg:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {(['ALL', 'ACTIVE', 'EXPIRED', 'BLOCKED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-6 text-left">User Profile</th>
                <th className="px-8 py-6 text-left">Subscription</th>
                <th className="px-8 py-6 text-left">Last Active</th>
                <th className="px-8 py-6 text-left">Total Usage</th>
                <th className="px-8 py-6 text-left">Expiry</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No users found</p>
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm border border-slate-200">
                        {u.displayName ? u.displayName.substring(0, 1).toUpperCase() : u.email.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{u.displayName || 'Anonymous User'}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                          <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{u.sellerId || 'NO-ID'}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      u.subscriptionPlan === 'pro' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Zap className="h-3 w-3" />
                      {u.subscriptionPlan === 'pro' 
                        ? (u.activePlanId === 'trial' ? 'TRIAL' : 
                           u.activePlanId === 'max' ? 'MAX' :
                           u.activePlanId === 'monthly' ? '1 MONTH' :
                           u.activePlanId === 'half-yearly' ? '6 MONTH' :
                           u.activePlanId === 'yearly' ? '1 YEAR' : 'PRO')
                        : 'NO PLAN'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold">
                          {u.lastActive 
                            ? (u.lastActive.toDate ? u.lastActive.toDate().toLocaleDateString() : new Date(u.lastActive).toLocaleDateString())
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</span>
                        <span className="text-[9px] font-black text-slate-900">{u.totalUsage || 0}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((u.totalUsage || 0) / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold">{u.expiryDate}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-orange-600'
                      }`}>
                        • {u.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setEditingUser(u)}
                      className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all ml-auto"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => {
    const usageData = [
      { name: 'Listings', value: users.reduce((acc, u) => acc + (u.usage_listingsGenerated || 0), 0) },
      { name: 'Backgrounds', value: users.reduce((acc, u) => acc + (u.usage_whiteBackgrounds || 0), 0) },
      { name: 'Market', value: users.reduce((acc, u) => acc + (u.usage_marketAnalysis || 0), 0) },
      { name: 'A+ Content', value: users.reduce((acc, u) => acc + (u.usage_aplusGenerated || 0), 0) },
      { name: 'Photoshoots', value: users.reduce((acc, u) => acc + (u.usage_photoshoots || 0), 0) },
      { name: 'Logistics', value: users.reduce((acc, u) => acc + (u.usage_shippingOptimizations || 0), 0) },
    ];

    const planDistribution = [
      { name: 'Trial', count: users.filter(u => u.activePlanId === 'trial').length },
      { name: 'Monthly', count: users.filter(u => u.activePlanId === 'monthly').length },
      { name: '6 Months', count: users.filter(u => u.activePlanId === 'half-yearly').length },
      { name: 'Yearly', count: users.filter(u => u.activePlanId === 'yearly').length },
      { name: 'Max', count: users.filter(u => u.activePlanId === 'max').length },
    ];

    const mostActive = [...users].sort((a, b) => (b.totalUsage || 0) - (a.totalUsage || 0)).slice(0, 5);

    return (
      <div className="space-y-12">
        {/* Growth Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
            <h4 className="text-xl font-black text-slate-900 font-display mb-8">Usage Distribution</h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
            <h4 className="text-xl font-black text-slate-900 font-display mb-8">Plan Distribution</h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {planDistribution.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Most Active Users & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black text-slate-900 font-display">Most Active Users</h4>
                <p className="text-xs font-medium text-slate-400 mt-1">Users with highest platform engagement</p>
              </div>
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            
            <div className="space-y-4">
              {mostActive.map((u, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-50 transition-all hover:border-blue-100 hover:bg-blue-50/10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-blue-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{u.displayName || u.email.split('@')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.sellerId || 'No ID'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">{u.totalUsage || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</p>
                  </div>
                </div>
              ))}
              {mostActive.length === 0 && (
                <p className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest">No activity data yet</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden border border-slate-800">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] -mr-16 -mt-16 opacity-20"></div>
               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Today's Listings (Free)</h4>
               <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black font-display text-white">
                    {todayStats.filter(s => users.find(u => u.id === s.userId)?.activePlanId === 'trial').reduce((acc, s) => acc + (s.listingsGenerated || 0), 0)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ {users.filter(u => u.activePlanId === 'trial').length * 3} Capacity</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-600 transition-all duration-500"
                   style={{ 
                     width: `${Math.min(100, (todayStats.filter(s => users.find(u => u.id === s.userId)?.activePlanId === 'trial').reduce((acc, s) => acc + (s.listingsGenerated || 0), 0) / (users.filter(u => u.activePlanId === 'trial').length * 3 || 1)) * 100)}%` 
                   }}
                 ></div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden border border-slate-800">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 rounded-full blur-[60px] -mr-16 -mt-16 opacity-10"></div>
               <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6">Today's Backgrounds (Free)</h4>
               <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black font-display text-white">
                    {todayStats.filter(s => users.find(u => u.id === s.userId)?.activePlanId === 'trial').reduce((acc, s) => acc + (s.whiteBackgrounds || 0), 0)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ {users.filter(u => u.activePlanId === 'trial').length * 2} Capacity</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-600 transition-all duration-500"
                   style={{ 
                     width: `${Math.min(100, (todayStats.filter(s => users.find(u => u.id === s.userId)?.activePlanId === 'trial').reduce((acc, s) => acc + (s.whiteBackgrounds || 0), 0) / (users.filter(u => u.activePlanId === 'trial').length * 2 || 1)) * 100)}%` 
                   }}
                 ></div>
               </div>
            </div>

            <div className="bg-slate-950 rounded-[3rem] p-8 text-white relative overflow-hidden flex-1 border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] -mr-16 -mt-16 opacity-20"></div>
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">System Health</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Database Status</span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Trial Users Active</span>
                  <span className="text-[9px] font-black uppercase text-blue-400">{users.filter(u => u.activePlanId === 'trial').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Limits Reset In</span>
                  <span className="text-[9px] font-black uppercase text-amber-400">
                    {Math.max(0, 24 - new Date().getUTCHours())}h
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[3rem] p-8 text-white shadow-xl shadow-blue-600/20">
              <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">Free Tier Status</h4>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black font-display">
                  {Math.round((todayStats.filter(s => users.find(u => u.id === s.userId)?.activePlanId === 'trial').length / (users.filter(u => u.activePlanId === 'trial').length || 1)) * 100)}%
                </span>
                <span className="text-[10px] font-bold text-blue-200">Active Daily</span>
              </div>
              <p className="text-[10px] font-medium text-blue-100 leading-relaxed opacity-80">
                Daily limits: 3 Listings, 2 BG Removes, 3 Analysis. Resets every 24h.
              </p>
            </div>
          </div>
        </div>

        {/* System Health Section (Original Wide Section) */}
        <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] -mr-48 -mt-48 opacity-20"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mb-6">
                <Zap className="h-3 w-3" />
                System Intelligence
              </div>
              <h3 className="text-3xl font-black font-display mb-4">India's Fastest AI Growth Engine</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Platform is currently scaling at {(stats.active/stats.total*100 || 0).toFixed(1)}% conversion rate. Monitor real-time conversion and churn metrics.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-8 py-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 font-display">MAU</p>
                <p className="text-3xl font-black">{stats.active}</p>
              </div>
              <div className="px-8 py-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 font-display">Retention</p>
                <p className="text-3xl font-black">94%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm w-fit mx-auto">
        {(['USERS', 'ANALYTICS', 'MESSAGES', 'SETTINGS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab === 'USERS' && <Users className="h-4 w-4" />}
            {tab === 'ANALYTICS' && <BarChart3 className="h-4 w-4" />}
            {tab === 'MESSAGES' && <MessageCircle className="h-4 w-4" />}
            {tab === 'SETTINGS' && <Settings className="h-4 w-4" />}
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'USERS' && renderUsersTab()}
          {activeTab === 'MESSAGES' && renderMessagesTab()}
          {activeTab === 'ANALYTICS' && renderAnalyticsTab()}
          {activeTab === 'SETTINGS' && (
            <div className="p-20 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-xl">
              <Settings className="h-16 w-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-900 font-display">System Settings</h3>
              <p className="text-sm font-medium text-slate-400 mt-2">Platform-wide configuration and security protocols.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Plan Management Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 font-display">Manage Subscription</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Update plan for {editingUser.displayName || editingUser.email}</p>
                  </div>
                  <button 
                    onClick={() => setEditingUser(null)}
                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <RotateCcw className="h-4 w-4 rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'trial', name: 'Free Trial (7 Days)', plan: 'pro', planId: 'trial', color: 'bg-blue-50 text-blue-600' },
                    { id: 'max', name: 'ListingAI Max (3 Days)', plan: 'pro', planId: 'max', color: 'bg-rose-50 text-rose-600' },
                    { id: 'monthly', name: '1 Month Pro (30 Days)', plan: 'pro', planId: 'monthly', color: 'bg-indigo-50 text-indigo-600' },
                    { id: 'half-yearly', name: '6 Month Pro (180 Days)', plan: 'pro', planId: 'half-yearly', color: 'bg-purple-50 text-purple-600' },
                    { id: 'yearly', name: '1 Year Pro (365 Days)', plan: 'pro', planId: 'yearly', color: 'bg-amber-50 text-amber-600' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleUpdatePlan(editingUser.id, p.plan as any, p.planId)}
                      disabled={updatingPlan}
                      className={`flex items-center justify-between p-6 rounded-2xl border transition-all group ${
                        editingUser.activePlanId === p.id 
                          ? 'border-blue-600 bg-blue-50/30' 
                          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${p.color}`}>
                          <Zap className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-black text-slate-900">{p.name}</span>
                      </div>
                      {editingUser.activePlanId === p.id ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      )}
                    </button>
                  ))}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleResetTrial(editingUser.id)}
                      disabled={updatingPlan}
                      className="w-full py-4 rounded-2xl bg-orange-50 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Trial Status
                    </button>
                  </div>
                </div>

                {updatingPlan && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Updating Plan...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

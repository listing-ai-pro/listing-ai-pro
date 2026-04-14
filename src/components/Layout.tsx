import React, { useState } from 'react';
import { LayoutDashboard, Image as ImageIcon, Search, Camera, Zap, BookOpen, CreditCard, ShieldCheck, User, Edit2, LogOut, MessageCircle, Monitor, RefreshCw, Maximize, FileText, Sparkles } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import ListingGenerator from './ListingGenerator';
import MarketIntelligence from './MarketIntelligence';
import AIPhotoStudio from './AIPhotoStudio';
import WhiteBackground from './WhiteBackground';
import Dashboard from './Dashboard';
import APlusContentGenerator from './APlusContentGenerator';
import AdminPanel from './AdminPanel';
import MeeshoShippingOptimizer from './MeeshoShippingOptimizer';
import Subscription from './Subscription';

export default function Layout({ children, user }: { children: React.ReactNode, user: any }) {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const toolsAndFeatures = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Listing Generator', icon: FileText },
    { name: 'White Background', icon: ImageIcon },
    { name: 'Competitor Analysis', icon: Search },
    { name: 'AI Photoshoot', icon: Camera, badge: 'PRO' },
    { name: 'Low Shipping', icon: Zap, badge: 'NEW' },
    { name: 'A+ Content', icon: BookOpen },
    { name: 'Subscription', icon: CreditCard },
    { name: 'Admin Dashboard', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Listing Generator':
        return <ListingGenerator user={user} />;
      case 'White Background':
        return <WhiteBackground user={user} />;
      case 'Competitor Analysis':
        return <MarketIntelligence user={user} />;
      case 'AI Photoshoot':
        return <AIPhotoStudio user={user} />;
      case 'Low Shipping':
        return <MeeshoShippingOptimizer user={user} />;
      case 'A+ Content':
        return <APlusContentGenerator user={user} />;
      case 'Subscription':
        return <Subscription user={user} />;
      case 'Admin Dashboard':
        return <AdminPanel user={user} />;
      default:
        return children;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#fcfdfe] overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <aside className="w-[300px] flex-shrink-0 flex flex-col bg-white border-r border-slate-100 h-full relative z-30">
        {/* Logo Area */}
        <div className="flex h-24 items-center px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none font-display">ListingAI</h2>
              <p className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase mt-1">Enterprise</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-10 overflow-y-auto hide-scrollbar">
          {/* Tools & Features */}
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Navigation</h3>
            <div className="space-y-1.5">
              {toolsAndFeatures.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-1' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="tracking-tight">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                        isActive ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="px-4">
            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-125"></div>
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Account Status</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{user.displayName || 'User'}</p>
                    <p className={`text-[10px] font-bold ${user.subscriptionPlan === 'pro' ? 'text-blue-500' : 'text-slate-400'}`}>
                      {user.subscriptionPlan === 'pro' 
                        ? (user.activePlanId === 'max' ? 'ListingAI Max' : 
                           user.activePlanId === 'monthly' ? 'Monthly Pro' :
                           user.activePlanId === 'half-yearly' ? '6 Month Pro' :
                           user.activePlanId === 'yearly' ? 'Yearly Pro' : 'Pro Plan')
                        : 'Free Plan'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-8">
          <div className="rounded-3xl bg-slate-900 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Admin Access</span>
              </div>
              <div className="text-3xl font-black tracking-[0.2em] font-display">
                992403
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Header */}
        <header className="flex h-24 flex-shrink-0 items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-100 px-10 relative z-20">
          <div className="flex items-center gap-6">
            <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
            <h1 className="text-lg font-black text-slate-900 font-display tracking-tight">{activeTab}</h1>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Online</span>
            </div>
            
            <div className="w-px h-8 bg-slate-100 mx-2"></div>
            
            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
              <MessageCircle className="h-4 w-4" />
              Community
            </button>
            
            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-xl shadow-slate-900/10 ml-2 border-4 border-white">
              {user.email ? user.email.substring(0, 2).toUpperCase() : 'JZ'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#fcfdfe] relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-3xl -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full p-10"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

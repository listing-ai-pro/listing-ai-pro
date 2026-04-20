import React, { useState } from 'react';
import { LayoutDashboard, Image as ImageIcon, Search, Camera, Zap, BookOpen, CreditCard, ShieldCheck, User, Edit2, LogOut, MessageCircle, Monitor, RefreshCw, Maximize, FileText, Sparkles, Menu, X as CloseIcon, Lock, AlertTriangle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { trackCustom } from '../lib/pixel';
import { getRemainingDays } from '../lib/subscription';
import ListingGenerator from './ListingGenerator';
import MarketIntelligence from './MarketIntelligence';
import AIPhotoStudio from './AIPhotoStudio';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import APlusContentGenerator from './APlusContentGenerator';
import AdminPanel from './AdminPanel';
import MeeshoShippingOptimizer from './MeeshoShippingOptimizer';
import Subscription from './Subscription';
import BulkGenerator from './BulkGenerator';
import AdminMessageOverlay from './AdminMessageOverlay';
import JDChatbot from './JDChatbot';
import TrialExpiredModal from './TrialExpiredModal';
import { isPlanActive } from '../lib/subscription';

export default function Layout({ children, user }: { children: React.ReactNode, user: any }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for expiration on mount
  React.useEffect(() => {
    if (user && !isPlanActive(user) && user.activePlanId === 'trial') {
      setShowExpiredModal(true);
    }
  }, [user]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
    trackCustom('TabSwitch', {
      tab: tabName,
      userEmail: user.email,
      userId: user.uid
    });
  };

  const toolsAndFeatures = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Listing Generator', icon: FileText, locked: !isPlanActive(user) },
    { name: 'Competitor Analysis', icon: Search, locked: !isPlanActive(user) },
    { name: 'A+ Content', icon: BookOpen, locked: !isPlanActive(user) },
    { name: 'AI Photoshoot', icon: Camera, badge: 'PRO', locked: !isPlanActive(user) },
    { name: 'Low Shipping', icon: Zap, badge: 'NEW', locked: !isPlanActive(user) },
    { name: 'Bulk Generator', icon: Zap, badge: 'YEARLY', locked: user.activePlanId !== 'yearly' },
    { name: 'Subscription', icon: CreditCard },
    { name: 'Admin Dashboard', icon: ShieldCheck },
  ].filter(item => {
    if (item.name === 'Admin Dashboard') {
      return user.email === 'ezstall135@gmail.com';
    }
    return true;
  });

  const handleLogout = async () => {
    await signOut(auth);
  };

  const renderContent = () => {
    const isActive = isPlanActive(user);
    const isTool = ['Listing Generator', 'Competitor Analysis', 'AI Photoshoot', 'Low Shipping', 'A+ Content', 'Bulk Generator'].includes(activeTab);

    // Yearly restriction for Bulk Generator
    if (activeTab === 'Bulk Generator' && user.activePlanId !== 'yearly') {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[3.5rem] shadow-3xl border border-amber-500/20 text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/20 relative z-10">
              <Lock className="h-12 w-12" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-3xl font-black text-white font-display tracking-tight">Yearly Plan Required 🏆</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Bulk Generator (Mega Listing) functionality sirf Yearly plan users ke liye available hai. Aaj hi upgrade karein!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('Subscription')}
              className="relative z-10 block w-full py-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-600/20 active:scale-95"
            >
              Upgrade to Yearly Now
            </button>
          </motion.div>
        </div>
      );
    }

    if (isTool && !isActive) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[3.5rem] shadow-3xl border border-red-500/20 text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20 relative z-10">
              <Lock className="h-12 w-12" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-3xl font-black text-white font-display tracking-tight">Plan Expired 🛑</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Aapka plan khatam ho gaya hai. Ye tool use karne ke liye please naya plan buy karein.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('Subscription')}
              className="relative z-10 block w-full py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-600/20 active:scale-95"
            >
              Buy New Plan Now
            </button>
          </motion.div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Dashboard':
        return <UserDashboard user={user} onTabChange={handleTabChange} />;
      case 'Listing Generator':
        return <ListingGenerator user={user} />;
      case 'Competitor Analysis':
        return <MarketIntelligence user={user} />;
      case 'AI Photoshoot':
        return <AIPhotoStudio user={user} />;
      case 'Low Shipping':
        return <MeeshoShippingOptimizer user={user} />;
      case 'A+ Content':
        return <APlusContentGenerator user={user} />;
      case 'Bulk Generator':
        return <BulkGenerator user={user} />;
      case 'Subscription':
        return <Subscription user={user} />;
      case 'Admin Dashboard':
        return user.email === 'ezstall135@gmail.com' ? <AdminPanel user={user} /> : <UserDashboard user={user} onTabChange={handleTabChange} />;
      default:
        return children;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[280px] flex-shrink-0 flex-col bg-slate-900 border-r border-white/5 h-full relative z-30 shadow-2xl">
        <SidebarContent 
          user={user} 
          activeTab={activeTab} 
          handleTabChange={handleTabChange} 
          toolsAndFeatures={toolsAndFeatures} 
          handleLogout={handleLogout} 
        />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-slate-900 z-50 lg:hidden flex flex-col shadow-2xl border-r border-white/10"
            >
              <div className="absolute top-6 right-4 lg:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent 
                user={user} 
                activeTab={activeTab} 
                handleTabChange={handleTabChange} 
                toolsAndFeatures={toolsAndFeatures} 
                handleLogout={handleLogout} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Header */}
        <header className="flex h-16 lg:h-24 flex-shrink-0 items-center justify-between bg-slate-950/50 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-12 relative z-20">
          <div className="flex flex-col justify-center gap-1">
            {!isPlanActive(user) && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Plan Is over Please Buy New Plans</span>
              </div>
            )}
            <div className="flex items-center gap-3 lg:gap-8 min-w-0">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="h-12 w-px bg-white/5 hidden lg:block"></div>
              <div className="space-y-0.5 lg:space-y-1 min-w-0">
                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/80 font-mono hidden lg:block">Workspace</p>
                <h1 className="text-lg lg:text-3xl font-black text-white font-display tracking-tight truncate mb-1">{activeTab}</h1>
              </div>
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden sm:flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node: Central-1</span>
            </div>
            
            <div className="hidden lg:block w-px h-10 bg-white/5 mx-2"></div>
            
            <a 
              href={`https://wa.me/919023654443?text=${encodeURIComponent(`Hi Help Desk, I need assistance with ListingAI.\n\nUser: ${user.displayName || 'Seller'}\nEmail: ${user.email}\nSeller ID: ${user.sellerId || user.uid?.substring(0, 8)}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center h-10 w-10 lg:h-16 lg:w-16 rounded-full bg-emerald-500 text-white text-[8px] lg:text-[11px] font-black uppercase hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 border-2 lg:border-4 border-slate-950 glow-blue group relative shrink-0"
            >
              Help
              <span className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="h-2 w-2 lg:h-3 lg:w-3 text-emerald-600 fill-emerald-600" />
              </span>
            </a>
            
            <div className="h-10 w-10 lg:h-16 lg:w-16 rounded-xl lg:rounded-3xl bg-slate-900 text-blue-400 flex items-center justify-center text-base lg:text-2xl font-black shadow-2xl border-2 lg:border-4 border-slate-950 font-display shrink-0">
              {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : (user.email ? user.email.substring(0, 1).toUpperCase() : 'L')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950 relative custom-scrollbar">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] lg:w-[1000px] h-[500px] lg:h-[1000px] bg-blue-600/10 rounded-full blur-[150px] -mr-40 lg:-mr-60 -mt-40 lg:-mt-60"></div>
            <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[150px] -ml-60 -mb-60"></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full p-4 lg:p-8"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <AdminMessageOverlay user={user} />
      <JDChatbot currentTab={activeTab} user={user} />
      <TrialExpiredModal 
        isOpen={showExpiredModal} 
        onClose={() => setShowExpiredModal(false)} 
        onUpgrade={() => setActiveTab('Subscription')}
        user={user}
      />
    </div>
  );
}

function SidebarContent({ user, activeTab, handleTabChange, toolsAndFeatures, handleLogout }: any) {
  return (
    <>
      {/* Logo Area */}
      <div className="flex h-16 lg:h-18 items-center px-6 mb-1">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            animate={{ 
              boxShadow: ["0 0 20px rgba(37,99,235,0.2)", "0 0 40px rgba(37,99,235,0.4)", "0 0 20px rgba(37,99,235,0.2)"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 lg:h-6 lg:w-6" />
            </motion.div>
            <div className="absolute top-0 right-0 h-2 w-2 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </motion.div>
          <div>
            <h2 className="text-lg lg:text-xl font-black text-white leading-none font-display tracking-tight">ListingAI</h2>
            <p className="text-[8px] lg:text-[9px] font-black text-blue-500 tracking-[0.4em] uppercase mt-1 px-1.5 py-0.5 bg-blue-500/10 rounded-md w-fit border border-blue-500/20">v.4.2</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-8 lg:space-y-10 overflow-y-auto custom-scrollbar">
        {/* Tools & Features */}
        <div className="space-y-4">
          <h3 className="px-5 text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono opacity-50">Operations Hub</h3>
          <div className="space-y-1">
            {toolsAndFeatures.map((item: any) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleTabChange(item.name)}
                  className={`group flex w-full items-center justify-between rounded-2xl px-5 py-3 lg:py-3.5 text-sm font-black transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02] translate-x-1' 
                      : item.locked 
                        ? 'text-slate-700 cursor-not-allowed opacity-50 grayscale hover:bg-red-500/5'
                        : 'text-slate-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <item.icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white' : item.locked ? 'text-slate-800' : 'text-slate-700 group-hover:text-blue-400'}`} />
                      {item.locked && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <Lock className="h-2.5 w-2.5 text-red-500 fill-red-500/10" />
                        </div>
                      )}
                    </div>
                    <span className="tracking-tight uppercase text-[10px] lg:text-[11px] font-display">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                      isActive ? 'bg-white/20 text-white' : item.locked ? 'bg-slate-900 text-slate-700' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
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
        <div className="px-2">
          <div className="p-8 lg:p-10 rounded-[3.5rem] bg-slate-950 border border-white/5 relative overflow-hidden group shadow-inner">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 font-mono">User Node</p>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  <User className="h-7 w-7 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate max-w-[140px] font-display uppercase tracking-tight">{user.displayName || 'Seller'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <p className={`text-[10px] lg:text-[11px] font-black tracking-widest uppercase ${user.subscriptionPlan === 'pro' ? 'text-blue-500' : 'text-slate-600'}`}>
                      {user.subscriptionPlan === 'pro' 
                        ? (user.activePlanId === 'trial' ? 'Trial' :
                           user.activePlanId === 'max' ? 'Max Tier' : 
                           'Pro Tier')
                        : 'Free User'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-red-500 font-black text-[10px] lg:text-[11px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:border-red-500/20 transition-all"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-8 mt-auto">
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl -mr-12 -mt-12 opacity-50"></div>
          <div className="relative space-y-2">
            <div className="flex items-center gap-3 text-blue-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">SELLER_AUTH_ID</span>
            </div>
            <div className="text-xl lg:text-3xl font-black tracking-[0.05em] font-display uppercase text-white truncate">
              {user.sellerId || (user.uid ? user.uid.substring(0, 8) : 'LAI-882')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

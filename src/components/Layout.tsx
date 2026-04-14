import React, { useState } from 'react';
import { LayoutDashboard, FileText, Search, Camera, BookOpen, Settings, LogOut, Bell, Menu, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { authPromise } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import ListingGenerator from './ListingGenerator';
import MarketIntelligence from './MarketIntelligence';
import AIPhotoStudio from './AIPhotoStudio';
import Dashboard from './Dashboard';
import APlusContentGenerator from './APlusContentGenerator';
import AdminPanel from './AdminPanel';

export default function Layout({ children, user }: { children: React.ReactNode, user: any }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Listing Generator', icon: FileText },
    { name: 'Market Intelligence', icon: Search },
    { name: 'AI Photo Studio', icon: Camera },
    { name: 'A+ Content Generator', icon: BookOpen },
    { name: 'Admin Panel', icon: Settings },
  ];

  const handleLogout = async () => {
    const auth = await authPromise;
    await signOut(auth);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Listing Generator':
        return <ListingGenerator user={user} />;
      case 'Market Intelligence':
        return <MarketIntelligence user={user} />;
      case 'AI Photo Studio':
        return <AIPhotoStudio user={user} />;
      case 'A+ Content Generator':
        return <APlusContentGenerator user={user} />;
      case 'Admin Panel':
        return <AdminPanel user={user} />;
      default:
        return children;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? '16rem' : '5rem',
          x: 0
        }}
        className={`relative z-30 flex flex-col bg-white border-r border-slate-200 shadow-xl shadow-slate-200/50 transition-all duration-300 ease-in-out ${
          !isSidebarOpen ? '-translate-x-full lg:translate-x-0 absolute lg:relative h-full' : 'h-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.h2 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold text-slate-900 flex items-center gap-3 whitespace-nowrap overflow-hidden"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <span className="text-sm">AI</span>
                </div>
                E-com Suite
              </motion.h2>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`group relative flex w-full items-center rounded-2xl px-3 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`} />
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 hidden rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl group-hover:block group-hover:opacity-100 lg:block z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className="group flex w-full items-center rounded-2xl px-3 py-3.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3 whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50">
        <header className="sticky top-0 z-10 flex h-20 flex-shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="hidden lg:block">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

              <div className="flex items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <span className="text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                    {user.displayName || 'User'}
                  </span>
                  <span className="text-xs leading-4 text-slate-500">{user.email}</span>
                </div>
                <img
                  className="h-10 w-10 rounded-full bg-slate-50 ring-2 ring-white shadow-sm"
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=2563eb&color=fff`}
                  alt=""
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

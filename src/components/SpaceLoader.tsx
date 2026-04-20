import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe, Zap, Cpu } from 'lucide-react';

interface SpaceLoaderProps {
  step: string;
  isInline?: boolean;
}

export const SpaceLoader: React.FC<SpaceLoaderProps> = ({ step, isInline = false }) => {
  return (
    <div className={`${isInline ? 'absolute' : 'fixed'} inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl overflow-hidden ${isInline ? 'rounded-[inherit]' : ''}`}>
      {/* Deep Space / Quantum Field Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 opacity-60" />
        
        {/* Particle Field - Scaled for inline */}
        {[...Array(isInline ? 10 : 20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{ 
              y: [0, -1000],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 3, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: '120%',
              filter: 'blur(1px)'
            }}
          />
        ))}

        <div className={`absolute top-1/4 left-1/4 ${isInline ? 'w-[300px] h-[300px]' : 'w-[600px] h-[600px]'} bg-blue-600/10 rounded-full blur-[150px] animate-pulse`} />
        <div className={`absolute bottom-1/4 right-1/4 ${isInline ? 'w-[300px] h-[300px]' : 'w-[600px] h-[600px]'} bg-indigo-600/10 rounded-full blur-[150px] animate-pulse`} style={{ animationDelay: '1.5s' }} />
      </div>

      <div className={`relative flex flex-col items-center ${isInline ? 'scale-75 lg:scale-90' : ''}`}>
        {/* Holographic Neural Core */}
        <div className={`relative ${isInline ? 'w-56 h-56' : 'w-72 h-72 lg:w-96 lg:h-96'} perspective-[2000px] flex items-center justify-center`}>
          
          {/* Scanning Laser Line */}
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-[-10%] right-[-10%] h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent z-50 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
          />

          {/* Floating Micro-Technical Stats */}
          <div className="absolute inset-0 pointer-events-none font-mono text-[8px] lg:text-[10px] text-blue-400/40 uppercase tracking-widest font-black">
            <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1, repeat: Infinity }} className="absolute -top-10 -left-10">NEURAL_SYNC_ACTIVE: 98.4%</motion.div>
            <motion.div animate={{ opacity: [0.6, 0.2, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -bottom-10 -right-10">CORE_TEMP: 32.1°C [OPTIMAL]</motion.div>
            <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-1/2 -left-20 -translate-y-1/2 -rotate-90">TX_BUFF_INITIALIZED</motion.div>
          </div>

          {/* Multi-Layered Geometric Hub */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Outer Hexagon Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-blue-500/10 rounded-[3rem]"
              style={{ rotateX: '45deg', rotateY: '45deg' }}
            />
            
            {/* Main Rotating Sphere */}
            <motion.div
              animate={{ rotateY: 360, rotateX: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 border border-indigo-500/20 rounded-full shadow-[inset_0_0_50px_rgba(79,70,229,0.2)]"
              style={{ transformStyle: 'preserve-3d' }}
            />

            {/* Content Core */}
            <motion.div
              animate={{ 
                scale: [0.95, 1.05, 0.95],
                boxShadow: ["0 0 40px rgba(37,99,235,0.3)", "0 0 80px rgba(37,99,235,0.6)", "0 0 40px rgba(37,99,235,0.3)"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="h-40 w-40 lg:h-52 lg:w-52 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl"
            >
              {/* Inner Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 animate-pulse" />
              
              <Cpu className="h-16 w-16 lg:h-24 lg:w-24 text-blue-500 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              
              {/* Spinning Internal Rings */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-2 border-dashed border-white/5 rounded-full"
              />
            </motion.div>

            {/* Orbiting Elements (Hyper-Modern) */}
            <AnimatePresence>
              {[Sparkles, Globe, Zap].map((Icon, idx) => (
                <motion.div
                  key={`orbital-${idx}`}
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{ 
                    duration: 10 + (idx * 5), 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-[-15%]"
                >
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 10 + (idx * 5), repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-10 w-10 lg:h-12 lg:w-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-xl"
                  >
                    <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Neural Loading Text Area */}
        <div className="mt-8 text-center space-y-8 max-w-sm px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={step}
            className="space-y-3"
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-blue-500/50"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-blue-500 font-mono">Neural_Sync_v.4.2</span>
              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-blue-500/50"></div>
            </div>
            
            <h3 className="text-lg lg:text-xl font-black text-white font-display tracking-[0.1em] uppercase leading-tight italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {step}
            </h3>
            
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 opacity-60">
               <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-mono border-r border-white/10 pr-3 last:border-0 last:pr-0">PROCESS_HASH_0x{Math.random().toString(16).substring(2, 8).toUpperCase()}</motion.span>
               <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-mono text-blue-400 border-r border-white/10 pr-3 last:border-0 last:pr-0">SYNC_SECURE</span>
               <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-mono border-r border-white/10 pr-3 last:border-0 last:pr-0">LATENCY: 12ms</span>
            </div>
          </motion.div>

          {/* New Animation: Digital Frequency Spectrograph */}
          <div className="flex items-end justify-center gap-[2px] h-12 w-full max-w-[200px] mx-auto overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={`bar-${i}`}
                animate={{ 
                  height: [
                    '20%', 
                    `${Math.random() * 80 + 20}%`, 
                    `${Math.random() * 60 + 10}%`, 
                    `${Math.random() * 100}%`, 
                    '20%'
                  ],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ 
                  duration: 0.8 + Math.random() * 0.5, 
                  repeat: Infinity, 
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
                className="w-[3px] bg-gradient-to-t from-blue-600 via-blue-400 to-indigo-500 rounded-full"
              />
            ))}
          </div>

          <div className="pt-2">
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.5em] font-mono animate-pulse">Transmission_Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

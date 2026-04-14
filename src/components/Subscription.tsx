import React, { useState } from 'react';
import { Check, Zap, Crown, Calendar, Shield, ArrowRight, Star, Sparkles, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const plans = [
  {
    id: 'max',
    name: 'ListingAI Max',
    subtitle: 'Ultimate testing plan',
    price: '99',
    period: 'one-time',
    duration: '3 DAYS ACCESS',
    icon: Crown,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    features: [
      '20 Listings / Day',
      '5 White Backgrounds / Day',
      '10 Competitor Analysis / Day',
      '5 A+ Content / Day',
      'All Marketplaces',
      'SEO Score Analysis',
      '4 AI Photoshoot Studio / Day',
      '5 AI Low Shipping Tool / Day'
    ]
  },
  {
    id: 'monthly',
    name: '1 Month',
    subtitle: 'Casual sellers',
    price: '499',
    period: 'month',
    duration: '30 DAYS ACCESS',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    features: [
      '20 Listings / Day',
      '5 White Backgrounds / Day',
      '10 Competitor Analysis / Day',
      '5 A+ Content / Day',
      'All Marketplaces',
      'SEO Score Analysis',
      '4 AI Photoshoot Studio / Day',
      '5 AI Low Shipping Tool / Day'
    ]
  },
  {
    id: 'half-yearly',
    name: '6 Month',
    subtitle: 'Power sellers',
    price: '1,499',
    period: '6 months',
    duration: '180 DAYS ACCESS',
    icon: Calendar,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    features: [
      '20 Listings / Day',
      '5 White Backgrounds / Day',
      '10 Competitor Analysis / Day',
      '5 A+ Content / Day',
      'All Marketplaces',
      'SEO Score Analysis',
      '4 AI Photoshoot Studio / Day',
      '5 AI Low Shipping Tool / Day'
    ]
  },
  {
    id: 'yearly',
    name: '1 Year',
    subtitle: 'Active sellers',
    price: '1,999',
    period: 'year',
    duration: '365 DAYS ACCESS',
    icon: Star,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    popular: true,
    features: [
      '20 Listings / Day',
      '5 White Backgrounds / Day',
      '10 Competitor Analysis / Day',
      '5 A+ Content / Day',
      'All Marketplaces',
      'SEO Score Analysis',
      '4 AI Photoshoot Studio / Day',
      '5 AI Low Shipping Tool / Day'
    ]
  }
];

export default function Subscription({ user }: { user: any }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        subscriptionPlan: 'pro',
        activePlanId: planId,
        subscriptionDate: serverTimestamp()
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest"
        >
          <Sparkles className="h-3 w-3" />
          Subscription & Billing
        </motion.div>
        <h2 className="text-5xl font-black text-slate-900 font-display tracking-tight">Choose Your Power</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Scale your business with AI-driven precision. Select the plan that fits your growth.
        </p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-4 shadow-xl shadow-emerald-500/10"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-lg">Subscription Activated!</p>
            <p className="text-sm font-medium opacity-80">Your account has been upgraded to Pro. Enjoy unlimited potential.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative group h-full flex flex-col rounded-[3rem] bg-white border transition-all duration-500 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] ${
              plan.popular ? 'border-blue-500 ring-4 ring-blue-50 shadow-2xl' : 'border-slate-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                Most Popular
              </div>
            )}

            <div className="p-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${plan.color} text-white flex items-center justify-center shadow-xl shadow-slate-200`}>
                  <plan.icon className="h-7 w-7" />
                </div>
                {user.subscriptionPlan === 'pro' && user.activePlanId === plan.id && (
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <Check className="h-3 w-3" /> Current
                  </span>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-1 font-display">{plan.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{plan.subtitle}</p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-slate-400 font-bold text-sm">/{plan.period}</span>
                </div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{plan.duration}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 group/item">
                    <div className={`mt-1 h-5 w-5 rounded-full ${plan.bgColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110`}>
                      <Check className={`h-3 w-3 ${plan.textColor}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null || (user.subscriptionPlan === 'pro' && user.activePlanId === plan.id)}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn ${
                  user.subscriptionPlan === 'pro' && user.activePlanId === plan.id
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {loading === plan.id ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{user.subscriptionPlan === 'pro' && user.activePlanId === plan.id ? 'Active Plan' : 'Get Access'}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] -mr-64 -mt-64 opacity-20"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Shield className="h-3 w-3" />
              Secure Checkout
            </div>
            <h3 className="text-3xl font-black font-display">Enterprise Security Guaranteed</h3>
            <p className="text-slate-400 font-medium">
              We use 256-bit SSL encryption to ensure your data and transactions are always safe. No hidden fees, cancel anytime.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-slate-400" />
            </div>
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

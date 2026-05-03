import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

// Indian Names Data
const FIRST_NAMES = [
  'Aarav', 'Neha', 'Vihaan', 'Priya', 'Aditya', 'Ananya', 'Arjun', 'Isha', 
  'Rohan', 'Sneha', 'Kabir', 'Tanvi', 'Aryan', 'Meera', 'Rishi', 'Kavya',
  'Dev', 'Pooja', 'Ishaan', 'Shruti', 'Rahul', 'Riya', 'Kunal', 'Aarti'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Joshi', 'Mehta',
  'Shah', 'Rao', 'Das', 'Reddy', 'Roy', 'Iyer', 'Nair', 'Menon', 'Jain',
  'Agarwal', 'Chopra', 'Yadav'
];

const CITIES = [
  // Tier 1
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  // North
  'Jaipur', 'Lucknow', 'Kanpur', 'Chandigarh', 'Ludhiana', 'Agra', 'Varanasi', 'Amritsar', 'Dehradun', 'Jodhpur', 'Udaipur', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Shimla', 'Jammu',
  // South
  'Kochi', 'Thiruvananthapuram', 'Coimbatore', 'Madurai', 'Mysore', 'Mangalore', 'Vijayawada', 'Visakhapatnam', 'Tiruchirappalli', 'Salem', 'Kozhikode', 'Belagavi',
  // West
  'Surat', 'Vadodara', 'Rajkot', 'Nashik', 'Aurangabad', 'Nagpur', 'Goa', 'Kolhapur', 'Solapur', 'Bhavnagar', 'Jamnagar',
  // East
  'Patna', 'Bhubaneswar', 'Guwahati', 'Ranchi', 'Jamshedpur', 'Cuttack', 'Siliguri', 'Durgapur', 'Asansol', 'Dhanbad', 'Shillong',
  // Central
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Raipur', 'Bhilai', 'Bilaspur'
];

const PLANS = ['Max', '1 Month', '1 Year'];
const PLAN_COLORS: Record<string, string> = {
  'Max': 'text-rose-500',
  '1 Month': 'text-blue-500',
  '1 Year': 'text-amber-500'
};
const PLAN_PRICES: Record<string, string> = {
  'Max': '₹99',
  '1 Month': '₹399',
  '1 Year': '₹1,999'
};

interface BuyerEvent {
  id: number;
  name: string;
  city: string;
  plan: string;
  timeAgo: string;
}

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomTime = () => {
  return 'Just now';
};

export default function SocialProofPopup({ user }: { user?: any }) {
  const [currentEvent, setCurrentEvent] = useState<BuyerEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prevPlanRef = React.useRef<string | null>(null);

  const generateEvent = (): BuyerEvent => ({
    id: Date.now(),
    name: `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES).charAt(0)}.`,
    city: getRandomItem(CITIES),
    plan: getRandomItem(PLANS),
    timeAgo: getRandomTime()
  });

  useEffect(() => {
    // Check for real plan upgrade of current user
    if (user?.activePlanId && user.activePlanId !== 'trial') {
      if (prevPlanRef.current && prevPlanRef.current !== user.activePlanId) {
        // Plan just upgraded!
        const planName = PLANS.find(p => p.toLowerCase().includes(user.activePlanId.toLowerCase())) || 'Max';
        setCurrentEvent({
          id: Date.now(),
          name: user.displayName || user.email?.split('@')[0] || `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES).charAt(0)}.`,
          city: 'India',
          plan: planName,
          timeAgo: 'Just now'
        });
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 6000);
      }
      prevPlanRef.current = user.activePlanId;
    } else if (user?.activePlanId) {
      prevPlanRef.current = user.activePlanId;
    }
  }, [user?.activePlanId, user?.displayName, user?.email]);

  useEffect(() => {
    // Initial delay before showing the first popup
    let timerId: any;
    const initTimer = setTimeout(() => {
      triggerNextEvent();
    }, 5000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(timerId);
    };
  }, []);

  const triggerNextEvent = () => {
    setCurrentEvent(generateEvent());
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Calculate delay based on IST
      const now = new Date();
      const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const hours = istDate.getUTCHours();
      const minutes = istDate.getUTCMinutes();
      const currentTimeInMinutes = hours * 60 + minutes;

      // 9:00 AM = 540 minutes, 8:00 PM = 20:00 = 1200 minutes
      const isDayTime = currentTimeInMinutes >= 540 && currentTimeInMinutes < 1200;

      let nextDelay: number;
      if (isDayTime) {
        // 1 to 3 minutes: (60k to 180k ms)
        nextDelay = Math.floor(Math.random() * (180000 - 60000 + 1)) + 60000;
      } else {
        // 1 to 3 hours: (3.6m to 10.8m ms)
        nextDelay = Math.floor(Math.random() * (10800000 - 3600000 + 1)) + 3600000;
      }
      
      setTimeout(triggerNextEvent, nextDelay);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentEvent && (
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.3 } }}
          className="fixed bottom-6 lg:bottom-10 left-6 lg:left-10 z-[100] w-[90%] max-w-[320px] pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex items-stretch ring-1 ring-white/5">
            {/* Icon Section */}
            <div className="bg-blue-600/20 px-4 flex items-center justify-center border-r border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600 rounded-full blur-[40px] -mr-10 -mt-10 opacity-30"></div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 relative z-10">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-[13px] font-bold text-white">
                  {currentEvent.name}
                </p>
                <span className="text-[10px] font-black tracking-wider text-slate-500">
                  {currentEvent.timeAgo}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 font-medium my-1">
                from <span className="text-slate-300 font-semibold">{currentEvent.city}</span> bought
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${PLAN_COLORS[currentEvent.plan]}`}>
                    {currentEvent.plan} Plan
                  </span>
                </div>
                <span className="text-[11px] font-black font-mono text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-md">
                  {PLAN_PRICES[currentEvent.plan]}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

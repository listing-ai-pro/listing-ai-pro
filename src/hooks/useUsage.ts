import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UsageType, PLAN_LIMITS } from '../lib/usage';

export function useUsage(userOrId: any) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.uid;
  const planId = typeof userOrId === 'object' ? userOrId?.activePlanId || 'trial' : 'trial';
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;

  const [usage, setUsage] = useState<Record<UsageType, number>>({
    listingsGenerated: 0,
    whiteBackgrounds: 0,
    marketAnalysis: 0,
    aplusGenerated: 0,
    photoshoots: 0,
    shippingOptimizations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const date = new Date().toISOString().split('T')[0];
    const path = `users/${userId}/daily_stats/${date}`;
    
    const unsubscribe = onSnapshot(doc(db, path), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUsage({
          listingsGenerated: data.listingsGenerated || 0,
          whiteBackgrounds: data.whiteBackgrounds || 0,
          marketAnalysis: data.marketAnalysis || 0,
          aplusGenerated: data.aplusGenerated || 0,
          photoshoots: data.photoshoots || 0,
          shippingOptimizations: data.shippingOptimizations || 0
        });
      } else {
        setUsage({
          listingsGenerated: 0,
          whiteBackgrounds: 0,
          marketAnalysis: 0,
          aplusGenerated: 0,
          photoshoots: 0,
          shippingOptimizations: 0
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching usage stats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const getRemaining = (type: UsageType) => {
    return Math.max(0, limits[type] - usage[type]);
  };

  const isLimitReached = (type: UsageType) => {
    return usage[type] >= limits[type];
  };

  return { usage, loading, getRemaining, isLimitReached, limits };
}

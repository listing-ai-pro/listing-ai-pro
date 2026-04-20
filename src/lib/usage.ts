import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export type UsageType = 'listingsGenerated' | 'marketAnalysis' | 'aplusGenerated' | 'photoshoots' | 'shippingOptimizations' | 'bulkGenerated';

export const PLAN_LIMITS: Record<string, Record<UsageType, number>> = {
  trial: {
    listingsGenerated: 3,
    marketAnalysis: 3,
    aplusGenerated: 2,
    photoshoots: 0,
    shippingOptimizations: 0,
    bulkGenerated: 0
  },
  max: {
    listingsGenerated: 10,
    marketAnalysis: 5,
    aplusGenerated: 3,
    photoshoots: 3,
    shippingOptimizations: 3,
    bulkGenerated: 0
  },
  monthly: {
    listingsGenerated: 15,
    marketAnalysis: 7,
    aplusGenerated: 4,
    photoshoots: 3,
    shippingOptimizations: 4,
    bulkGenerated: 0
  },
  'half-yearly': {
    listingsGenerated: 18,
    marketAnalysis: 8,
    aplusGenerated: 5,
    photoshoots: 4,
    shippingOptimizations: 5,
    bulkGenerated: 0
  },
  yearly: {
    listingsGenerated: 20,
    marketAnalysis: 10,
    aplusGenerated: 5,
    photoshoots: 5,
    shippingOptimizations: 5,
    bulkGenerated: 5
  }
};

export async function checkLimit(user: any, type: UsageType): Promise<boolean> {
  const userId = user.uid;
  
  // Fetch latest user data to ensure strict plan enforcement
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const planId = userData?.activePlanId || 'trial';
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;
    
    // Strict check: if limit is 0, always return false
    if (limits[type] === 0) return false;

    const date = new Date().toISOString().split('T')[0];
    const path = `users/${userId}/daily_stats/${date}`;
    const statsRef = doc(db, path);
    const docSnap = await getDoc(statsRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data[type] || 0) < limits[type];
    }
    // If no usage yet and limit is > 0, allow
    return true;
  } catch (error) {
    console.error("Error checking limit:", error);
    return false;
  }
}

export async function trackUsage(userId: string, type: UsageType) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const path = `users/${userId}/daily_stats/${date}`;
  const userPath = `users/${userId}`;
  
  try {
    const statsRef = doc(db, path);
    const userRef = doc(db, userPath);
    const docSnap = await getDoc(statsRef);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    // Calculate total daily allowance for the bar in admin panel
    const planId = userData?.activePlanId || 'trial';
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;
    // Sum of all daily limits for this plan
    const totalDailyLimit = Object.values(limits).reduce((a, b) => a + b, 0);

    // Reset daily counter if date changed
    const lastUsageDate = userData?.lastUsageDate;
    const isNewDay = lastUsageDate !== date;

    // Increment usage on user document for easier admin tracking
    await updateDoc(userRef, {
      [`usage_${type}`]: increment(1),
      totalUsage: increment(1),
      dailyUsage: isNewDay ? 1 : increment(1),
      lastUsageDate: date,
      totalDailyLimit: totalDailyLimit, // Store current limit for UI
      lastActive: new Date()
    });

    if (docSnap.exists()) {
      await updateDoc(statsRef, {
        [type]: increment(1)
      });
    } else {
      await setDoc(statsRef, {
        userId,
        date,
        listingsGenerated: type === 'listingsGenerated' ? 1 : 0,
        marketAnalysis: type === 'marketAnalysis' ? 1 : 0,
        aplusGenerated: type === 'aplusGenerated' ? 1 : 0,
        photoshoots: type === 'photoshoots' ? 1 : 0,
        shippingOptimizations: type === 'shippingOptimizations' ? 1 : 0,
        bulkGenerated: type === 'bulkGenerated' ? 1 : 0,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth);
  }
}

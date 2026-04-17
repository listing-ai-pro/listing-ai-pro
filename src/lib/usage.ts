import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export type UsageType = 'listingsGenerated' | 'whiteBackgrounds' | 'marketAnalysis' | 'aplusGenerated' | 'photoshoots' | 'shippingOptimizations';

export const PLAN_LIMITS: Record<string, Record<UsageType, number>> = {
  trial: {
    listingsGenerated: 3,
    whiteBackgrounds: 2,
    marketAnalysis: 3,
    aplusGenerated: 2,
    photoshoots: 0,
    shippingOptimizations: 0
  },
  max: {
    listingsGenerated: 10,
    whiteBackgrounds: 3,
    marketAnalysis: 5,
    aplusGenerated: 3,
    photoshoots: 3,
    shippingOptimizations: 3
  },
  monthly: {
    listingsGenerated: 15,
    whiteBackgrounds: 4,
    marketAnalysis: 7,
    aplusGenerated: 4,
    photoshoots: 3,
    shippingOptimizations: 4
  },
  'half-yearly': {
    listingsGenerated: 18,
    whiteBackgrounds: 5,
    marketAnalysis: 8,
    aplusGenerated: 5,
    photoshoots: 4,
    shippingOptimizations: 5
  },
  yearly: {
    listingsGenerated: 20,
    whiteBackgrounds: 5,
    marketAnalysis: 10,
    aplusGenerated: 5,
    photoshoots: 5,
    shippingOptimizations: 5
  }
};

export async function checkLimit(user: any, type: UsageType): Promise<boolean> {
  const userId = user.uid;
  const planId = user.activePlanId || 'trial';
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;
  
  const date = new Date().toISOString().split('T')[0];
  const path = `users/${userId}/daily_stats/${date}`;
  try {
    const statsRef = doc(db, path);
    const docSnap = await getDoc(statsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data[type] || 0) < limits[type];
    }
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
    
    // Increment total usage on user document for easier admin tracking
    await updateDoc(userRef, {
      [`usage_${type}`]: increment(1),
      totalUsage: increment(1),
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
        whiteBackgrounds: type === 'whiteBackgrounds' ? 1 : 0,
        marketAnalysis: type === 'marketAnalysis' ? 1 : 0,
        aplusGenerated: type === 'aplusGenerated' ? 1 : 0,
        photoshoots: type === 'photoshoots' ? 1 : 0,
        shippingOptimizations: type === 'shippingOptimizations' ? 1 : 0,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth);
  }
}

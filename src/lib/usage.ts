import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export type UsageType = 'listingsGenerated' | 'whiteBackgrounds' | 'marketAnalysis' | 'aplusGenerated' | 'photoshoots' | 'shippingOptimizations';

export const USAGE_LIMITS: Record<UsageType, number> = {
  listingsGenerated: 20,
  whiteBackgrounds: 5,
  marketAnalysis: 10,
  aplusGenerated: 5,
  photoshoots: 4,
  shippingOptimizations: 5
};

export async function checkLimit(userId: string, type: UsageType): Promise<boolean> {
  const date = new Date().toISOString().split('T')[0];
  const path = `users/${userId}/daily_stats/${date}`;
  try {
    const statsRef = doc(db, path);
    const docSnap = await getDoc(statsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data[type] || 0) < USAGE_LIMITS[type];
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
  
  try {
    const statsRef = doc(db, path);
    const docSnap = await getDoc(statsRef);
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

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { dbPromise, authPromise } from '../firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';

export async function checkLimit(userId: string, type: 'listingsGenerated' | 'imagesGenerated' | 'marketAnalysis' | 'aplusGenerated', limit: number): Promise<boolean> {
  const date = new Date().toISOString().split('T')[0];
  const path = `users/${userId}/daily_stats/${date}`;
  try {
    const db = await dbPromise;
    const statsRef = doc(db, path);
    const docSnap = await getDoc(statsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data[type] || 0) < limit;
    }
    return true;
  } catch (error) {
    console.error("Error checking limit:", error);
    return false;
  }
}

export async function trackUsage(userId: string, type: 'listingsGenerated' | 'imagesGenerated' | 'marketAnalysis' | 'aplusGenerated') {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const path = `users/${userId}/daily_stats/${date}`;
  
  try {
    const db = await dbPromise;
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
        imagesGenerated: type === 'imagesGenerated' ? 1 : 0,
        marketAnalysis: type === 'marketAnalysis' ? 1 : 0,
        aplusGenerated: type === 'aplusGenerated' ? 1 : 0,
      });
    }
  } catch (error) {
    const auth = await authPromise;
    handleFirestoreError(error, OperationType.WRITE, path, auth);
  }
}

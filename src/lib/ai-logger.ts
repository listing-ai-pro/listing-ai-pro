import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export async function logAiRequest(type: string, model: string, status: 'success' | 'error', errorMessage?: string, latency?: number) {
  try {
    const userId = auth.currentUser?.uid || 'anonymous';
    await addDoc(collection(db, 'ai_logs'), {
      userId,
      type,
      model,
      status,
      errorMessage: errorMessage || null,
      latency: latency || null,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log AI request:', error);
  }
}

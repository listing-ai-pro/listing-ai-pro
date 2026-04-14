import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import the Firebase configuration
const firebaseConfigPromise = fetch('/firebase-applet-config.json').then(response => response.json());

// Initialize Firebase SDK
export const appPromise = fetch('/firebase-applet-config.json')
  .then(response => response.json())
  .then(firebaseConfig => initializeApp(firebaseConfig));

export const dbPromise = appPromise.then(app => {
  // We need to fetch config again or store it to get the databaseId
  return fetch('/firebase-applet-config.json')
    .then(response => response.json())
    .then(firebaseConfig => getFirestore(app, firebaseConfig.firestoreDatabaseId));
});
export const authPromise = appPromise.then(app => getAuth(app));

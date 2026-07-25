import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore,
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  serverTimestamp,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// MODERN MULTI-TAB PERSISTENCE: Uses Firebase v10+ cache API
// Handles HMR re-initialization gracefully by falling back to getFirestore()
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch (e) {
  // Already initialized (HMR hot reload) - just get the existing instance
  db = getFirestore(app);
}

const auth = getAuth(app);

export { db, auth, serverTimestamp, collection, doc, onSnapshot, setDoc, updateDoc, getDoc };

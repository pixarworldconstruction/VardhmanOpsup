import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  Database,
  Unsubscribe,
} from 'firebase/database';
import {
  Product,
  Vendor,
  Hospital,
  PurchaseTransaction,
  SalesInvoice,
  DeliveryChallan,
  StoreProfile,
} from '../types';

// Web app's Firebase configuration provided by the user
export const defaultFirebaseConfig = {
  apiKey: "AIzaSyCX3bhXP_nuhkCnPT2oWI3GOK9PVjgS2_Y",
  authDomain: "vardhman-opsup.firebaseapp.com",
  projectId: "vardhman-opsup",
  storageBucket: "vardhman-opsup.firebasestorage.app",
  messagingSenderId: "445624141957",
  appId: "1:445624141957:web:19c14b97cd98ec627f41ec",
  // Standard Realtime Database URL
  databaseURL: "https://vardhman-opsup-default-rtdb.firebaseio.com",
};

const RTDB_URL_KEY = 'vo_firebase_rtdb_url';

export const getStoredDatabaseUrl = (): string => {
  return localStorage.getItem(RTDB_URL_KEY) || defaultFirebaseConfig.databaseURL;
};

export const setStoredDatabaseUrl = (url: string) => {
  localStorage.setItem(RTDB_URL_KEY, url.trim());
};

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

export const getFirebaseInstance = () => {
  try {
    if (!firebaseApp) {
      if (getApps().length > 0) {
        firebaseApp = getApp();
      } else {
        const customUrl = getStoredDatabaseUrl();
        firebaseApp = initializeApp({
          ...defaultFirebaseConfig,
          databaseURL: customUrl,
        });
      }
    }

    if (!database && firebaseApp) {
      const customUrl = getStoredDatabaseUrl();
      database = getDatabase(firebaseApp, customUrl);
    }

    return { app: firebaseApp, db: database };
  } catch (err) {
    console.warn('Firebase initialization note:', err);
    return { app: null, db: null };
  }
};

export interface SyncDataPayload {
  products: Product[];
  vendors: Vendor[];
  hospitals: Hospital[];
  purchases: PurchaseTransaction[];
  invoices: SalesInvoice[];
  challans: DeliveryChallan[];
  storeProfile: StoreProfile;
  lastUpdated: string;
}

// Subscribe to real-time updates from Firebase Realtime Database
export const subscribeToFirebaseRealtime = (
  onData: (data: Partial<SyncDataPayload>) => void,
  onError: (error: Error) => void
): Unsubscribe | null => {
  try {
    const { db } = getFirebaseInstance();
    if (!db) {
      onError(new Error('Firebase Database not initialized'));
      return null;
    }

    const rootRef = ref(db, 'vardhman_opsup');
    const unsubscribe = onValue(
      rootRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          onData(val);
        } else {
          // Path doesn't exist yet, pass empty signal
          onData({});
        }
      },
      (error) => {
        console.warn('Firebase RTDB onValue error:', error);
        onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    onError(err);
    return null;
  }
};

// Write full state or individual section to Firebase Realtime Database
export const writeToFirebase = async (
  path: string,
  data: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { db } = getFirebaseInstance();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }

    const targetRef = ref(db, `vardhman_opsup/${path}`);
    await set(targetRef, data);
    return { success: true };
  } catch (err: any) {
    console.warn(`Failed writing to Firebase RTDB at vardhman_opsup/${path}:`, err);
    return { success: false, error: err.message || 'Write failed' };
  }
};

// Seed all initial application data to Firebase Realtime Database
export const seedAllToFirebase = async (
  payload: Omit<SyncDataPayload, 'lastUpdated'>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { db } = getFirebaseInstance();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }

    const rootRef = ref(db, 'vardhman_opsup');
    await set(rootRef, {
      ...payload,
      lastUpdated: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Seed failed' };
  }
};

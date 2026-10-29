import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Firestore,
  Unsubscribe as FirestoreUnsubscribe,
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  Database,
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
  // Standard Realtime Database URL fallback if RTDB is also used
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
let firestoreDb: Firestore | null = null;
let realtimeDb: Database | null = null;

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

    if (!firestoreDb && firebaseApp) {
      firestoreDb = getFirestore(firebaseApp);
    }

    if (!realtimeDb && firebaseApp) {
      try {
        const customUrl = getStoredDatabaseUrl();
        realtimeDb = getDatabase(firebaseApp, customUrl);
      } catch (e) {
        console.warn('Realtime Database init note:', e);
      }
    }

    return { app: firebaseApp, firestore: firestoreDb, rtdb: realtimeDb };
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    return { app: null, firestore: null, rtdb: null };
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

/**
 * Subscribe to real-time updates from Cloud Firestore (primary)
 */
export const subscribeToFirebaseRealtime = (
  onData: (data: Partial<SyncDataPayload>) => void,
  onError: (error: Error) => void
): FirestoreUnsubscribe | null => {
  try {
    const { firestore } = getFirebaseInstance();
    if (!firestore) {
      onError(new Error('Firebase Firestore not initialized'));
      return null;
    }

    const mainDocRef = doc(firestore, 'vardhman_opsup', 'main');

    const unsubscribe = onSnapshot(
      mainDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.data() as Partial<SyncDataPayload>;
          onData(val);
        } else {
          // Document does not exist yet (first-time database setup)
          onData({});
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot error:', error);
        onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    onError(err);
    return null;
  }
};

/**
 * Write individual entity slice or full payload to Cloud Firestore (and RTDB)
 */
export const writeToFirebase = async (
  path: string,
  data: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { firestore, rtdb } = getFirebaseInstance();
    if (!firestore) {
      return { success: false, error: 'Firestore database not initialized' };
    }

    // 1. Write to Cloud Firestore
    const mainDocRef = doc(firestore, 'vardhman_opsup', 'main');
    await setDoc(
      mainDocRef,
      {
        [path]: data,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also write to section document for modular collection structure
    try {
      const sectionDocRef = doc(firestore, 'vardhman_opsup', path);
      await setDoc(sectionDocRef, { data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      // Non-blocking
    }

    // 2. Also sync to Realtime Database if accessible (dual sync)
    if (rtdb) {
      try {
        const targetRef = ref(rtdb, `vardhman_opsup/${path}`);
        await set(targetRef, data);
      } catch (e) {
        // Non-blocking RTDB fallback
      }
    }

    return { success: true };
  } catch (err: any) {
    console.warn(`Failed writing to Firestore at vardhman_opsup/${path}:`, err);
    return { success: false, error: err.message || 'Write failed' };
  }
};

/**
 * Seed all application data to Cloud Firestore (and RTDB)
 */
export const seedAllToFirebase = async (
  payload: Omit<SyncDataPayload, 'lastUpdated'>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { firestore, rtdb } = getFirebaseInstance();
    if (!firestore) {
      return { success: false, error: 'Firestore database not initialized' };
    }

    const fullPayload: SyncDataPayload = {
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    // 1. Cloud Firestore write
    const mainDocRef = doc(firestore, 'vardhman_opsup', 'main');
    await setDoc(mainDocRef, fullPayload, { merge: true });

    // 2. Realtime Database dual write
    if (rtdb) {
      try {
        const rootRef = ref(rtdb, 'vardhman_opsup');
        await set(rootRef, fullPayload);
      } catch (e) {
        // Non-blocking
      }
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Seed to Firestore error:', err);
    return { success: false, error: err.message || 'Seed failed' };
  }
};

/**
 * Pull latest data snapshot on-demand from Cloud Firestore
 */
export const fetchLatestFromFirebase = async (): Promise<{
  success: boolean;
  data?: Partial<SyncDataPayload>;
  error?: string;
}> => {
  try {
    const { firestore } = getFirebaseInstance();
    if (!firestore) {
      return { success: false, error: 'Firestore database not initialized' };
    }

    const mainDocRef = doc(firestore, 'vardhman_opsup', 'main');
    const snapshot = await getDoc(mainDocRef);

    if (snapshot.exists()) {
      return { success: true, data: snapshot.data() as Partial<SyncDataPayload> };
    } else {
      return { success: true, data: {} };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Fetch failed' };
  }
};

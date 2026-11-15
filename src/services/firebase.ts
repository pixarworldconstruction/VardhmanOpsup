import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  Firestore,
  Unsubscribe as FirestoreUnsubscribe,
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  get,
  Database,
} from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  Auth,
  User,
  Unsubscribe as AuthUnsubscribe,
} from 'firebase/auth';
import {
  Product,
  Vendor,
  Hospital,
  PurchaseTransaction,
  SalesInvoice,
  DeliveryChallan,
  StoreProfile,
  AppUser,
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
let firebaseAuth: Auth | null = null;

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

    if (!firebaseAuth && firebaseApp) {
      firebaseAuth = getAuth(firebaseApp);
    }

    if (!realtimeDb && firebaseApp) {
      try {
        const customUrl = getStoredDatabaseUrl();
        realtimeDb = getDatabase(firebaseApp, customUrl);
      } catch (e) {
        console.warn('Realtime Database init note:', e);
      }
    }

    return {
      app: firebaseApp,
      firestore: firestoreDb,
      rtdb: realtimeDb,
      auth: firebaseAuth,
    };
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    return { app: null, firestore: null, rtdb: null, auth: null };
  }
};

// ==========================================
// FIREBASE AUTHENTICATION METHODS
// ==========================================

export const formatAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect password or email. Please verify and try again.';
    case 'auth/user-not-found':
      return 'Admin user not found. You can click "Register/Initialize Admin" to create it.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to multiple failed logins. Try again in a few minutes.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Email/Password sign-in provider is disabled in Firebase Console. Enable it in Authentication → Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
};

export const signInAdmin = async (
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; error?: string; code?: string }> => {
  try {
    const { auth } = getFirebaseInstance();
    if (!auth) {
      return { success: false, error: 'Firebase Auth is not initialized' };
    }
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return { success: true, user: cred.user };
  } catch (err: any) {
    return {
      success: false,
      error: formatAuthErrorMessage(err),
      code: err?.code,
    };
  }
};

export const createAdminUser = async (
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { auth } = getFirebaseInstance();
    if (!auth) {
      return { success: false, error: 'Firebase Auth is not initialized' };
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return { success: true, user: cred.user };
  } catch (err: any) {
    return { success: false, error: formatAuthErrorMessage(err) };
  }
};

/**
 * Provision a new Firebase Auth user using a secondary FirebaseApp instance
 * so the currently signed-in Admin remains logged in.
 */
export const provisionUserWithSecondaryApp = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<{ success: boolean; alreadyExists?: boolean; error?: string }> => {
  try {
    const secondaryName = 'vardhman-user-provisioner';
    const existingApp = getApps().find((a) => a.name === secondaryName);
    const customUrl = getStoredDatabaseUrl();
    const secondaryApp =
      existingApp ||
      initializeApp(
        {
          ...defaultFirebaseConfig,
          databaseURL: customUrl,
        },
        secondaryName
      );

    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      pass
    );

    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      } catch (e) {
        console.warn('Secondary profile update note:', e);
      }
    }

    // Immediately sign out secondary auth so it stays clean
    await signOut(secondaryAuth);
    return { success: true };
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      return {
        success: true,
        alreadyExists: true,
      };
    }
    return { success: false, error: formatAuthErrorMessage(err) };
  }
};

export const signOutAdmin = async (): Promise<void> => {
  try {
    const { auth } = getFirebaseInstance();
    if (auth) {
      await signOut(auth);
    }
  } catch (e) {
    console.warn('Sign out error:', e);
  }
};

export const subscribeToAuth = (
  onUserChanged: (user: User | null) => void
): AuthUnsubscribe | null => {
  try {
    const { auth } = getFirebaseInstance();
    if (!auth) return null;
    return onAuthStateChanged(auth, onUserChanged);
  } catch (e) {
    console.warn('Auth subscribe error:', e);
    return null;
  }
};

export const updateUserAuthPassword = async (
  newPass: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { auth } = getFirebaseInstance();
    if (!auth || !auth.currentUser) {
      return { success: false, error: 'No active authenticated user session found' };
    }
    await updatePassword(auth.currentUser, newPass);
    return { success: true };
  } catch (err: any) {
    if (err?.code === 'auth/requires-recent-login') {
      return {
        success: false,
        error: 'For security, please log out and sign back in before changing your password.',
      };
    }
    return { success: false, error: formatAuthErrorMessage(err) };
  }
};

export const updateUserAuthDisplayName = async (
  displayName: string
): Promise<void> => {
  try {
    const { auth } = getFirebaseInstance();
    if (auth?.currentUser && displayName.trim()) {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
    }
  } catch (e) {
    console.warn('Display name update note:', e);
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
  users?: AppUser[];
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

    const now = new Date().toISOString();
    const fullPayload: SyncDataPayload = {
      ...payload,
      lastUpdated: now,
    };

    // 1. Cloud Firestore primary sync document
    const mainDocRef = doc(firestore, 'vardhman_opsup', 'main');
    await setDoc(mainDocRef, fullPayload, { merge: true });

    // Also update modular section documents so main and section docs stay aligned
    const keys: Array<keyof Omit<SyncDataPayload, 'lastUpdated'>> = [
      'products',
      'vendors',
      'hospitals',
      'purchases',
      'invoices',
      'challans',
      'storeProfile',
      'users',
    ];
    for (const key of keys) {
      if (payload[key] !== undefined) {
        try {
          const sectionDocRef = doc(firestore, 'vardhman_opsup', key);
          await setDoc(sectionDocRef, { data: payload[key], updatedAt: now }, { merge: true });
        } catch {
          // Non-blocking
        }
      }
    }

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

type ArraySliceKey =
  | 'products'
  | 'vendors'
  | 'hospitals'
  | 'purchases'
  | 'invoices'
  | 'challans'
  | 'users';

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });

/**
 * Pull latest data snapshot on-demand from Cloud Firestore, with fast parallel
 * diagnostic recovery across modular section docs, top-level collections,
 * and Realtime Database (with strict timeouts so missing RTDB never hangs).
 */
export const fetchLatestFromFirebase = async (): Promise<{
  success: boolean;
  data?: Partial<SyncDataPayload>;
  mainDocExists?: boolean;
  error?: string;
}> => {
  try {
    const { firestore, rtdb } = getFirebaseInstance();
    if (!firestore) {
      return { success: false, error: 'Firestore database not initialized' };
    }

    const mainDocRef = doc(firestore, 'vardhman_opsup', 'main');
    const mainSnap = await withTimeout(getDoc(mainDocRef), 5000, 'Firestore main doc');
    const mainDocExists = mainSnap.exists();
    const consolidated: Partial<SyncDataPayload> = mainDocExists
      ? { ...(mainSnap.data() as Partial<SyncDataPayload>) }
      : {};

    const arrayKeys: ArraySliceKey[] = [
      'products',
      'vendors',
      'hospitals',
      'purchases',
      'invoices',
      'challans',
      'users',
    ];

    const missingArrayKeys = arrayKeys.filter((key) => {
      const val = consolidated[key];
      return !Array.isArray(val) || val.length === 0;
    });

    const recoveredFields: Partial<SyncDataPayload> = {};

    if (missingArrayKeys.length > 0 || !consolidated.storeProfile) {
      // Check RTDB once with a strict 1200ms timeout so unconfigured RTDB never hangs
      const rtdbPromise: Promise<Record<string, any> | null> = rtdb
        ? withTimeout(get(ref(rtdb, 'vardhman_opsup')), 1200, 'RTDB fallback')
            .then((snap) => (snap.exists() ? (snap.val() as Record<string, any>) : null))
            .catch(() => null)
        : Promise.resolve(null);

      // Check Firestore section docs and top-level collections in parallel
      const arrayChecks = missingArrayKeys.map(async (key) => {
        // 1. Modular section doc: vardhman_opsup/{key}
        try {
          const sectionSnap = await withTimeout(
            getDoc(doc(firestore, 'vardhman_opsup', key)),
            3000,
            `section ${key}`
          );
          if (sectionSnap.exists()) {
            const secData = sectionSnap.data();
            const arr = Array.isArray(secData?.data)
              ? secData.data
              : Array.isArray(secData?.items)
              ? secData.items
              : null;
            if (arr && arr.length > 0) {
              (consolidated as any)[key] = arr;
              (recoveredFields as any)[key] = arr;
              return;
            }
          }
        } catch {
          // Ignore
        }

        // 2. Top-level collection /{key}
        try {
          const colSnap = await withTimeout(
            getDocs(collection(firestore, key)),
            3000,
            `collection ${key}`
          );
          if (!colSnap.empty) {
            const docsList = colSnap.docs
              .filter((d) => d.id !== '_init' && d.id !== '_placeholder')
              .map((d) => {
                const dData = d.data() as Record<string, any>;
                return dData.id ? dData : { id: d.id, ...dData };
              });
            if (docsList.length > 0) {
              (consolidated as any)[key] = docsList;
              (recoveredFields as any)[key] = docsList;
              return;
            }
          }
        } catch {
          // Ignore
        }

        // 3. RTDB fallback
        const rtdbRoot = await rtdbPromise;
        if (rtdbRoot && rtdbRoot[key]) {
          const rtdbVal = Array.isArray(rtdbRoot[key])
            ? rtdbRoot[key]
            : typeof rtdbRoot[key] === 'object'
            ? Object.values(rtdbRoot[key])
            : null;
          if (rtdbVal && rtdbVal.length > 0) {
            (consolidated as any)[key] = rtdbVal;
            (recoveredFields as any)[key] = rtdbVal;
          }
        }
      });

      const storeProfileCheck = !consolidated.storeProfile
        ? (async () => {
            try {
              const spSnap = await withTimeout(
                getDoc(doc(firestore, 'vardhman_opsup', 'storeProfile')),
                3000,
                'section storeProfile'
              );
              if (spSnap.exists()) {
                const spData = spSnap.data();
                const profile = spData?.data || spData;
                if (profile && profile.name) {
                  consolidated.storeProfile = profile as StoreProfile;
                  recoveredFields.storeProfile = profile as StoreProfile;
                  return;
                }
              }
            } catch {
              // Ignore
            }

            try {
              const spCol = await withTimeout(
                getDocs(collection(firestore, 'storeProfile')),
                3000,
                'collection storeProfile'
              );
              if (!spCol.empty) {
                const first = spCol.docs[0].data() as StoreProfile;
                if (first && first.name) {
                  consolidated.storeProfile = first;
                  recoveredFields.storeProfile = first;
                  return;
                }
              }
            } catch {
              // Ignore
            }

            const rtdbRoot = await rtdbPromise;
            if (rtdbRoot?.storeProfile?.name) {
              consolidated.storeProfile = rtdbRoot.storeProfile as StoreProfile;
              recoveredFields.storeProfile = rtdbRoot.storeProfile as StoreProfile;
            }
          })()
        : Promise.resolve();

      await Promise.all([...arrayChecks, storeProfileCheck]);
    }

    // Heal main document in background if any real data was recovered from secondary locations
    if (Object.keys(recoveredFields).length > 0) {
      setDoc(
        mainDocRef,
        {
          ...recoveredFields,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }

    return { success: true, data: consolidated, mainDocExists };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Fetch failed' };
  }
};

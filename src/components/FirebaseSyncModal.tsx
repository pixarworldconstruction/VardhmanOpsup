import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  X,
  ShieldCheck,
  Copy,
  Check,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { defaultFirebaseConfig } from '../services/firebase';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIRESTORE_RULES = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Vardhman Opsup - Medical & Operation Material Suppliers
    // Full Add (create), View (read), Edit (update), and Delete permissions

    match /vardhman_opsup/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /products/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /invoices/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /challans/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /purchases/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /hospitals/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /vendors/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /storeProfile/{document=**} {
      allow read, create, update, delete: if true;
    }
    match /{document=**} {
      allow read, create, update, delete: if true;
    }
  }
}`;

const RTDB_RULES = `{
  "rules": {
    "vardhman_opsup": {
      ".read": true,
      ".write": true
    }
  }
}`;

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    firebaseStatus,
    firebaseError,
    syncToFirebaseNow,
    pullFromFirebaseNow,
    products,
    vendors,
    hospitals,
    purchases,
    invoices,
    challans,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'firestore' | 'status' | 'rtdb'>('firestore');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedFirestore, setCopiedFirestore] = useState(false);
  const [copiedRtdb, setCopiedRtdb] = useState(false);

  if (!isOpen) return null;

  const handlePush = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const success = await syncToFirebaseNow();
    setIsSyncing(false);
    if (success) {
      setSyncFeedback('All data successfully uploaded & saved to Cloud Firestore!');
    } else {
      setSyncFeedback('Upload failed. Check if Firestore security rules are published in Firebase Console.');
    }
  };

  const handlePull = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const success = await pullFromFirebaseNow();
    setIsSyncing(false);
    if (success) {
      setSyncFeedback('Latest data successfully loaded from Cloud Firestore!');
    } else {
      setSyncFeedback('Failed to pull from Firestore. Please verify Firestore rules allow read/write.');
    }
  };

  const copyToClipboard = (text: string, type: 'firestore' | 'rtdb') => {
    navigator.clipboard.writeText(text);
    if (type === 'firestore') {
      setCopiedFirestore(true);
      setTimeout(() => setCopiedFirestore(false), 2500);
    } else {
      setCopiedRtdb(true);
      setTimeout(() => setCopiedRtdb(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-orange-50 via-amber-50 to-teal-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Firebase Firestore Sync & Security Rules
              </h3>
              <p className="text-xs text-slate-500">
                Project ID: <strong className="text-slate-800 font-mono">{defaultFirebaseConfig.projectId}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('firestore')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'firestore'
                ? 'border-orange-600 text-orange-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Firestore Rules (Required)</span>
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'status'
                ? 'border-teal-600 text-teal-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Live Data Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('rtdb')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'rtdb'
                ? 'border-amber-600 text-amber-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Realtime DB Rules</span>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Alert Banner */}
          <div
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              firebaseStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : firebaseStatus === 'connecting'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {firebaseStatus === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : firebaseStatus === 'connecting' ? (
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider">
                  Status: {firebaseStatus === 'connected' ? 'Cloud Firestore Connected & Syncing' : firebaseStatus === 'connecting' ? 'Connecting to Cloud Firestore...' : 'Firestore Setup Needed'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/70 font-mono font-medium">
                  Firestore SDK v11
                </span>
              </div>
              <p className="text-[11px] mt-1 leading-relaxed">
                {firebaseStatus === 'connected'
                  ? 'All changes to products, vendors, hospitals, purchases, challans, and invoices are automatically saved to Firebase Cloud Firestore.'
                  : firebaseStatus === 'connecting'
                  ? 'Connecting to Cloud Firestore...'
                  : firebaseError || 'Permission Denied or database not initialized. Copy and paste the rules below in Firebase Console to allow saving.'}
              </p>
            </div>
          </div>

          {syncFeedback && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium text-center">
              {syncFeedback}
            </div>
          )}

          {activeTab === 'firestore' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
                <h4 className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" />
                  Why did data reset?
                </h4>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  By default, Firebase Cloud Firestore locks down database access (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">allow read, write: if false;</code>). When writes are denied by Firebase, data cannot save to the cloud.
                </p>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Once you paste the rules below into your <strong>Firebase Console</strong>, Cloud Firestore will immediately accept your changes and persist your database forever!
                </p>
              </div>

              {/* Rules Code Box */}
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    firestore.rules
                  </span>
                  <button
                    onClick={() => copyToClipboard(FIRESTORE_RULES, 'firestore')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-md transition text-xs shadow-2xs"
                  >
                    {copiedFirestore ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Firestore Rules</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed selection:bg-orange-500 selection:text-white">
{FIRESTORE_RULES}
                </pre>
              </div>

              {/* Step by Step Guide */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  How to paste in Firebase Console (30 seconds):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Open <strong><a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline font-semibold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a></strong> and select project <strong className="font-mono text-slate-900">vardhman-opsup</strong>.
                  </li>
                  <li>
                    In the left sidebar, click <strong>Build</strong> → <strong>Firestore Database</strong>.
                    <br />
                    <span className="text-[11px] text-slate-500 pl-4 block mt-0.5">
                      (If you haven't created the database yet, click "Create database" and choose Start in Test Mode).
                    </span>
                  </li>
                  <li>
                    Click the <strong>Rules</strong> tab at the top of the Firestore page.
                  </li>
                  <li>
                    Delete the existing code, paste the copied rules from above, and click <strong>Publish</strong>.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Counts */}
              <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Products</span>
                  <strong className="text-slate-800 text-base font-mono">{products.length}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Suppliers/Vendors</span>
                  <strong className="text-slate-800 text-base font-mono">{vendors.length}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Hospitals</span>
                  <strong className="text-slate-800 text-base font-mono">{hospitals.length}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Purchases</span>
                  <strong className="text-slate-800 text-base font-mono">{purchases.length}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Sales Invoices</span>
                  <strong className="text-slate-800 text-base font-mono">{invoices.length}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Challans</span>
                  <strong className="text-slate-800 text-base font-mono">{challans.length}</strong>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handlePush}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-xs hover:bg-orange-700 disabled:opacity-50 transition text-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isSyncing ? 'Syncing to Cloud...' : 'Push All Local Data to Firestore Now'}</span>
                </button>

                <button
                  onClick={handlePull}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition text-xs"
                >
                  <DownloadCloud className="w-4 h-4 text-slate-500" />
                  <span>Pull from Firestore</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                <strong>Real-time Note:</strong> Any time you add a product, create a purchase, make a sales invoice, or edit a vendor/hospital, the app writes directly to Cloud Firestore in real time.
              </p>
            </div>
          )}

          {activeTab === 'rtdb' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                If your project is also configured to use <strong>Realtime Database</strong>, paste these rules in <strong>Realtime Database → Rules</strong>:
              </p>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                  <span className="text-xs font-mono text-slate-300">
                    database.rules.json
                  </span>
                  <button
                    onClick={() => copyToClipboard(RTDB_RULES, 'rtdb')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-md transition text-xs"
                  >
                    {copiedRtdb ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy RTDB Rules</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
{RTDB_RULES}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => copyToClipboard(FIRESTORE_RULES, 'firestore')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100/70 hover:bg-orange-200 rounded-lg transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Firestore Rules</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-white border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
  Server,
} from 'lucide-react';
import { defaultFirebaseConfig } from '../services/firebase';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    firebaseStatus,
    firebaseError,
    firebaseDatabaseUrl,
    updateFirebaseDatabaseUrl,
    syncToFirebaseNow,
    pullFromFirebaseNow,
    products,
    vendors,
    hospitals,
    purchases,
    invoices,
    challans,
  } = useApp();

  const [customUrl, setCustomUrl] = useState(firebaseDatabaseUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePush = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const success = await syncToFirebaseNow();
    setIsSyncing(false);
    if (success) {
      setSyncFeedback('All data successfully uploaded to Firebase Realtime Database!');
    } else {
      setSyncFeedback('Upload encountered an error. Check Firebase Console Realtime Database rules.');
    }
  };

  const handlePull = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const success = await pullFromFirebaseNow();
    setIsSyncing(false);
    if (success) {
      setSyncFeedback('Live data pulled from Firebase Realtime Database!');
    } else {
      setSyncFeedback('Failed to pull from Firebase. Verify database rules and connection.');
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirebaseDatabaseUrl(customUrl);
    setSyncFeedback('Database URL updated! Reconnecting to Firebase...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Firebase Realtime Database
              </h3>
              <p className="text-xs text-slate-500">
                Project: <strong className="text-slate-800">{defaultFirebaseConfig.projectId}</strong>
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

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Badge */}
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
                  Status: {firebaseStatus === 'connected' ? 'Connected & Live Syncing' : firebaseStatus === 'connecting' ? 'Connecting to Realtime Database...' : 'Firebase Connection Warning'}
                </span>
                <span className="text-[10px] opacity-75 font-mono">
                  RTDB v9 SDK
                </span>
              </div>
              <p className="text-[11px] mt-0.5 opacity-90">
                {firebaseStatus === 'connected'
                  ? 'All changes to products, vendors, hospitals, purchases, and invoices are automatically saved to Firebase in real-time.'
                  : firebaseStatus === 'connecting'
                  ? 'Connecting to the Firebase Realtime Database endpoint...'
                  : firebaseError || 'Could not connect. Ensure Realtime Database is created in your Firebase Console.'}
              </p>
            </div>
          </div>

          {/* Sync counts */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block uppercase">Products</span>
              <strong className="text-slate-800 text-sm font-mono">{products.length}</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block uppercase">Suppliers</span>
              <strong className="text-slate-800 text-sm font-mono">{vendors.length}</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block uppercase">Hospitals</span>
              <strong className="text-slate-800 text-sm font-mono">{hospitals.length}</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block uppercase">Purchases</span>
              <strong className="text-slate-800 text-sm font-mono">{purchases.length}</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block uppercase">Sales Invoices</span>
              <strong className="text-slate-800 text-sm font-mono">{invoices.length}</strong>
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-400 block uppercase">Challans</span>
              <strong className="text-slate-800 text-sm font-mono">{challans.length}</strong>
            </div>
          </div>

          {/* Sync actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handlePush}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSyncing ? 'Syncing...' : 'Push All Data to Firebase'}</span>
            </button>

            <button
              onClick={handlePull}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <DownloadCloud className="w-4 h-4 text-slate-500" />
              <span>Pull from Firebase</span>
            </button>
          </div>

          {syncFeedback && (
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium text-center">
              {syncFeedback}
            </div>
          )}

          {/* Realtime Database URL Configuration */}
          <form onSubmit={handleSaveUrl} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span>Realtime Database Endpoint URL</span>
              </label>
              <span className="text-[10px] text-slate-400">Default: us-central1</span>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                required
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-teal-500 focus:outline-none"
                placeholder="https://vardhman-opsup-default-rtdb.firebaseio.com"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition"
              >
                Save & Reconnect
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              If your database was created in another region (e.g. Singapore / Belgium), paste the exact URL from your Firebase Console.
            </p>
          </form>

          {/* Setup & Security Rules Guide */}
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2 text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Firebase Realtime Database Rules</span>
            </div>
            <p className="text-[11px] text-blue-800">
              In your Firebase Console, open <strong>Realtime Database → Rules</strong> and ensure read/write access is allowed:
            </p>
            <pre className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed">
{`{
  "rules": {
    "vardhman_opsup": {
      ".read": true,
      ".write": true
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

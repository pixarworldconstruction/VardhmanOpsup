import React from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Building2,
  AlertTriangle,
  Plus,
  Store,
  FileSpreadsheet,
  Truck,
  RotateCcw,
  Smartphone,
  Download,
  Database,
  CloudCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenStoreModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewChallan: () => void;
  onOpenNewPurchase: () => void;
  onOpenNewProduct: () => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStoreModal,
  onOpenFirebaseModal,
  onOpenNewInvoice,
  onOpenNewChallan,
  onOpenNewPurchase,
  onOpenNewProduct,
  isMobilePreview,
  setIsMobilePreview,
}) => {
  const {
    storeProfile,
    lowStockProducts,
    setActiveView,
    exportDatabase,
    firebaseStatus,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <span className="font-extrabold text-base tracking-tight">VO</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                {storeProfile.name}
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                Live Store
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs md:max-w-md">
              {storeProfile.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Shortcuts */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Firebase Realtime Database Live Sync Indicator */}
          <button
            onClick={onOpenFirebaseModal}
            className={`flex items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition shadow-2xs ${
              firebaseStatus === 'connected'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : firebaseStatus === 'connecting'
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
            title="Firebase Realtime Database: vardhman-opsup (Click to manage sync)"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Firebase DB</span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                firebaseStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : firebaseStatus === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
          </button>

          {/* Low Stock Alert Indicator */}
          {lowStockProducts.length > 0 && (
            <button
              onClick={() => setActiveView('products')}
              className="relative flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
              title={`${lowStockProducts.length} items have low stock`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Low Stock:</span>
              <span className="rounded-full bg-amber-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {lowStockProducts.length}
              </span>
            </button>
          )}

          {/* Quick Create Invoice */}
          <button
            onClick={onOpenNewInvoice}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
            title="Create Sales Invoice with Tax calculation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sale Invoice</span>
          </button>

          {/* Quick Create Delivery Challan */}
          <button
            onClick={onOpenNewChallan}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="Create Delivery Challan for Hospital OT"
          >
            <Truck className="w-3.5 h-3.5 text-teal-600" />
            <span>New Challan</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Store Profile Edit Trigger */}
          <button
            onClick={onOpenStoreModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Edit Vardhman Opsup Store Profile (DL No, GSTIN, Address, Bank)"
          >
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Store Profile</span>
          </button>

          {/* Mobile view simulator toggle (desktop helper) */}
          <button
            onClick={() => setIsMobilePreview(!isMobilePreview)}
            className={`hidden xl:flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
              isMobilePreview
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Android Mobile Preview mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isMobilePreview ? 'Mobile Mode' : 'Desktop Mode'}</span>
          </button>

          {/* Backup Export */}
          <button
            onClick={exportDatabase}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Export full database backup (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

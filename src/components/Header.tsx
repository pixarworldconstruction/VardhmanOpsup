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
  CloudCheck,
  LogOut,
  UserCheck,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onOpenStoreModal: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewChallan: () => void;
  onOpenNewPurchase: () => void;
  onOpenNewProduct: () => void;
  onOpenProfileModal: () => void;
  onOpenUsersModal: () => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStoreModal,
  onOpenNewInvoice,
  onOpenNewChallan,
  onOpenNewPurchase,
  onOpenNewProduct,
  onOpenProfileModal,
  onOpenUsersModal,
  isMobilePreview,
  setIsMobilePreview,
}) => {
  const {
    storeProfile,
    lowStockProducts,
    setActiveView,
    exportDatabase,
    currentUser,
    activeUser,
    logoutAdmin,
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

          {/* Admin Team User Management Button */}
          {activeUser?.role === 'admin' && (
            <button
              onClick={onOpenUsersModal}
              className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition shadow-2xs"
              title="Admin Staff Management: Add/Edit/Delete users and set temporary passwords"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Users</span>
            </button>
          )}

          {/* User Profile & Secure Logout */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 ml-1">
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs transition"
              title="Click to view and edit your profile or update your password"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <div className="text-left hidden lg:block">
                <span className="font-semibold block truncate max-w-[130px] leading-tight">
                  {activeUser?.name || currentUser?.email || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block leading-tight">
                  {activeUser?.role?.toUpperCase() || 'USER'} • Edit Profile
                </span>
              </div>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1.5 text-xs font-semibold transition shadow-2xs"
              title="Secure Sign Out from Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

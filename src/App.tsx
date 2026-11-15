import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LowStockBanner } from './components/LowStockBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { SalesView } from './components/sales/SalesView';
import { DeliveryChallanView } from './components/challan/DeliveryChallanView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { HospitalsView } from './components/partners/HospitalsView';
import { VendorsView } from './components/partners/VendorsView';
import { ReportsView } from './components/reports/ReportsView';
import { StoreProfileModal } from './components/settings/StoreProfileModal';
import { ProductModal } from './components/products/ProductModal';
import { HospitalModal } from './components/partners/HospitalModal';
import { VendorModal } from './components/partners/VendorModal';
import { PurchaseModal } from './components/purchases/PurchaseModal';
import { InvoiceModal } from './components/sales/InvoiceModal';
import { InvoicePrintModal } from './components/sales/InvoicePrintModal';
import { ChallanModal } from './components/challan/ChallanModal';
import { ChallanPrintModal } from './components/challan/ChallanPrintModal';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';
import { AdminLoginScreen } from './components/auth/AdminLoginScreen';
import { UserProfileModal } from './components/users/UserProfileModal';
import { UserManagementModal } from './components/users/UserManagementModal';
import { AdminProfileView } from './components/users/AdminProfileView';
import { Flame, KeyRound, ShieldAlert, LogOut } from 'lucide-react';
import { Product, Hospital, Vendor, SalesInvoice, DeliveryChallan } from './types';

function AuthenticatedWorkspace() {
  const {
    activeView,
    setActiveView,
    invoices,
    challans,
    firebaseStatus,
    activeUser,
  } = useApp();

  // Modal states (always called unconditionally in AuthenticatedWorkspace)
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [hospitalToEdit, setHospitalToEdit] = useState<Hospital | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseVendorId, setPurchaseVendorId] = useState<string | undefined>(undefined);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<DeliveryChallan | null>(null);

  // Mobile simulator toggle for testing native Android view
  const [isMobilePreview, setIsMobilePreview] = useState(false);

  // Handlers for edit triggers
  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditHospital = (hosp: Hospital) => {
    setHospitalToEdit(hosp);
    setIsHospitalModalOpen(true);
  };

  const handleOpenNewHospital = () => {
    setHospitalToEdit(null);
    setIsHospitalModalOpen(true);
  };

  const handleEditVendor = (ven: Vendor) => {
    setVendorToEdit(ven);
    setIsVendorModalOpen(true);
  };

  const handleOpenNewVendor = () => {
    setVendorToEdit(null);
    setIsVendorModalOpen(true);
  };

  const handleViewInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (inv) setSelectedInvoiceForPrint(inv);
  };

  const handleViewChallan = (id: string) => {
    const dc = challans.find((c) => c.id === id);
    if (dc) setSelectedChallanForPrint(dc);
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 ${
        isMobilePreview ? 'flex items-center justify-center py-6 bg-slate-900/10' : ''
      }`}
    >
      <div
        className={`w-full ${
          isMobilePreview
            ? 'max-w-[420px] rounded-3xl border-8 border-slate-800 shadow-2xl bg-white overflow-hidden min-h-[850px] relative'
            : ''
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenStoreModal={() => setIsStoreModalOpen(true)}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
          onOpenNewChallan={() => setIsChallanModalOpen(true)}
          onOpenNewPurchase={() => setIsPurchaseModalOpen(true)}
          onOpenNewProduct={handleOpenNewProduct}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenUsersModal={() => setIsUsersModalOpen(true)}
          isMobilePreview={isMobilePreview}
          setIsMobilePreview={setIsMobilePreview}
        />

        <div className="flex">
          {/* Desktop Sidebar (hidden in mobile preview or on small screens) */}
          {!isMobilePreview && (
            <div className="hidden md:block">
              <Sidebar onOpenStoreModal={() => setIsStoreModalOpen(true)} />
            </div>
          )}

          {/* Main Workspace Content */}
          <main className="flex-1 p-3 sm:p-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            {/* First-Time Password Update Reminder Banner */}
            {activeUser?.isFirstLogin && activeView !== 'profile' && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-amber-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-600 text-white shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">
                      First-Time Login: Change Your Temporary Password
                    </p>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      You are currently using an admin-assigned temporary password. Update your profile and set your own private password.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('profile')}
                  className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-1.5 transition shadow-2xs text-center"
                >
                  Open My Profile
                </button>
              </div>
            )}

            {/* Firestore Setup Alert Banner */}
            {firebaseStatus === 'error' && (
              <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50/90 p-3.5 text-orange-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-orange-600 text-white shrink-0 mt-0.5">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-orange-950">
                      Cloud Firestore: Security Rules Required to Store Data Online
                    </p>
                    <p className="text-[11px] text-orange-900/80 mt-0.5">
                      Your changes are safe locally, but Firebase Firestore requires security rules before allowing writes. Paste the rules into Firebase Console to prevent data from resetting.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFirebaseModalOpen(true)}
                  className="shrink-0 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-3.5 py-1.5 transition shadow-2xs text-center"
                >
                  Copy Firestore Rules
                </button>
              </div>
            )}

            {/* Low-stock Automated Alert Banner */}
            <LowStockBanner onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)} />

            {/* Active View Router */}
            {activeView === 'dashboard' && (
              <DashboardView
                onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
                onOpenNewChallan={() => setIsChallanModalOpen(true)}
                onOpenNewPurchase={() => setIsPurchaseModalOpen(true)}
                onOpenNewProduct={handleOpenNewProduct}
                onViewInvoice={handleViewInvoice}
                onViewChallan={handleViewChallan}
              />
            )}

            {activeView === 'products' && (
              <ProductsView
                onOpenNewProduct={handleOpenNewProduct}
                onEditProduct={handleEditProduct}
              />
            )}

            {activeView === 'sales' && (
              <SalesView
                onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
                onViewInvoice={handleViewInvoice}
              />
            )}

            {activeView === 'challans' && (
              <DeliveryChallanView
                onOpenNewChallan={() => setIsChallanModalOpen(true)}
                onViewChallan={handleViewChallan}
              />
            )}

            {activeView === 'purchases' && (
              <PurchasesView
                onOpenNewPurchase={() => setIsPurchaseModalOpen(true)}
              />
            )}

            {activeView === 'hospitals' && (
              <HospitalsView
                onOpenNewHospital={handleOpenNewHospital}
                onEditHospital={handleEditHospital}
                onViewInvoice={handleViewInvoice}
                onViewChallan={handleViewChallan}
              />
            )}

            {activeView === 'vendors' && (
              <VendorsView
                onOpenNewVendor={handleOpenNewVendor}
                onEditVendor={handleEditVendor}
                onOpenNewPurchaseForVendor={(vId) => {
                  setPurchaseVendorId(vId);
                  setIsPurchaseModalOpen(true);
                }}
              />
            )}

            {activeView === 'reports' && <ReportsView />}

            {activeView === 'profile' && (
              <AdminProfileView onOpenStoreModal={() => setIsStoreModalOpen(true)} />
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation (shown on small devices or in mobile simulation mode) */}
        <MobileBottomNav />

        {/* Offline Connectivity Toast */}
        <OfflineIndicator />

        {/* Modals */}
        <StoreProfileModal
          isOpen={isStoreModalOpen}
          onClose={() => setIsStoreModalOpen(false)}
        />

        <FirebaseSyncModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
        />

        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

        {activeUser?.role === 'admin' && (
          <UserManagementModal
            isOpen={isUsersModalOpen}
            onClose={() => setIsUsersModalOpen(false)}
          />
        )}

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          productToEdit={productToEdit}
        />

        <HospitalModal
          isOpen={isHospitalModalOpen}
          onClose={() => {
            setIsHospitalModalOpen(false);
            setHospitalToEdit(null);
          }}
          hospitalToEdit={hospitalToEdit}
        />

        <VendorModal
          isOpen={isVendorModalOpen}
          onClose={() => {
            setIsVendorModalOpen(false);
            setVendorToEdit(null);
          }}
          vendorToEdit={vendorToEdit}
        />

        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          defaultVendorId={purchaseVendorId}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setPurchaseVendorId(undefined);
          }}
        />

        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          onInvoiceCreated={(newInv) => setSelectedInvoiceForPrint(newInv)}
        />

        <ChallanModal
          isOpen={isChallanModalOpen}
          onClose={() => setIsChallanModalOpen(false)}
        />

        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />

        <ChallanPrintModal
          challan={selectedChallanForPrint}
          onClose={() => setSelectedChallanForPrint(null)}
          onConvertToInvoice={(_cId) => {
            // Handled inside ChallanPrintModal
          }}
        />
      </div>
    </div>
  );
}

function MainApp() {
  const { isAdminAuthenticated, authLoading, activeUser, logoutAdmin } = useApp();

  // If Firebase Auth is checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white font-extrabold text-2xl shadow-xl animate-pulse mb-4">
          VO
        </div>
        <p className="text-sm font-bold text-slate-800">Vardhman Opsup</p>
        <p className="text-xs text-slate-500 mt-1">Verifying secure Firebase session...</p>
      </div>
    );
  }

  // If not authenticated, require Login
  if (!isAdminAuthenticated) {
    return <AdminLoginScreen />;
  }

  // If user account has been suspended by Admin
  if (activeUser && activeUser.isActive === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-rose-200 shadow-xl p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Account Suspended</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your access for <strong className="font-mono text-slate-700">{activeUser.email}</strong> has been suspended by the system administrator. Please contact your administrator to reactivate your profile.
            </p>
          </div>
          <button
            onClick={logoutAdmin}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return <AuthenticatedWorkspace />;
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

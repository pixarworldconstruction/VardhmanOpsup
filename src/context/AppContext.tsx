import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  Vendor,
  Hospital,
  PurchaseTransaction,
  SalesInvoice,
  DeliveryChallan,
  StoreProfile,
} from '../types';
import {
  initialStoreProfile,
  initialProducts,
  initialVendors,
  initialHospitals,
  initialPurchases,
  initialSalesInvoices,
  initialDeliveryChallans,
} from '../data/initialData';
import { isNearExpiry } from '../utils/formatters';
import {
  subscribeToFirebaseRealtime,
  writeToFirebase,
  seedAllToFirebase,
  getStoredDatabaseUrl,
  setStoredDatabaseUrl,
} from '../services/firebase';

interface AppContextType {
  products: Product[];
  vendors: Vendor[];
  hospitals: Hospital[];
  purchases: PurchaseTransaction[];
  invoices: SalesInvoice[];
  challans: DeliveryChallan[];
  storeProfile: StoreProfile;
  lowStockProducts: Product[];
  nearExpiryProducts: Product[];
  activeView: string;
  setActiveView: (view: string) => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStockDirectly: (id: string, newStock: number, reason?: string) => void;
  // Vendor actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Vendor;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  // Hospital actions
  addHospital: (hospital: Omit<Hospital, 'id' | 'createdAt'>) => Hospital;
  updateHospital: (hospital: Hospital) => void;
  deleteHospital: (id: string) => void;
  // Purchases (Inward stock)
  addPurchase: (purchase: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => void;
  deletePurchase: (id: string) => void;
  // Sales Invoices (Outward stock)
  addInvoice: (invoice: Omit<SalesInvoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (invoice: SalesInvoice) => void;
  deleteInvoice: (id: string) => void;
  recordInvoicePayment: (id: string, amount: number, paymentMode: 'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI') => void;
  // Delivery Challans
  addDeliveryChallan: (challan: Omit<DeliveryChallan, 'id' | 'createdAt'>) => DeliveryChallan;
  updateDeliveryChallan: (challan: DeliveryChallan) => void;
  deleteDeliveryChallan: (id: string) => void;
  createInvoiceFromChallan: (challanId: string) => SalesInvoice | null;
  // Store Profile
  updateStoreProfile: (profile: StoreProfile) => void;
  // Backup & Reset
  resetToSampleData: () => void;
  exportDatabase: () => void;
  importDatabase: (jsonStr: string) => boolean;
  // Firebase Realtime Database
  firebaseStatus: 'connecting' | 'connected' | 'error' | 'offline';
  firebaseError: string | null;
  firebaseDatabaseUrl: string;
  syncToFirebaseNow: () => Promise<boolean>;
  pullFromFirebaseNow: () => Promise<boolean>;
  updateFirebaseDatabaseUrl: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'vo_store_profile_v1',
  PRODUCTS: 'vo_products_v1',
  VENDORS: 'vo_vendors_v1',
  HOSPITALS: 'vo_hospitals_v1',
  PURCHASES: 'vo_purchases_v1',
  INVOICES: 'vo_invoices_v1',
  CHALLANS: 'vo_challans_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : initialStoreProfile;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
    return saved ? JSON.parse(saved) : initialHospitals;
  });

  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : initialSalesInvoices;
  });

  const [challans, setChallans] = useState<DeliveryChallan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHALLANS);
    return saved ? JSON.parse(saved) : initialDeliveryChallans;
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  // Firebase Realtime Database status
  const [firebaseStatus, setFirebaseStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [firebaseDatabaseUrl, setFirebaseDatabaseUrlState] = useState<string>(getStoredDatabaseUrl());

  const isInitialSyncAttempted = useRef(false);

  // Persistence effects for offline reliability
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(storeProfile));
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(challans));
  }, [challans]);

  // Subscribe to Firebase Realtime Database
  useEffect(() => {
    setFirebaseStatus('connecting');
    const unsubscribe = subscribeToFirebaseRealtime(
      (data) => {
        setFirebaseStatus('connected');
        setFirebaseError(null);

        // Check if database already has data
        const hasRemoteData = data && (
          (Array.isArray(data.products) && data.products.length > 0) ||
          (Array.isArray(data.vendors) && data.vendors.length > 0) ||
          (Array.isArray(data.hospitals) && data.hospitals.length > 0)
        );

        if (hasRemoteData) {
          if (data.storeProfile) setStoreProfile(data.storeProfile);
          if (data.products) setProducts(data.products);
          if (data.vendors) setVendors(data.vendors);
          if (data.hospitals) setHospitals(data.hospitals);
          if (data.purchases) setPurchases(data.purchases);
          if (data.invoices) setInvoices(data.invoices);
          if (data.challans) setChallans(data.challans);
        } else if (!isInitialSyncAttempted.current) {
          // Empty Realtime Database on first connect: seed initial catalog & profile!
          isInitialSyncAttempted.current = true;
          seedAllToFirebase({
            products,
            vendors,
            hospitals,
            purchases,
            invoices,
            challans,
            storeProfile,
          }).catch((err) => {
            console.warn('Initial seed to Firebase note:', err);
          });
        }
      },
      (error) => {
        console.warn('Firebase RTDB Connection note:', error);
        setFirebaseStatus('error');
        setFirebaseError(error.message);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseDatabaseUrl]);

  // Manual push all data to Firebase Realtime Database
  const syncToFirebaseNow = async (): Promise<boolean> => {
    setFirebaseStatus('connecting');
    const res = await seedAllToFirebase({
      products,
      vendors,
      hospitals,
      purchases,
      invoices,
      challans,
      storeProfile,
    });
    if (res.success) {
      setFirebaseStatus('connected');
      setFirebaseError(null);
      return true;
    } else {
      setFirebaseStatus('error');
      setFirebaseError(res.error || 'Sync failed');
      return false;
    }
  };

  // Manual pull from Firebase Realtime Database
  const pullFromFirebaseNow = async (): Promise<boolean> => {
    setFirebaseStatus('connecting');
    return new Promise((resolve) => {
      const unsub = subscribeToFirebaseRealtime(
        (data) => {
          setFirebaseStatus('connected');
          setFirebaseError(null);
          if (data.storeProfile) setStoreProfile(data.storeProfile);
          if (data.products) setProducts(data.products);
          if (data.vendors) setVendors(data.vendors);
          if (data.hospitals) setHospitals(data.hospitals);
          if (data.purchases) setPurchases(data.purchases);
          if (data.invoices) setInvoices(data.invoices);
          if (data.challans) setChallans(data.challans);
          if (unsub) unsub();
          resolve(true);
        },
        (err) => {
          setFirebaseStatus('error');
          setFirebaseError(err.message);
          if (unsub) unsub();
          resolve(false);
        }
      );
    });
  };

  const updateFirebaseDatabaseUrl = (url: string) => {
    setStoredDatabaseUrl(url);
    setFirebaseDatabaseUrlState(url);
  };

  // Derived alert lists
  const lowStockProducts = products.filter(
    (p) => p.currentStock <= p.lowStockThreshold
  );

  const nearExpiryProducts = products.filter((p) => isNearExpiry(p.expiryDate, 6));

  // ===================== PRODUCT METHODS =====================
  const addProduct = (item: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...item,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      writeToFirebase('products', updated);
      return updated;
    });
  };

  const updateProduct = (updated: Product) => {
    const fresh = { ...updated, updatedAt: new Date().toISOString() };
    setProducts((prev) => {
      const list = prev.map((p) => (p.id === fresh.id ? fresh : p));
      writeToFirebase('products', list);
      return list;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const list = prev.filter((p) => p.id !== id);
      writeToFirebase('products', list);
      return list;
    });
  };

  const adjustStockDirectly = (id: string, newStock: number, _reason?: string) => {
    setProducts((prev) => {
      const list = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            currentStock: Math.max(0, newStock),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      writeToFirebase('products', list);
      return list;
    });
  };

  // ===================== VENDOR METHODS =====================
  const addVendor = (item: Omit<Vendor, 'id' | 'createdAt'>): Vendor => {
    const newVendor: Vendor = {
      ...item,
      id: `ven-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setVendors((prev) => {
      const list = [newVendor, ...prev];
      writeToFirebase('vendors', list);
      return list;
    });
    return newVendor;
  };

  const updateVendor = (updated: Vendor) => {
    setVendors((prev) => {
      const list = prev.map((v) => (v.id === updated.id ? updated : v));
      writeToFirebase('vendors', list);
      return list;
    });
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => {
      const list = prev.filter((v) => v.id !== id);
      writeToFirebase('vendors', list);
      return list;
    });
  };

  // ===================== HOSPITAL METHODS =====================
  const addHospital = (item: Omit<Hospital, 'id' | 'createdAt'>): Hospital => {
    const newHospital: Hospital = {
      ...item,
      id: `hosp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setHospitals((prev) => {
      const list = [newHospital, ...prev];
      writeToFirebase('hospitals', list);
      return list;
    });
    return newHospital;
  };

  const updateHospital = (updated: Hospital) => {
    setHospitals((prev) => {
      const list = prev.map((h) => (h.id === updated.id ? updated : h));
      writeToFirebase('hospitals', list);
      return list;
    });
  };

  const deleteHospital = (id: string) => {
    setHospitals((prev) => {
      const list = prev.filter((h) => h.id !== id);
      writeToFirebase('hospitals', list);
      return list;
    });
  };

  // ===================== PURCHASE (INWARD STOCK) =====================
  const addPurchase = (purchaseData: Omit<PurchaseTransaction, 'id' | 'createdAt'>) => {
    const newPurchase: PurchaseTransaction = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Update purchases list & sync to Firebase
    setPurchases((prev) => {
      const list = [newPurchase, ...prev];
      writeToFirebase('purchases', list);
      return list;
    });

    // Automatically increase stock of items (including free/bonus scheme units)
    setProducts((prevProducts) => {
      const updated = prevProducts.map((prod) => {
        const matchingPurchased = newPurchase.items.filter((it) => it.productId === prod.id);
        if (matchingPurchased.length > 0) {
          const totalInward = matchingPurchased.reduce(
            (sum, it) => sum + Number(it.quantity) + Number(it.freeQuantity || 0),
            0
          );
          const latestItem = matchingPurchased[matchingPurchased.length - 1];
          return {
            ...prod,
            currentStock: prod.currentStock + totalInward,
            purchasePrice: latestItem.unitPrice || prod.purchasePrice,
            batchNumber: latestItem.batchNumber || prod.batchNumber,
            expiryDate: latestItem.expiryDate || prod.expiryDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return prod;
      });
      writeToFirebase('products', updated);
      return updated;
    });

    // Update vendor ledger balance if partial or unpaid
    if (newPurchase.paymentStatus !== 'Paid') {
      const unpaidAmount = newPurchase.grandTotal - (newPurchase.amountPaid || 0);
      setVendors((prev) => {
        const list = prev.map((v) => {
          if (v.id === newPurchase.vendorId) {
            return {
              ...v,
              balancePayable: (v.balancePayable || 0) + unpaidAmount,
            };
          }
          return v;
        });
        writeToFirebase('vendors', list);
        return list;
      });
    }
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => {
      const list = prev.filter((p) => p.id !== id);
      writeToFirebase('purchases', list);
      return list;
    });
  };

  // ===================== SALES INVOICES (OUTWARD STOCK) =====================
  const addInvoice = (invoiceData: Omit<SalesInvoice, 'id' | 'createdAt'>) => {
    const newInvoice: SalesInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => {
      const list = [newInvoice, ...prev];
      writeToFirebase('invoices', list);
      return list;
    });

    // Automatically deduct sold stock
    setProducts((prevProducts) => {
      const updated = prevProducts.map((prod) => {
        const soldItem = newInvoice.items.find((it) => it.productId === prod.id);
        if (soldItem) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - soldItem.quantity),
            updatedAt: new Date().toISOString(),
          };
        }
        return prod;
      });
      writeToFirebase('products', updated);
      return updated;
    });

    // Update hospital balance receivables if unpaid/partial
    if (newInvoice.paymentStatus !== 'Paid') {
      const receivable = newInvoice.grandTotal - (newInvoice.amountPaid || 0);
      setHospitals((prev) => {
        const list = prev.map((h) => {
          if (h.id === newInvoice.hospitalId) {
            return {
              ...h,
              outstandingBalance: (h.outstandingBalance || 0) + receivable,
            };
          }
          return h;
        });
        writeToFirebase('hospitals', list);
        return list;
      });
    }

    return newInvoice;
  };

  const updateInvoice = (updated: SalesInvoice) => {
    setInvoices((prev) => {
      const list = prev.map((inv) => (inv.id === updated.id ? updated : inv));
      writeToFirebase('invoices', list);
      return list;
    });
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => {
      const list = prev.filter((inv) => inv.id !== id);
      writeToFirebase('invoices', list);
      return list;
    });
  };

  const recordInvoicePayment = (
    id: string,
    amount: number,
    paymentMode: 'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI'
  ) => {
    let affectedHospitalId = '';
    setInvoices((prev) => {
      const list = prev.map((inv): SalesInvoice => {
        if (inv.id === id) {
          affectedHospitalId = inv.hospitalId;
          const newPaid = (inv.amountPaid || 0) + amount;
          const status: 'Paid' | 'Partial' | 'Unpaid' =
            newPaid >= inv.grandTotal ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          return {
            ...inv,
            amountPaid: newPaid,
            paymentStatus: status,
            paymentMode,
          };
        }
        return inv;
      });
      writeToFirebase('invoices', list);
      return list;
    });

    if (affectedHospitalId) {
      setHospitals((prev) => {
        const list = prev.map((h) => {
          if (h.id === affectedHospitalId) {
            return {
              ...h,
              outstandingBalance: Math.max(0, (h.outstandingBalance || 0) - amount),
            };
          }
          return h;
        });
        writeToFirebase('hospitals', list);
        return list;
      });
    }
  };

  // ===================== DELIVERY CHALLANS =====================
  const addDeliveryChallan = (
    item: Omit<DeliveryChallan, 'id' | 'createdAt'>
  ): DeliveryChallan => {
    const newChallan: DeliveryChallan = {
      ...item,
      id: `dc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setChallans((prev) => {
      const list = [newChallan, ...prev];
      writeToFirebase('challans', list);
      return list;
    });
    return newChallan;
  };

  const updateDeliveryChallan = (updated: DeliveryChallan) => {
    setChallans((prev) => {
      const list = prev.map((dc) => (dc.id === updated.id ? updated : dc));
      writeToFirebase('challans', list);
      return list;
    });
  };

  const deleteDeliveryChallan = (id: string) => {
    setChallans((prev) => {
      const list = prev.filter((dc) => dc.id !== id);
      writeToFirebase('challans', list);
      return list;
    });
  };

  const createInvoiceFromChallan = (challanId: string): SalesInvoice | null => {
    const dc = challans.find((c) => c.id === challanId);
    if (!dc) return null;

    const hosp = hospitals.find((h) => h.id === dc.hospitalId);
    const invoiceNum = `VO-INV-2026-${String(invoices.length + 101).padStart(3, '0')}`;
    const newInvoice: Omit<SalesInvoice, 'id' | 'createdAt'> = {
      invoiceNumber: invoiceNum,
      hospitalId: dc.hospitalId,
      hospitalName: dc.hospitalName,
      departmentStore: dc.departmentStore || hosp?.departmentStore || 'Central OT Store',
      hospitalGstin: hosp?.gstin || '24AAACH0123M1Z5',
      hospitalAddress: dc.deliveryAddress || hosp?.address || '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryChallanRef: dc.challanNumber,
      items: dc.items.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const rate = prod?.sellingPrice || 100;
        const disc = 0;
        const taxable = it.quantity * rate;
        const gst = prod?.gstRate || 12;
        const cgst = (taxable * (gst / 2)) / 100;
        const sgst = (taxable * (gst / 2)) / 100;
        return {
          productId: it.productId,
          productName: it.productName,
          code: prod?.code || 'VO-MAT-01',
          hsnCode: prod?.hsnCode || '9018',
          batchNumber: it.batchNumber,
          expiryDate: it.expiryDate,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: rate,
          discountPercent: disc,
          taxableAmount: taxable,
          gstRate: gst,
          cgstAmount: cgst,
          sgstAmount: sgst,
          totalAmount: taxable + cgst + sgst,
        };
      }),
      subtotal: 0,
      totalDiscount: 0,
      taxableTotal: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      roundOff: 0,
      grandTotal: 0,
      paymentStatus: 'Unpaid',
      amountPaid: 0,
      paymentMode: 'Bank Transfer',
      notes: `Generated from Delivery Challan ${dc.challanNumber}`,
    };

    // Calculate totals
    const rawSubtotal = newInvoice.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const taxable = newInvoice.items.reduce((s, i) => s + i.taxableAmount, 0);
    const cgst = newInvoice.items.reduce((s, i) => s + i.cgstAmount, 0);
    const sgst = newInvoice.items.reduce((s, i) => s + i.sgstAmount, 0);
    const grand = Math.round(taxable + cgst + sgst);
    const roundOff = Number((grand - (taxable + cgst + sgst)).toFixed(2));

    newInvoice.subtotal = rawSubtotal;
    newInvoice.taxableTotal = taxable;
    newInvoice.cgstTotal = cgst;
    newInvoice.sgstTotal = sgst;
    newInvoice.roundOff = roundOff;
    newInvoice.grandTotal = grand;

    const created = addInvoice(newInvoice);

    // Mark challan as Invoiced
    updateDeliveryChallan({
      ...dc,
      status: 'Invoiced',
      linkedInvoiceId: created?.id,
    });

    return created || null;
  };

  // ===================== STORE PROFILE =====================
  const updateStoreProfile = (profile: StoreProfile) => {
    setStoreProfile(profile);
    writeToFirebase('storeProfile', profile);
  };

  // ===================== BACKUP & RESET =====================
  const resetToSampleData = () => {
    if (confirm('Reset all catalog and transaction data to initial surgical supplies state? This will also update Firebase.')) {
      setStoreProfile(initialStoreProfile);
      setProducts(initialProducts);
      setVendors(initialVendors);
      setHospitals(initialHospitals);
      setPurchases(initialPurchases);
      setInvoices(initialSalesInvoices);
      setChallans(initialDeliveryChallans);

      seedAllToFirebase({
        storeProfile: initialStoreProfile,
        products: initialProducts,
        vendors: initialVendors,
        hospitals: initialHospitals,
        purchases: initialPurchases,
        invoices: initialSalesInvoices,
        challans: initialDeliveryChallans,
      });
    }
  };

  const exportDatabase = () => {
    const data = {
      storeProfile,
      products,
      vendors,
      hospitals,
      purchases,
      invoices,
      challans,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vardhman-Opsup-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        if (data.storeProfile) setStoreProfile(data.storeProfile);
        if (data.products) setProducts(data.products);
        if (data.vendors) setVendors(data.vendors);
        if (data.hospitals) setHospitals(data.hospitals);
        if (data.purchases) setPurchases(data.purchases);
        if (data.invoices) setInvoices(data.invoices);
        if (data.challans) setChallans(data.challans);

        seedAllToFirebase({
          storeProfile: data.storeProfile || storeProfile,
          products: data.products || products,
          vendors: data.vendors || vendors,
          hospitals: data.hospitals || hospitals,
          purchases: data.purchases || purchases,
          invoices: data.invoices || invoices,
          challans: data.challans || challans,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        vendors,
        hospitals,
        purchases,
        invoices,
        challans,
        storeProfile,
        lowStockProducts,
        nearExpiryProducts,
        activeView,
        setActiveView,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStockDirectly,
        addVendor,
        updateVendor,
        deleteVendor,
        addHospital,
        updateHospital,
        deleteHospital,
        addPurchase,
        deletePurchase,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordInvoicePayment,
        addDeliveryChallan,
        updateDeliveryChallan,
        deleteDeliveryChallan,
        createInvoiceFromChallan,
        updateStoreProfile,
        resetToSampleData,
        exportDatabase,
        importDatabase,
        firebaseStatus,
        firebaseError,
        firebaseDatabaseUrl,
        syncToFirebaseNow,
        pullFromFirebaseNow,
        updateFirebaseDatabaseUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

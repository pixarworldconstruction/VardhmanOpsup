import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseItem, ProductUnit, ProductCategory, Vendor, VendorType } from '../../types';
import {
  ArrowDownToLine,
  X,
  Plus,
  Trash2,
  Save,
  Building2,
  Users2,
  Package,
  Calendar,
  Truck,
  CreditCard,
  CheckCircle2,
  Info,
  Edit2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { VendorModal } from '../partners/VendorModal';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVendorId?: string;
}

const CATEGORIES: ProductCategory[] = [
  'Surgical Consumables',
  'Laparoscopy & Trocars',
  'Sutures & Ligatures',
  'Orthopedic & Implants',
  'Anesthesia & Airway',
  'Wound Care & Dressings',
  'Disinfectants & Sterile',
  'General Medical',
];

const UNITS: ProductUnit[] = ['Box', 'Pcs', 'Pack', 'Kit', 'Set', 'Roll', 'Bottle', 'Vial'];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  defaultVendorId,
}) => {
  const { vendors, products, addPurchase, purchases, addVendor, addProduct } = useApp();

  const [vendorId, setVendorId] = useState(defaultVendorId || vendors[0]?.id || '');
  const [vendorBillNumber, setVendorBillNumber] = useState(
    `INV-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [transporterName, setTransporterName] = useState('');
  const [transportLRNumber, setTransportLRNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Paid');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI'>('Bank Transfer');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Quick inline creation & edit states
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isQuickAddVendorOpen, setIsQuickAddVendorOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: '',
    vendorType: 'Wholesaler' as VendorType,
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    gstin: '',
    drugLicenseNo: '',
  });

  const [isQuickAddProductRowIndex, setIsQuickAddProductRowIndex] = useState<number | null>(null);
  const [newProductData, setNewProductData] = useState({
    name: '',
    code: '',
    category: 'Surgical Consumables' as ProductCategory,
    unit: 'Box' as ProductUnit,
    hsnCode: '3006',
    purchasePrice: 0,
    sellingPrice: 0,
    gstRate: 12,
  });

  // Default first line item
  const initialProduct = products[0];
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      productId: initialProduct?.id || '',
      productName: initialProduct?.name || '',
      productCode: initialProduct?.code || 'VO-GEN',
      category: initialProduct?.category || 'Surgical Consumables',
      hsnCode: initialProduct?.hsnCode || '3006',
      batchNumber: initialProduct?.batchNumber || 'BAT-2026',
      expiryDate: initialProduct?.expiryDate || '2028-12',
      quantity: 20,
      freeQuantity: 0,
      unit: (initialProduct?.unit || 'Box') as ProductUnit,
      unitPrice: initialProduct?.purchasePrice || 1000,
      sellingPrice: initialProduct?.sellingPrice || 1350,
      discountPercent: 0,
      taxableAmount: 20 * (initialProduct?.purchasePrice || 1000),
      gstRate: initialProduct?.gstRate || 12,
      cgstAmount: ((20 * (initialProduct?.purchasePrice || 1000)) * ((initialProduct?.gstRate || 12) / 2)) / 100,
      sgstAmount: ((20 * (initialProduct?.purchasePrice || 1000)) * ((initialProduct?.gstRate || 12) / 2)) / 100,
      totalAmount: (20 * (initialProduct?.purchasePrice || 1000)) * (1 + (initialProduct?.gstRate || 12) / 100),
    },
  ]);

  if (!isOpen) return null;

  const selectedVendor = vendors.find((v) => v.id === vendorId) || vendors[0];

  const handleProductChange = (index: number, pId: string) => {
    const selected = products.find((p) => p.id === pId);
    if (!selected) return;

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const price = selected.purchasePrice || 0;
    const disc = newItems[index].discountPercent || 0;
    const discountedPrice = price * (1 - disc / 100);
    const taxable = qty * discountedPrice;
    const gst = selected.gstRate || 12;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    newItems[index] = {
      ...newItems[index],
      productId: selected.id,
      productName: selected.name,
      productCode: selected.code,
      category: selected.category,
      hsnCode: selected.hsnCode || '3006',
      unit: selected.unit,
      batchNumber: selected.batchNumber || newItems[index].batchNumber,
      expiryDate: selected.expiryDate || newItems[index].expiryDate,
      unitPrice: price,
      sellingPrice: selected.sellingPrice || Math.round(price * 1.3),
      gstRate: gst,
      taxableAmount: taxable,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: taxable + cgst + sgst,
    };
    setItems(newItems);
  };

  const handleItemFieldChange = (
    index: number,
    field: keyof PurchaseItem,
    value: any
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const discountedPrice = price * (1 - disc / 100);
    const taxable = qty * discountedPrice;
    const gst = Number(item.gstRate) || 0;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    item.taxableAmount = taxable;
    item.cgstAmount = cgst;
    item.sgstAmount = sgst;
    item.totalAmount = taxable + cgst + sgst;

    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    const defaultProd = products[0];
    const price = defaultProd?.purchasePrice || 500;
    const gst = defaultProd?.gstRate || 12;
    const taxable = 10 * price;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    setItems([
      ...items,
      {
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        productCode: defaultProd?.code || 'VO-GEN',
        category: defaultProd?.category || 'Surgical Consumables',
        hsnCode: defaultProd?.hsnCode || '3006',
        batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: `${new Date().getFullYear() + 2}-12`,
        quantity: 10,
        freeQuantity: 0,
        unit: (defaultProd?.unit || 'Box') as ProductUnit,
        unitPrice: price,
        sellingPrice: defaultProd?.sellingPrice || Math.round(price * 1.3),
        discountPercent: 0,
        taxableAmount: taxable,
        gstRate: gst,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount: taxable + cgst + sgst,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxableTotal = items.reduce((sum, item) => sum + (item.taxableAmount ?? (item.quantity * item.unitPrice)), 0);
  const totalDiscount = rawSubtotal - taxableTotal;
  const cgstTotal = items.reduce((sum, item) => sum + (item.cgstAmount ?? 0), 0);
  const sgstTotal = items.reduce((sum, item) => sum + (item.sgstAmount ?? 0), 0);
  const totalTax = cgstTotal + sgstTotal;
  const rawGrandTotal = taxableTotal + totalTax;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));
  const totalPurchasedUnits = items.reduce((sum, i) => sum + Number(i.quantity), 0);
  const totalFreeUnits = items.reduce((sum, i) => sum + Number(i.freeQuantity || 0), 0);

  // Quick Add Vendor Handler
  const handleQuickAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorData.name.trim()) return;

    const created = addVendor({
      name: newVendorData.name.trim(),
      vendorType: newVendorData.vendorType,
      contactPerson: newVendorData.contactPerson,
      phone: newVendorData.phone,
      email: newVendorData.email,
      address: newVendorData.address,
      city: newVendorData.city,
      state: newVendorData.state,
      gstin: newVendorData.gstin.toUpperCase(),
      drugLicenseNo: newVendorData.drugLicenseNo,
      balancePayable: 0,
      paymentTermsDays: 30,
    });

    setVendorId(created.id);
    setIsQuickAddVendorOpen(false);
    setNewVendorData({
      name: '',
      vendorType: 'Wholesaler',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      gstin: '',
      drugLicenseNo: '',
    });
  };

  // Quick Add Product Inline Handler
  const handleQuickAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuickAddProductRowIndex === null || !newProductData.name.trim()) return;

    const newProdId = `prod-${Date.now()}`;
    const newCode = newProductData.code.trim() || `VO-${Math.floor(100 + Math.random() * 900)}`;

    addProduct({
      code: newCode,
      name: newProductData.name.trim(),
      category: newProductData.category,
      unit: newProductData.unit,
      hsnCode: newProductData.hsnCode,
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: `${new Date().getFullYear() + 2}-12`,
      purchasePrice: Number(newProductData.purchasePrice),
      sellingPrice: Number(newProductData.sellingPrice) || Math.round(Number(newProductData.purchasePrice) * 1.3),
      currentStock: 0, // will be added by this purchase!
      lowStockThreshold: 10,
      gstRate: Number(newProductData.gstRate),
      preferredVendorId: vendorId,
    });

    // Populate current row
    const newItems = [...items];
    const qty = newItems[isQuickAddProductRowIndex].quantity || 10;
    const price = Number(newProductData.purchasePrice);
    const gst = Number(newProductData.gstRate);
    const taxable = qty * price;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    newItems[isQuickAddProductRowIndex] = {
      ...newItems[isQuickAddProductRowIndex],
      productId: newProdId,
      productName: newProductData.name.trim(),
      productCode: newCode,
      category: newProductData.category,
      hsnCode: newProductData.hsnCode,
      unit: newProductData.unit,
      unitPrice: price,
      sellingPrice: Number(newProductData.sellingPrice) || Math.round(price * 1.3),
      gstRate: gst,
      taxableAmount: taxable,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: taxable + cgst + sgst,
    };

    setItems(newItems);
    setIsQuickAddProductRowIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const purchaseNum = `PUR-2026-0${purchases.length + 43}`;

    addPurchase({
      purchaseNumber: purchaseNum,
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      vendorType: selectedVendor.vendorType,
      vendorContactPerson: selectedVendor.contactPerson,
      vendorPhone: selectedVendor.phone,
      vendorEmail: selectedVendor.email,
      vendorGstin: selectedVendor.gstin,
      vendorDrugLicenseNo: selectedVendor.drugLicenseNo,
      vendorAddress: selectedVendor.address,
      vendorBillNumber,
      date,
      dueDate,
      transportLRNumber: transportLRNumber || undefined,
      transporterName: transporterName || undefined,
      paymentStatus,
      paymentMode,
      amountPaid: paymentStatus === 'Paid' ? roundedGrandTotal : amountPaid,
      items,
      subtotal: rawSubtotal,
      totalDiscount,
      taxableTotal,
      cgstTotal,
      sgstTotal,
      totalTax,
      roundOff,
      grandTotal: roundedGrandTotal,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Purchased Invoice & Inventory Inward Entry
              </h3>
              <p className="text-xs text-slate-500">
                Record purchase invoices from wholesalers & manufacturers with full supplier profile and automated stock additions
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[78vh] overflow-y-auto space-y-4">
          {/* SECTION 1: Wholesaler / Manufacturer Details */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-teal-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  Wholesaler / Manufacturer Profile Details
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddVendorOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Wholesaler / Manufacturer</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Registered Supplier / Store *
                </label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vendorType || 'Wholesaler'}) — {v.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Supplier Category</label>
                <div className="mt-1 flex items-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-teal-800">
                  {selectedVendor?.vendorType || 'Wholesaler Store'}
                </div>
              </div>
            </div>

            {/* Profile summary card with inline edit trigger */}
            {selectedVendor && (
              <div className="rounded-lg bg-white p-3 border border-teal-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-teal-50">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                      {selectedVendor.vendorType || 'Wholesaler Store'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{selectedVendor.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditVendorOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50/80 px-2.5 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-100 transition shadow-2xs"
                    title="Edit full wholesaler / manufacturer profile details"
                  >
                    <Edit2 className="w-3 h-3 text-teal-600" />
                    <span>Edit Supplier Profile</span>
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-4 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Contact Person</span>
                    <strong className="text-slate-800">{selectedVendor.contactPerson}</strong>
                    <div className="text-[11px] text-slate-500">{selectedVendor.phone}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">GSTIN & DL</span>
                    <div className="font-mono text-[11px] font-bold text-slate-800">{selectedVendor.gstin}</div>
                    <div className="font-mono text-[10px] text-slate-500">{selectedVendor.drugLicenseNo || 'DL: N/A'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Billing / Store Address</span>
                    <div className="text-[11px] text-slate-600 truncate">{selectedVendor.address}</div>
                    <div className="text-[10px] text-slate-500">{selectedVendor.city}, {selectedVendor.state}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Current Balance Payable</span>
                    <div className="font-mono text-xs font-bold text-amber-700">
                      {formatCurrency(selectedVendor.balancePayable || 0)}
                    </div>
                    <div className="text-[10px] text-slate-500">Terms: {selectedVendor.paymentTermsDays || 30} Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Purchase Invoice & Transport Details */}
          <div className="grid gap-3 sm:grid-cols-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Supplier Invoice / Bill No. *
              </label>
              <input
                type="text"
                required
                value={vendorBillNumber}
                onChange={(e) => setVendorBillNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold focus:border-teal-500 focus:outline-none"
                placeholder="e.g. APX/26-27/0849"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Invoice Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Payment Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Transport / LR (Bilty) No.</label>
              <input
                type="text"
                value={transportLRNumber}
                onChange={(e) => setTransportLRNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                placeholder="e.g. LR-98124 / Vehicle"
              />
            </div>
          </div>

          {/* SECTION 3: Purchased Inventory Line Items */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Purchased Materials & Inventory Line Items
                </h4>
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="p-2.5 min-w-[200px]">Product / Material</th>
                    <th className="p-2.5 w-24">Batch No.</th>
                    <th className="p-2.5 w-24">Expiry</th>
                    <th className="p-2.5 w-16 text-center">Qty</th>
                    <th className="p-2.5 w-14 text-center" title="Free / Bonus Scheme Quantity (Adds to Stock)">Free</th>
                    <th className="p-2.5 w-20 text-right">Cost (₹)</th>
                    <th className="p-2.5 w-14 text-center">Disc%</th>
                    <th className="p-2.5 w-20 text-right">Selling Rate</th>
                    <th className="p-2.5 w-16 text-center">GST%</th>
                    <th className="p-2.5 w-24 text-right">Total (₹)</th>
                    <th className="p-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, idx) => {
                    const matched = products.find((p) => p.id === item.productId);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={item.productId}
                              onChange={(e) => handleProductChange(idx, e.target.value)}
                              className="w-full rounded border border-slate-200 p-1.5 text-xs bg-white focus:outline-none focus:border-teal-500"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.unit}) — Current Stock: {p.currentStock}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setIsQuickAddProductRowIndex(idx);
                                setNewProductData({
                                  name: '',
                                  code: `VO-MAT-${Math.floor(100 + Math.random() * 900)}`,
                                  category: 'Surgical Consumables',
                                  unit: 'Box',
                                  hsnCode: '3006',
                                  purchasePrice: 0,
                                  sellingPrice: 0,
                                  gstRate: 12,
                                });
                              }}
                              className="shrink-0 p-1 rounded bg-slate-100 text-teal-700 hover:bg-teal-50 text-[10px] font-bold"
                              title="Add Brand New Product to Catalog"
                            >
                              +New
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span>HSN: {item.hsnCode || '3006'}</span>
                            <span>• Unit: {item.unit}</span>
                            {matched && (
                              <span className="text-emerald-700 font-semibold">
                                Live Stock: {matched.currentStock}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => handleItemFieldChange(idx, 'batchNumber', e.target.value)}
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono font-medium"
                            placeholder="Batch"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={item.expiryDate}
                            onChange={(e) => handleItemFieldChange(idx, 'expiryDate', e.target.value)}
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono"
                            placeholder="YYYY-MM"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono font-bold text-center"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.freeQuantity || 0}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'freeQuantity', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-center text-emerald-700 bg-emerald-50/50"
                            title="Free scheme bonus qty (also added to stock)"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-right font-medium"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent || 0}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'discountPercent', parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-center"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.sellingPrice || 0}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'sellingPrice', parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-right"
                            title="Wholesale sale rate / MRP to hospital"
                          />
                        </td>

                        <td className="p-2">
                          <select
                            value={item.gstRate}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'gstRate', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs text-center"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                          </select>
                        </td>

                        <td className="p-2 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(item.totalAmount)}
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            disabled={items.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: Payment Status & Tax Calculations */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-medium"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Unpaid">Unpaid (Credit Terms)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="UPI">UPI Digital</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'Partial' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Amount Paid to Wholesaler (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={roundedGrandTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">Internal Remarks / Physical Inspection Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
                  placeholder="e.g. Received in good sterile packaging with manufacturer test report"
                />
              </div>
            </div>

            {/* Calculations Breakdown Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Material Gross Subtotal:</span>
                <span className="font-mono">{formatCurrency(rawSubtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Wholesale Discount:</span>
                  <span className="font-mono">-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Taxable Amount:</span>
                <span className="font-mono">{formatCurrency(taxableTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Input CGST:</span>
                <span className="font-mono">{formatCurrency(cgstTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Input SGST:</span>
                <span className="font-mono">{formatCurrency(sgstTotal)}</span>
              </div>
              {roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round-off:</span>
                  <span className="font-mono">{roundOff > 0 ? `+${roundOff}` : roundOff}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-extrabold text-slate-900">
                <span>Invoice Total:</span>
                <span className="font-mono text-teal-800">{formatCurrency(roundedGrandTotal)}</span>
              </div>

              {/* Automatic Stock Increment Highlight */}
              <div className="mt-2 rounded-lg bg-teal-50 border border-teal-200 p-2.5 text-[11px] text-teal-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Automated Inventory Sync:</strong> Total{' '}
                  <strong className="text-teal-950 font-bold">
                    {totalPurchasedUnits + totalFreeUnits} units
                  </strong>{' '}
                  ({totalPurchasedUnits} purchased + {totalFreeUnits} free) will be added to your live warehouse stock immediately.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Purchase Invoice & Add to Inventory</span>
            </button>
          </div>
        </form>

        {/* QUICK ADD VENDOR MODAL (ON THE FLY) */}
        {isQuickAddVendorOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Add New Wholesaler / Manufacturer
                </h4>
                <button
                  type="button"
                  onClick={() => setIsQuickAddVendorOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddVendorSubmit} className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Wholesaler / Manufacturer Name *</label>
                  <input
                    type="text"
                    required
                    value={newVendorData.name}
                    onChange={(e) => setNewVendorData({ ...newVendorData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="e.g. MedStar Surgical Wholesalers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700">Supplier Type</label>
                    <select
                      value={newVendorData.vendorType}
                      onChange={(e) => setNewVendorData({ ...newVendorData, vendorType: e.target.value as any })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Distributor / Stockist">Distributor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Contact Person</label>
                    <input
                      type="text"
                      value={newVendorData.contactPerson}
                      onChange={(e) => setNewVendorData({ ...newVendorData, contactPerson: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                      placeholder="e.g. Ramesh Bhai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700">Phone *</label>
                    <input
                      type="text"
                      required
                      value={newVendorData.phone}
                      onChange={(e) => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                      placeholder="+91 98250..."
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">GSTIN</label>
                    <input
                      type="text"
                      value={newVendorData.gstin}
                      onChange={(e) => setNewVendorData({ ...newVendorData, gstin: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-mono uppercase"
                      placeholder="24AAAC..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Store / Warehouse Address</label>
                  <input
                    type="text"
                    value={newVendorData.address}
                    onChange={(e) => setNewVendorData({ ...newVendorData, address: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="Shop No, Medical Complex, Ahmedabad"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddVendorOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Save & Select Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK ADD PRODUCT INLINE MODAL */}
        {isQuickAddProductRowIndex !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Add Brand New Product to Catalog & Inventory
                </h4>
                <button
                  type="button"
                  onClick={() => setIsQuickAddProductRowIndex(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddProductSubmit} className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProductData.name}
                    onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="e.g. Laparoscopic Needle Holder 5mm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700">Category</label>
                    <select
                      value={newProductData.category}
                      onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value as any })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Unit</label>
                    <select
                      value={newProductData.unit}
                      onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value as any })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700">Purchase Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProductData.purchasePrice}
                      onChange={(e) => setNewProductData({ ...newProductData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Target Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProductData.sellingPrice}
                      onChange={(e) => setNewProductData({ ...newProductData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddProductRowIndex(null)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Create & Select
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Wholesaler / Manufacturer Profile Edit Modal */}
        {isEditVendorOpen && selectedVendor && (
          <VendorModal
            isOpen={isEditVendorOpen}
            onClose={() => setIsEditVendorOpen(false)}
            vendorToEdit={selectedVendor}
          />
        )}
      </div>
    </div>
  );
};

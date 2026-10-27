import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory, ProductUnit } from '../../types';
import { Package, X, Save } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
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

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, vendors } = useApp();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Surgical Consumables' as ProductCategory,
    unit: 'Box' as ProductUnit,
    hsnCode: '3006',
    batchNumber: '',
    expiryDate: '',
    purchasePrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    lowStockThreshold: 10,
    gstRate: 12,
    preferredVendorId: '',
    description: '',
    locationRack: '',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        code: productToEdit.code,
        name: productToEdit.name,
        category: productToEdit.category,
        unit: productToEdit.unit,
        hsnCode: productToEdit.hsnCode || '3006',
        batchNumber: productToEdit.batchNumber || '',
        expiryDate: productToEdit.expiryDate || '',
        purchasePrice: productToEdit.purchasePrice || 0,
        sellingPrice: productToEdit.sellingPrice || 0,
        currentStock: productToEdit.currentStock || 0,
        lowStockThreshold: productToEdit.lowStockThreshold || 10,
        gstRate: productToEdit.gstRate || 12,
        preferredVendorId: productToEdit.preferredVendorId || '',
        description: productToEdit.description || '',
        locationRack: productToEdit.locationRack || '',
      });
    } else {
      setFormData({
        code: `VO-MAT-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        category: 'Surgical Consumables',
        unit: 'Box',
        hsnCode: '3006',
        batchNumber: `BAT-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: `${new Date().getFullYear() + 2}-12`,
        purchasePrice: 0,
        sellingPrice: 0,
        currentStock: 20,
        lowStockThreshold: 10,
        gstRate: 12,
        preferredVendorId: vendors[0]?.id || '',
        description: '',
        locationRack: 'Rack A-01',
      });
    }
  }, [productToEdit, isOpen, vendors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productToEdit) {
      updateProduct({
        ...productToEdit,
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        gstRate: Number(formData.gstRate),
      });
    } else {
      addProduct({
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        gstRate: Number(formData.gstRate),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {productToEdit ? 'Edit Operation Material Product' : 'Add New Operation Material Item'}
              </h3>
              <p className="text-xs text-slate-500">
                Stock updates automatically on inward purchases and sales invoices
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
        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Item / SKU Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                placeholder="VO-SUT-01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="e.g. Ethicon Vicryl 3-0 Sutures, Optical Trocar 10mm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Unit of Measure *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">HSN Code</label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                placeholder="3006 / 9018"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Default / Current Batch No.</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                placeholder="VJ2481A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Expiry Date (YYYY-MM)</label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                placeholder="2027-12"
              />
            </div>
          </div>

          {/* Pricing & GST Section */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pricing & GST Tax Slabs
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Purchase Cost (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Selling Price to Hospital (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">GST Rate (%) *</label>
                <select
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: parseInt(e.target.value, 10) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Medical essentials)</option>
                  <option value={12}>12% (Standard surgical goods)</option>
                  <option value={18}>18% (Disinfectants & equipment)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Controls */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Current Stock *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Low-Stock Alert Threshold *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 1 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Triggers reorder notification</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Storage Rack / Bin</label>
              <input
                type="text"
                value={formData.locationRack}
                onChange={(e) => setFormData({ ...formData, locationRack: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="Rack A-01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Specification & Packing Details</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Box of 36 foils, sterile EO, temperature sensitive"
            />
          </div>

          {/* Action Footer */}
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
              <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

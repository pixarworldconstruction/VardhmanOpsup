import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Edit2,
  Trash2,
  TrendingUp,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { formatCurrency, formatDate, isNearExpiry } from '../../utils/formatters';

interface ProductsViewProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenNewProduct,
  onEditProduct,
}) => {
  const { products, deleteProduct, adjustStockDirectly, lowStockProducts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [quickAdjustModal, setQuickAdjustModal] = useState<{
    product: Product;
    amount: number;
    mode: 'add' | 'subtract';
  } | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.hsnCode && p.hsnCode.includes(searchQuery));

    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;

    const matchesLowStock = !showLowStockOnly || p.currentStock <= p.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalStockValuation = products.reduce(
    (sum, p) => sum + p.currentStock * p.purchasePrice,
    0
  );
  const totalStockUnits = products.reduce((sum, p) => sum + p.currentStock, 0);

  const handleQuickAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdjustModal) return;
    const delta = quickAdjustModal.mode === 'add' ? quickAdjustModal.amount : -quickAdjustModal.amount;
    const newTotal = Math.max(0, quickAdjustModal.product.currentStock + delta);
    adjustStockDirectly(quickAdjustModal.product.id, newTotal);
    setQuickAdjustModal(null);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Operation & Medical Material Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Automated stock accumulation on inward purchases & deduction on hospital sales
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Items in Catalog</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{products.length} SKUs</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Available Stock</span>
          <div className="mt-1 text-lg font-bold text-teal-700">{totalStockUnits} Units</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Inventory Valuation</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalStockValuation)}</div>
        </div>
        <div
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`cursor-pointer rounded-xl border p-3.5 shadow-2xs transition ${
            lowStockProducts.length > 0
              ? 'border-amber-300 bg-amber-50 hover:bg-amber-100/60'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-900">Low Stock Reorders</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-lg font-bold text-amber-900">
              {lowStockProducts.length} Alert{lowStockProducts.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold underline">
              {showLowStockOnly ? 'Show All' : 'Filter Alert'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, batch number, or HSN code..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Surgical Consumables">Surgical Consumables</option>
            <option value="Laparoscopy & Trocars">Laparoscopy & Trocars</option>
            <option value="Sutures & Ligatures">Sutures & Ligatures</option>
            <option value="Orthopedic & Implants">Orthopedic & Implants</option>
            <option value="Anesthesia & Airway">Anesthesia & Airway</option>
            <option value="Wound Care & Dressings">Wound Care & Dressings</option>
            <option value="Disinfectants & Sterile">Disinfectants & Sterile</option>
          </select>

          {/* Quick low stock toggle button */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              showLowStockOnly
                ? 'border-amber-400 bg-amber-100 text-amber-900'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Item & Code</th>
                <th className="py-3 px-3">Category / HSN</th>
                <th className="py-3 px-3 text-center">Batch / Expiry</th>
                <th className="py-3 px-3 text-right">Cost Rate</th>
                <th className="py-3 px-3 text-right">Selling Rate</th>
                <th className="py-3 px-3 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No operation materials found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try altering search or category filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.lowStockThreshold;
                  const isNearExp = isNearExpiry(p.expiryDate, 6);
                  const marginPct =
                    p.purchasePrice > 0
                      ? Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100)
                      : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Code */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {p.code}
                          </span>
                          {p.locationRack && (
                            <span className="text-[10px] text-slate-400">
                              Loc: {p.locationRack}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {p.category}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          HSN: {p.hsnCode || '3006'} • GST: {p.gstRate}%
                        </div>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono text-[11px] font-medium text-slate-700">
                          {p.batchNumber || '-'}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <span
                            className={`text-[10px] font-semibold ${
                              isNearExp ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            Exp: {p.expiryDate || 'N/A'}
                          </span>
                          {isNearExp && (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-rose-500"
                              title="Expiring within 6 months"
                            />
                          )}
                        </div>
                      </td>

                      {/* Purchase Rate */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(p.purchasePrice)}
                      </td>

                      {/* Selling Rate */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {formatCurrency(p.sellingPrice)}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          +{marginPct}% margin
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              isLow
                                ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                          {isLow && (
                            <span className="mt-0.5 text-[10px] font-bold text-rose-600">
                              Reorder (Min: {p.lowStockThreshold})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Stock adjust button */}
                          <button
                            onClick={() =>
                              setQuickAdjustModal({ product: p, amount: 5, mode: 'add' })
                            }
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition"
                            title="Quick Stock Adjustment"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => onEditProduct(p)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete product ${p.name}? This will remove it from inventory.`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stock Adjust Modal */}
      {quickAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Quick Stock Adjustment
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Adjust current stock for <strong>{quickAdjustModal.product.name}</strong>
            </p>

            <form onSubmit={handleQuickAdjustSubmit} className="mt-4 space-y-3">
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() =>
                    setQuickAdjustModal({ ...quickAdjustModal, mode: 'add' })
                  }
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                    quickAdjustModal.mode === 'add'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setQuickAdjustModal({ ...quickAdjustModal, mode: 'subtract' })
                  }
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                    quickAdjustModal.mode === 'subtract'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - Deduct Stock
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Quantity to Change</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickAdjustModal.amount}
                  onChange={(e) =>
                    setQuickAdjustModal({
                      ...quickAdjustModal,
                      amount: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Current: <strong>{quickAdjustModal.product.currentStock} {quickAdjustModal.product.unit}</strong> → New:{' '}
                <strong>
                  {quickAdjustModal.mode === 'add'
                    ? quickAdjustModal.product.currentStock + quickAdjustModal.amount
                    : Math.max(0, quickAdjustModal.product.currentStock - quickAdjustModal.amount)}{' '}
                  {quickAdjustModal.product.unit}
                </strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAdjustModal(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

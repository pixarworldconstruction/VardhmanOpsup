import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseTransaction } from '../../types';
import {
  ArrowDownToLine,
  Plus,
  Search,
  Calendar,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Users2,
  Download,
  Building2,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportPurchaseVoucherPDF } from '../../utils/pdfGenerator';
import { PurchasePrintModal } from './PurchasePrintModal';

interface PurchasesViewProps {
  onOpenNewPurchase: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ onOpenNewPurchase }) => {
  const { purchases, deletePurchase, storeProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedPurchaseForPrint, setSelectedPurchaseForPrint] = useState<PurchaseTransaction | null>(null);

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorBillNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.vendorContactPerson && p.vendorContactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedTypeFilter === 'ALL' ||
      (p.vendorType && p.vendorType === selectedTypeFilter);

    return matchesSearch && matchesType;
  });

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalStockedUnits = purchases.reduce((sum, p) => {
    return sum + p.items.reduce((s, i) => s + Number(i.quantity) + Number(i.freeQuantity || 0), 0);
  }, 0);

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Purchased Invoices & Inventory Inward Entries
          </h2>
          <p className="text-xs text-slate-500">
            Records purchases from medical wholesalers & manufacturers with full supplier profile and automated inventory updates
          </p>
        </div>

        <button
          onClick={onOpenNewPurchase}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Enter Purchased Invoice</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Inward Invoices</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{purchases.length} Invoices</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Stock Added</span>
          <div className="mt-1 text-lg font-bold text-teal-700">{totalStockedUnits} Units</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Purchases Valuation</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalPurchasesAmount)}</div>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-teal-800">Live Inventory Sync</span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-teal-900">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Stock Auto-Increments</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by wholesaler name, manufacturer, bill number, or voucher ref..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Supplier Type:</span>
          {['ALL', 'Wholesaler', 'Manufacturer'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedTypeFilter === t
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All Suppliers' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Purchase Voucher</th>
                <th className="py-3 px-3">Wholesaler / Manufacturer Details</th>
                <th className="py-3 px-3">Supplier Bill No.</th>
                <th className="py-3 px-3 text-center">Units Added</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ArrowDownToLine className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No purchased entries recorded</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click 'Enter Purchased Invoice' to add stock from wholesalers or manufacturers</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const totalUnits = p.items.reduce((s, i) => s + Number(i.quantity) + Number(i.freeQuantity || 0), 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{p.purchaseNumber}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(p.date)}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{p.vendorName}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                              p.vendorType === 'Manufacturer'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}
                          >
                            {p.vendorType || 'Wholesaler'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {p.vendorContactPerson ? `Contact: ${p.vendorContactPerson}` : ''} 
                          {p.vendorPhone ? ` • ${p.vendorPhone}` : ''}
                        </div>
                        {p.vendorGstin && (
                          <div className="text-[10px] font-mono text-slate-400">
                            GSTIN: {p.vendorGstin}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {p.vendorBillNumber}
                        {p.transportLRNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            LR: {p.transportLRNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold">
                          +{totalUnits} units
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.items.length} items
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(p.subtotal)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(p.grandTotal)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                            p.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.paymentStatus === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Purchase Voucher */}
                          <button
                            onClick={() => setSelectedPurchaseForPrint(p)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="View Inward Purchase Voucher"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-700" />
                          </button>

                          {/* Quick PDF Download */}
                          <button
                            onClick={() => exportPurchaseVoucherPDF(p, storeProfile)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition"
                            title="Download Vector PDF Voucher"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete and reverse stock */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete purchase voucher ${p.purchaseNumber}? This will deduct the ${totalUnits} units back from inventory stock.`)) {
                                deletePurchase(p.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete and reverse stock"
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

      {/* Printable / Downloadable Purchase Voucher Modal */}
      <PurchasePrintModal
        purchase={selectedPurchaseForPrint}
        onClose={() => setSelectedPurchaseForPrint(null)}
      />
    </div>
  );
};

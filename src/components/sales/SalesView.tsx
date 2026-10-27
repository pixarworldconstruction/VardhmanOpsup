import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalesInvoice } from '../../types';
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  CheckCircle,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportInvoicePDF } from '../../utils/pdfGenerator';

interface SalesViewProps {
  onOpenNewInvoice: () => void;
  onViewInvoice: (invoiceId: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onOpenNewInvoice,
  onViewInvoice,
}) => {
  const { invoices, deleteInvoice, recordInvoicePayment, storeProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<SalesInvoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI'>('Bank Transfer');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.departmentStore && inv.departmentStore.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.deliveryChallanRef && inv.deliveryChallanRef.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalCollected = invoices
    .filter((i) => i.paymentStatus === 'Paid')
    .reduce((sum, i) => sum + i.grandTotal, 0) +
    invoices
      .filter((i) => i.paymentStatus === 'Partial')
      .reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const totalOutstanding = invoices
    .filter((i) => i.paymentStatus !== 'Paid')
    .reduce((sum, i) => sum + (i.grandTotal - (i.amountPaid || 0)), 0);

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    recordInvoicePayment(paymentModalInvoice.id, payAmount, payMode);
    setPaymentModalInvoice(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Sales & Automated Invoices (Hospitals & Stores)
          </h2>
          <p className="text-xs text-slate-500">
            Automated GST tax breakdown, live stock deductions, and one-click PDF export
          </p>
        </div>

        <button
          onClick={onOpenNewInvoice}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Invoice</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Invoiced</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalInvoiced)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Payments Collected</span>
          <div className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-800">Pending Receivables</span>
          <div className="mt-1 text-lg font-bold text-rose-700">{formatCurrency(totalOutstanding)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Invoices</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{invoices.length} Bills</div>
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
            placeholder="Search by invoice number, hospital name, department, or challan ref..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'Unpaid', 'Partial', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Invoice / Date</th>
                <th className="py-3 px-3">Hospital Customer & OT Store</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">GST Tax</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No sales invoices found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click 'New Sales Invoice' to bill a hospital</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isUnpaid = inv.paymentStatus !== 'Paid';
                  const remainingDue = inv.grandTotal - (inv.amountPaid || 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatDate(inv.date)} • Due: {formatDate(inv.dueDate)}
                        </div>
                        {inv.deliveryChallanRef && (
                          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                            DC: {inv.deliveryChallanRef}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{inv.hospitalName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {inv.departmentStore}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {inv.items.length} items
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(inv.taxableTotal)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(inv.cgstTotal + inv.sgstTotal)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inv.grandTotal)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                        {isUnpaid && remainingDue > 0 && (
                          <div className="text-[10px] text-rose-600 font-mono mt-0.5">
                            Due: {formatCurrency(remainingDue)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick payment update */}
                          {isUnpaid && (
                            <button
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPayAmount(remainingDue);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Print & View Modal */}
                          <button
                            onClick={() => onViewInvoice(inv.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="View & Print Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-700" />
                          </button>

                          {/* Quick Direct PDF Download */}
                          <button
                            onClick={() => exportInvoicePDF(inv, storeProfile)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition"
                            title="Download Vector PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invoiceNumber}? This will restore the sold quantities back to inventory.`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete and restore stock"
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

      {/* Record Payment Dialog */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Record Hospital Payment
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Invoice: <strong>{paymentModalInvoice.invoiceNumber}</strong> ({paymentModalInvoice.hospitalName})
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Amount Received (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalInvoice.grandTotal - (paymentModalInvoice.amountPaid || 0)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Hospital Cheque</option>
                  <option value="UPI">UPI Digital</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

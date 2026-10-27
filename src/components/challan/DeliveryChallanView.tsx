import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryChallan } from '../../types';
import {
  Truck,
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  CheckCircle,
  ArrowRight,
  Clock,
  Printer,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { exportChallanPDF } from '../../utils/pdfGenerator';

interface DeliveryChallanViewProps {
  onOpenNewChallan: () => void;
  onViewChallan: (challanId: string) => void;
}

export const DeliveryChallanView: React.FC<DeliveryChallanViewProps> = ({
  onOpenNewChallan,
  onViewChallan,
}) => {
  const {
    challans,
    deleteDeliveryChallan,
    updateDeliveryChallan,
    createInvoiceFromChallan,
    storeProfile,
    setActiveView,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredChallans = challans.filter((c) => {
    const matchesSearch =
      c.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.departmentStore.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.transporterOrPerson && c.transporterOrPerson.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const dispatchedCount = challans.filter((c) => c.status === 'Dispatched').length;
  const deliveredCount = challans.filter((c) => c.status === 'Delivered').length;
  const invoicedCount = challans.filter((c) => c.status === 'Invoiced').length;

  const handleConvertToInvoice = (challanId: string) => {
    const newInv = createInvoiceFromChallan(challanId);
    if (newInv) {
      alert(`Invoice ${newInv.invoiceNumber} created successfully from Delivery Challan!`);
      setActiveView('sales');
    }
  };

  const handleMarkDelivered = (c: DeliveryChallan) => {
    updateDeliveryChallan({ ...c, status: 'Delivered' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Hospital Delivery Challans (OT Material Dispatch)
          </h2>
          <p className="text-xs text-slate-500">
            Generate dispatch slips for hospital operation theathers and seamlessly convert to invoices
          </p>
        </div>

        <button
          onClick={onOpenNewChallan}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery Challan</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Challans</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{challans.length} Dispatches</div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-800">In Transit / Dispatched</span>
          <div className="mt-1 text-lg font-bold text-blue-700">{dispatchedCount} Active</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800">Delivered to OT</span>
          <div className="mt-1 text-lg font-bold text-emerald-700">{deliveredCount} Acknowledged</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Invoiced & Billed</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{invoicedCount} Billed</div>
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
            placeholder="Search by challan number, hospital name, department, or transporter..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'Dispatched', 'Delivered', 'Invoiced'].map((st) => (
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
                <th className="py-3 px-4">Challan No / Date</th>
                <th className="py-3 px-3">Destination Hospital / OT Store</th>
                <th className="py-3 px-3">Carrier / Vehicle</th>
                <th className="py-3 px-3 text-center">Dispatched Items</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Truck className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No delivery challans found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click 'New Delivery Challan' to create a dispatch slip</p>
                  </td>
                </tr>
              ) : (
                filteredChallans.map((c) => {
                  const totalUnits = c.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{c.challanNumber}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(c.date)}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{c.hospitalName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {c.departmentStore}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-700 font-medium">{c.transporterOrPerson || 'Direct'}</div>
                        <div className="font-mono text-[10px] text-slate-400">{c.vehicleNumber || 'Courier'}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {totalUnits} units ({c.items.length} items)
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                            c.status === 'Invoiced'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : c.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Convert to Invoice button if not yet invoiced */}
                          {c.status !== 'Invoiced' && (
                            <button
                              onClick={() => handleConvertToInvoice(c.id)}
                              className="rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-100 transition"
                              title="Convert to formal Sales Invoice"
                            >
                              Make Invoice
                            </button>
                          )}

                          {/* Quick mark delivered if dispatched */}
                          {c.status === 'Dispatched' && (
                            <button
                              onClick={() => handleMarkDelivered(c)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                              title="Mark Delivered by OT Sister"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View & Print Slip */}
                          <button
                            onClick={() => onViewChallan(c.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="View Challan Slip"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-700" />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => exportChallanPDF(c, storeProfile)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition"
                            title="Download Vector PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete delivery challan ${c.challanNumber}?`)) {
                                deleteDeliveryChallan(c.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete Challan"
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
    </div>
  );
};

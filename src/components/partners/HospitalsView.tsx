import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Hospital } from '../../types';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  History,
  FileText,
  Truck,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

interface HospitalsViewProps {
  onOpenNewHospital: () => void;
  onEditHospital: (hospital: Hospital) => void;
  onViewInvoice: (invoiceId: string) => void;
  onViewChallan: (challanId: string) => void;
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({
  onOpenNewHospital,
  onEditHospital,
  onViewInvoice,
  onViewChallan,
}) => {
  const { hospitals, deleteHospital, invoices, challans } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalHistory, setSelectedHospitalHistory] = useState<Hospital | null>(null);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);

  const filteredHospitals = hospitals.filter((h) => {
    return (
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.departmentStore.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.contactPerson && h.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalOutstanding = hospitals.reduce((sum, h) => sum + (h.outstandingBalance || 0), 0);

  // Get transaction records for selected hospital
  const hospitalInvoices = selectedHospitalHistory
    ? invoices.filter((i) => i.hospitalId === selectedHospitalHistory.id)
    : [];

  const hospitalChallans = selectedHospitalHistory
    ? challans.filter((c) => c.hospitalId === selectedHospitalHistory.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Hospital & Hospital Store Customer Database
          </h2>
          <p className="text-xs text-slate-500">
            Manage operation theatres, departments, outstanding receivables, and transaction ledgers
          </p>
        </div>

        <button
          onClick={onOpenNewHospital}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hospital / OT Store</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Registered Hospitals</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{hospitals.length} Healthcare Units</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-800">Total Outstanding Receivables</span>
          <div className="mt-1 text-lg font-bold text-rose-700">{formatCurrency(totalOutstanding)}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Average Credit Days</span>
          <div className="mt-1 text-lg font-bold text-teal-800">30 Days Net</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name, OT department, city, or contact person..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredHospitals.map((h) => {
          const hospInvs = invoices.filter((i) => i.hospitalId === h.id);
          const hospChallans = challans.filter((c) => c.hospitalId === h.id);
          const totalBilled = hospInvs.reduce((sum, i) => sum + i.grandTotal, 0);

          return (
            <div
              key={h.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{h.name}</h3>
                      <span className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 mt-0.5">
                        {h.departmentStore}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Outstanding Due</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        (h.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(h.outstandingBalance || 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{h.address}, {h.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{h.phone} ({h.contactPerson || 'OT In-charge'})</span>
                  </div>
                  {h.gstin && (
                    <div className="text-[11px] font-mono text-slate-500">
                      GSTIN: {h.gstin}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Metrics & Actions */}
              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>{hospInvs.length} Invoices</span> • <span>{hospChallans.length} Challans</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedHospitalHistory(h)}
                    className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                    title="View Transaction History"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Ledger</span>
                  </button>

                  <button
                    onClick={() => onEditHospital(h)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    title="Edit Hospital Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setHospitalToDelete(h)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Hospital"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction History Tracking Modal */}
      {selectedHospitalHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transaction Ledger: {selectedHospitalHistory.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedHospitalHistory.departmentStore} • Outstanding Balance: {formatCurrency(selectedHospitalHistory.outstandingBalance || 0)}
                </p>
              </div>
              <button
                onClick={() => setSelectedHospitalHistory(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Invoices Ledger */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Sales Invoices ({hospitalInvoices.length})</span>
                </h4>

                {hospitalInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No sales invoices yet for this hospital.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {hospitalInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.2 text-[10px] font-semibold border ${
                                inv.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {inv.paymentStatus}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {formatDate(inv.date)} • {inv.items.length} items
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            {formatCurrency(inv.grandTotal)}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedHospitalHistory(null);
                              onViewInvoice(inv.id);
                            }}
                            className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-100"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Challans */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Delivery Challans Dispatched ({hospitalChallans.length})</span>
                </h4>

                {hospitalChallans.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No delivery challans dispatched yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {hospitalChallans.map((dc) => (
                      <div
                        key={dc.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{dc.challanNumber}</span>
                            <span className="rounded-md bg-blue-50 px-1.5 py-0.2 text-[10px] font-semibold text-blue-700 border border-blue-200">
                              {dc.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {formatDate(dc.date)} • Transporter: {dc.transporterOrPerson}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {dc.items.reduce((s, i) => s + i.quantity, 0)} Units
                          </span>
                          <button
                            onClick={() => {
                              setSelectedHospitalHistory(null);
                              onViewChallan(dc.id);
                            }}
                            className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            Slip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedHospitalHistory(null)}
                className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Hospital Deletion */}
      <ConfirmModal
        isOpen={!!hospitalToDelete}
        title="Delete Hospital Record"
        message={`Are you sure you want to delete "${hospitalToDelete?.name}"?`}
        subMessage="This hospital record, department/store information, and balance tracking will be removed."
        confirmLabel="Delete Hospital"
        onConfirm={() => {
          if (hospitalToDelete) {
            deleteHospital(hospitalToDelete.id);
            setHospitalToDelete(null);
          }
        }}
        onClose={() => setHospitalToDelete(null)}
      />
    </div>
  );
};

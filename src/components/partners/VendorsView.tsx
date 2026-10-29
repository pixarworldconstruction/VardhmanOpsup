import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vendor } from '../../types';
import {
  Users2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  History,
  ArrowDownToLine,
  CreditCard,
  Building2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

interface VendorsViewProps {
  onOpenNewVendor: () => void;
  onEditVendor: (vendor: Vendor) => void;
  onOpenNewPurchaseForVendor?: (vendorId: string) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  onOpenNewVendor,
  onEditVendor,
  onOpenNewPurchaseForVendor,
}) => {
  const { vendors, deleteVendor, purchases } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorHistory, setSelectedVendorHistory] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const filteredVendors = vendors.filter((v) => {
    return (
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.gstin && v.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalPayable = vendors.reduce((sum, v) => sum + (v.balancePayable || 0), 0);

  const currentHistoryVendor = selectedVendorHistory
    ? vendors.find((v) => v.id === selectedVendorHistory.id) || selectedVendorHistory
    : null;

  const vendorPurchases = currentHistoryVendor
    ? purchases.filter((p) => p.vendorId === currentHistoryVendor.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Vendor & Supplier Databases (Medical Stores & Manufacturers)
          </h2>
          <p className="text-xs text-slate-500">
            Wholesale suppliers of operation materials with purchase histories and balance payables
          </p>
        </div>

        <button
          onClick={onOpenNewVendor}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vendor Store</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Active Vendor Stores</span>
          <div className="mt-1 text-lg font-bold text-slate-900">{vendors.length} Suppliers</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Balance Payable</span>
          <div className="mt-1 text-lg font-bold text-amber-700">{formatCurrency(totalPayable)}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold text-teal-800">Supply Pipeline</span>
          <div className="mt-1 text-xs font-semibold text-teal-900">
            Surgical Consumables, Laparoscopy, Implants & Anesthesia
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors by store name, contact person, city, or GSTIN..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredVendors.map((v) => {
          const vPurchases = purchases.filter((p) => p.vendorId === v.id);
          const totalPurchased = vPurchases.reduce((sum, p) => sum + p.grandTotal, 0);

          return (
            <div
              key={v.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Users2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{v.name}</h3>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                            v.vendorType === 'Manufacturer'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {v.vendorType || 'Wholesaler'}
                        </span>
                      </div>
                      <span className="inline-block text-[11px] text-slate-500">
                        {v.city}, {v.state}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Balance Payable</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        (v.balancePayable || 0) > 0 ? 'text-amber-700' : 'text-slate-700'
                      }`}
                    >
                      {formatCurrency(v.balancePayable || 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{v.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{v.phone} ({v.contactPerson})</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    GSTIN: {v.gstin} {v.drugLicenseNo ? `• DL: ${v.drugLicenseNo}` : ''}
                  </div>
                  {v.notes && (
                    <div className="text-[11px] text-slate-500 italic truncate">
                      {v.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Metrics & Actions */}
              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>{vPurchases.length} Shipments</span> • <span>{formatCurrency(totalPurchased)} Total</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {onOpenNewPurchaseForVendor && (
                    <button
                      onClick={() => onOpenNewPurchaseForVendor(v.id)}
                      className="flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition"
                      title="Enter Purchase Invoice from this Supplier"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Purchase</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedVendorHistory(v)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    title="View Transaction History"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ledger</span>
                  </button>

                  <button
                    onClick={() => onEditVendor(v)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    title="Edit Wholesaler / Manufacturer Profile Details"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVendorToDelete(v)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Vendor"
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
      {currentHistoryVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Vendor Ledger: {currentHistoryVendor.name}
                  </h3>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      currentHistoryVendor.vendorType === 'Manufacturer'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {currentHistoryVendor.vendorType || 'Wholesaler'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Contact: {currentHistoryVendor.contactPerson} • Balance Payable: {formatCurrency(currentHistoryVendor.balancePayable || 0)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = currentHistoryVendor;
                    setSelectedVendorHistory(null);
                    onEditVendor(target);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title="Edit Wholesaler / Manufacturer Profile"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setSelectedVendorHistory(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ArrowDownToLine className="w-4 h-4 text-teal-600" />
                <span>Inward Purchases & Shipments ({vendorPurchases.length})</span>
              </h4>

              {vendorPurchases.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No purchase vouchers found for this vendor yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {vendorPurchases.map((pur) => (
                    <div
                      key={pur.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{pur.purchaseNumber}</span>
                          <span className="font-mono text-[10px] text-slate-500">Bill: {pur.vendorBillNumber}</span>
                          <span
                            className={`rounded-md px-1.5 py-0.2 text-[10px] font-semibold border ${
                              pur.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {pur.paymentStatus}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Date: {formatDate(pur.date)} • {pur.items.length} items ({pur.items.reduce((s, i) => s + i.quantity, 0)} units)
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatCurrency(pur.grandTotal)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Mode: {pur.paymentMode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedVendorHistory(null)}
                className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Vendor Deletion */}
      <ConfirmModal
        isOpen={!!vendorToDelete}
        title="Delete Vendor Record"
        message={`Are you sure you want to delete "${vendorToDelete?.name}"?`}
        subMessage="This will remove the vendor profile and contact details from your records."
        confirmLabel="Delete Vendor"
        onConfirm={() => {
          if (vendorToDelete) {
            deleteVendor(vendorToDelete.id);
            setVendorToDelete(null);
          }
        }}
        onClose={() => setVendorToDelete(null)}
      />
    </div>
  );
};

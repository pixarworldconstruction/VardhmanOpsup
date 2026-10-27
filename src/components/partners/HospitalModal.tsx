import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Hospital } from '../../types';
import { Building2, X, Save } from 'lucide-react';

interface HospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalToEdit?: Hospital | null;
}

export const HospitalModal: React.FC<HospitalModalProps> = ({
  isOpen,
  onClose,
  hospitalToEdit,
}) => {
  const { addHospital, updateHospital } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    departmentStore: 'Central Operation Theatre (OT) Store',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    gstin: '',
    hospitalRegNo: '',
    outstandingBalance: 0,
    creditLimit: 200000,
    notes: '',
  });

  useEffect(() => {
    if (hospitalToEdit) {
      setFormData({
        name: hospitalToEdit.name,
        departmentStore: hospitalToEdit.departmentStore,
        contactPerson: hospitalToEdit.contactPerson,
        phone: hospitalToEdit.phone,
        email: hospitalToEdit.email,
        address: hospitalToEdit.address,
        city: hospitalToEdit.city,
        state: hospitalToEdit.state,
        gstin: hospitalToEdit.gstin,
        hospitalRegNo: hospitalToEdit.hospitalRegNo || '',
        outstandingBalance: hospitalToEdit.outstandingBalance || 0,
        creditLimit: hospitalToEdit.creditLimit || 200000,
        notes: hospitalToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        departmentStore: 'Central OT Store',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: 'Ahmedabad',
        state: 'Gujarat',
        gstin: '',
        hospitalRegNo: '',
        outstandingBalance: 0,
        creditLimit: 200000,
        notes: '',
      });
    }
  }, [hospitalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hospitalToEdit) {
      updateHospital({
        ...hospitalToEdit,
        ...formData,
        outstandingBalance: Number(formData.outstandingBalance),
        creditLimit: Number(formData.creditLimit),
      });
    } else {
      addHospital({
        ...formData,
        outstandingBalance: Number(formData.outstandingBalance),
        creditLimit: Number(formData.creditLimit),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {hospitalToEdit ? 'Edit Hospital / OT Store' : 'Add New Hospital / Customer Store'}
              </h3>
              <p className="text-xs text-slate-500">
                Hospital profile and transaction ledger records
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
          <div>
            <label className="block text-xs font-semibold text-slate-700">Hospital Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Apex Multispeciality Hospital"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Department / Store Name *</label>
            <input
              type="text"
              required
              value={formData.departmentStore}
              onChange={(e) => setFormData({ ...formData, departmentStore: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Central OT Store, Trauma OT Pharmacy, Cath Lab"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Contact Person / OT Sister In-charge</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="e.g. Sister Rosamma / Mr. Hardik"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone / Mobile *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="+91 94280 12345"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="otstore@hospital.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Hospital GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                placeholder="24AABCS9821L1ZM"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Delivery Address *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="Full address where Delivery Challans and materials are dispatched"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Credit Limit (₹)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Special Delivery / OT Instructions</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Batch certificates required. Morning delivery before 11 AM."
            />
          </div>

          {/* Footer */}
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
              <span>{hospitalToEdit ? 'Save Changes' : 'Add Hospital'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Vendor, VendorType } from '../../types';
import { Users2, X, Save } from 'lucide-react';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorToEdit?: Vendor | null;
}

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  vendorToEdit,
}) => {
  const { addVendor, updateVendor } = useApp();

  const [formData, setFormData] = useState({
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
    panNo: '',
    balancePayable: 0,
    paymentTermsDays: 30,
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    notes: '',
  });

  useEffect(() => {
    if (vendorToEdit) {
      setFormData({
        name: vendorToEdit.name,
        vendorType: vendorToEdit.vendorType || 'Wholesaler',
        contactPerson: vendorToEdit.contactPerson,
        phone: vendorToEdit.phone,
        email: vendorToEdit.email,
        address: vendorToEdit.address,
        city: vendorToEdit.city,
        state: vendorToEdit.state,
        gstin: vendorToEdit.gstin,
        drugLicenseNo: vendorToEdit.drugLicenseNo || '',
        panNo: vendorToEdit.panNo || '',
        balancePayable: vendorToEdit.balancePayable || 0,
        paymentTermsDays: vendorToEdit.paymentTermsDays || 30,
        bankName: vendorToEdit.bankName || '',
        bankAccountNo: vendorToEdit.bankAccountNo || '',
        bankIfsc: vendorToEdit.bankIfsc || '',
        notes: vendorToEdit.notes || '',
      });
    } else {
      setFormData({
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
        panNo: '',
        balancePayable: 0,
        paymentTermsDays: 30,
        bankName: '',
        bankAccountNo: '',
        bankIfsc: '',
        notes: '',
      });
    }
  }, [vendorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorToEdit) {
      updateVendor({
        ...vendorToEdit,
        ...formData,
        balancePayable: Number(formData.balancePayable),
        paymentTermsDays: Number(formData.paymentTermsDays),
      });
    } else {
      addVendor({
        ...formData,
        balancePayable: Number(formData.balancePayable),
        paymentTermsDays: Number(formData.paymentTermsDays),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {vendorToEdit ? 'Edit Wholesaler / Manufacturer Profile' : 'Add New Wholesaler / Manufacturer'}
              </h3>
              <p className="text-xs text-slate-500">
                {vendorToEdit ? `Updating profile details for ${vendorToEdit.name}` : 'Register a new operation material supplier'}
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Wholesaler / Manufacturer / Store Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="e.g. Apex Meditech Wholesale, EndoCraft Devices"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Supplier Type *</label>
              <select
                value={formData.vendorType}
                onChange={(e) => setFormData({ ...formData, vendorType: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              >
                <option value="Wholesaler">Wholesaler Store</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor / Stockist">Distributor / Stockist</option>
                <option value="C&F Agent">C&F Agent</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="e.g. Rajendra Sharma"
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
                placeholder="+91 98980 12345"
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
                placeholder="sales@vendorstore.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">GSTIN *</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                placeholder="24AABCA5567R1ZD"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Drug License No. (DL 20B/21B)</label>
              <input
                type="text"
                value={formData.drugLicenseNo}
                onChange={(e) => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                placeholder="GJ-20B-11200 / 21B-11201"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">PAN Number</label>
              <input
                type="text"
                value={formData.panNo}
                onChange={(e) => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                placeholder="ABCDE1234F"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Store / Warehouse Address *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="Shop No, Medical Complex, Depot location"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Credit Terms (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.paymentTermsDays}
                onChange={(e) => setFormData({ ...formData, paymentTermsDays: parseInt(e.target.value, 10) || 30 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Banking & Outstanding Balance Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Banking & Account Payable Ledger
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                  placeholder="e.g. HDFC Bank, SBI"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNo}
                  onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                  placeholder="HDFC0001234"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Current Balance Payable to Supplier (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.balancePayable}
                onChange={(e) => setFormData({ ...formData, balancePayable: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-amber-700 focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Auto-calculated from unpaid inward purchases, or edit directly.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Notes / Major Categories Supplied</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Main supplier for laparoscopy clips, trocars and surgical drapes"
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
              <span>{vendorToEdit ? 'Save Changes' : 'Add Vendor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

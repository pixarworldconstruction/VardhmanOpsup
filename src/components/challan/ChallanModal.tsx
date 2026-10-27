import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryChallanItem, ProductUnit } from '../../types';
import { Truck, X, Plus, Trash2, Save } from 'lucide-react';

interface ChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallanModal: React.FC<ChallanModalProps> = ({ isOpen, onClose }) => {
  const { hospitals, products, addDeliveryChallan, challans } = useApp();

  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transporterOrPerson, setTransporterOrPerson] = useState('In-house Dispatch Staff (Manoj)');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-ET-4819');
  const [remarks, setRemarks] = useState('Sterile packing checked. Deliver to OT Sister In-charge.');

  const selectedHospital = hospitals.find((h) => h.id === hospitalId) || hospitals[0];
  const initialProduct = products[0];

  const [items, setItems] = useState<DeliveryChallanItem[]>([
    {
      productId: initialProduct?.id || '',
      productName: initialProduct?.name || '',
      batchNumber: initialProduct?.batchNumber || 'BAT-2026',
      expiryDate: initialProduct?.expiryDate || '2028-12',
      quantity: 5,
      unit: (initialProduct?.unit || 'Box') as ProductUnit,
      packagingDetails: 'Sterile Corrugated Carton',
    },
  ]);

  if (!isOpen) return null;

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find((p) => p.id === pId);
    if (!prod) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      productName: prod.name,
      batchNumber: prod.batchNumber || newItems[index].batchNumber,
      expiryDate: prod.expiryDate || newItems[index].expiryDate,
      unit: prod.unit,
    };
    setItems(newItems);
  };

  const handleFieldChange = (index: number, field: keyof DeliveryChallanItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItemRow = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        batchNumber: defaultProd?.batchNumber || 'BAT-NEW',
        expiryDate: defaultProd?.expiryDate || '2028-12',
        quantity: 5,
        unit: (defaultProd?.unit || 'Box') as ProductUnit,
        packagingDetails: 'Sterile Pack',
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const challanNum = `DC-VO-2026-00${challans.length + 37}`;

    addDeliveryChallan({
      challanNumber: challanNum,
      date,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      departmentStore: selectedHospital.departmentStore,
      deliveryAddress: selectedHospital.address,
      transporterOrPerson,
      vehicleNumber,
      items,
      status: 'Dispatched',
      remarks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Create Hospital Delivery Challan (Dispatch Slip)
              </h3>
              <p className="text-xs text-slate-500">
                Official delivery acknowledgment for Hospital Operation Theatres & OT Stores
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
          <div className="grid gap-3 sm:grid-cols-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Hospital Destination *</label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.departmentStore}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-slate-500 truncate">
                Address: {selectedHospital?.address}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Dispatch Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Transporter / Delivery Person *</label>
              <input
                type="text"
                required
                value={transporterOrPerson}
                onChange={(e) => setTransporterOrPerson(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
                placeholder="e.g. Express Courier / Manoj (Rider)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Vehicle / Tracking Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                placeholder="e.g. GJ-01-ET-4819"
              />
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Dispatched Operation Materials
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="p-2.5">Material Description</th>
                    <th className="p-2.5 w-24">Batch</th>
                    <th className="p-2.5 w-24">Expiry</th>
                    <th className="p-2.5 w-20 text-center">Qty</th>
                    <th className="p-2.5">Packaging Details</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-2">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full rounded border border-slate-200 p-1.5 text-xs bg-white focus:outline-none focus:border-teal-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => handleFieldChange(idx, 'batchNumber', e.target.value)}
                          className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.expiryDate}
                          onChange={(e) => handleFieldChange(idx, 'expiryDate', e.target.value)}
                          className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleFieldChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.packagingDetails || ''}
                          onChange={(e) => handleFieldChange(idx, 'packagingDetails', e.target.value)}
                          className="w-full rounded border border-slate-200 p-1.5 text-xs"
                          placeholder="e.g. 1 Master Box"
                        />
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Special Instructions / Dispatch Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Deliver before OT start at 9:00 AM"
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
              <span>Create Delivery Challan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

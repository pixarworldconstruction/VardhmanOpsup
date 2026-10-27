import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvoiceItem, ProductUnit, SalesInvoice } from '../../types';
import { ShoppingCart, X, Plus, Trash2, AlertCircle, Save, FileDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (newInvoice: SalesInvoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const { hospitals, products, addInvoice, invoices, challans } = useApp();

  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deliveryChallanRef, setDeliveryChallanRef] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI'>('Bank Transfer');
  const [notes, setNotes] = useState('');

  // Default line item
  const selectedHospital = hospitals.find((h) => h.id === hospitalId) || hospitals[0];
  const initialProduct = products[0];

  const createInitialLineItem = (): InvoiceItem => {
    const prod = initialProduct;
    const qty = 5;
    const price = prod?.sellingPrice || 1000;
    const disc = 0;
    const taxable = qty * price;
    const gst = prod?.gstRate || 12;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    return {
      productId: prod?.id || '',
      productName: prod?.name || '',
      code: prod?.code || '',
      hsnCode: prod?.hsnCode || '3006',
      batchNumber: prod?.batchNumber || 'VJ2481A',
      expiryDate: prod?.expiryDate || '2027-12',
      quantity: qty,
      unit: (prod?.unit || 'Box') as ProductUnit,
      unitPrice: price,
      discountPercent: disc,
      taxableAmount: taxable,
      gstRate: gst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: taxable + cgst + sgst,
    };
  };

  const [items, setItems] = useState<InvoiceItem[]>([createInitialLineItem()]);

  if (!isOpen) return null;

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find((p) => p.id === pId);
    if (!prod) return;

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const price = prod.sellingPrice || 0;
    const disc = newItems[index].discountPercent || 0;
    const discountedPrice = price * (1 - disc / 100);
    const taxable = qty * discountedPrice;
    const gst = prod.gstRate || 12;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      productName: prod.name,
      code: prod.code,
      hsnCode: prod.hsnCode || '3006',
      unit: prod.unit,
      batchNumber: prod.batchNumber || newItems[index].batchNumber,
      expiryDate: prod.expiryDate || newItems[index].expiryDate,
      unitPrice: price,
      gstRate: gst,
      taxableAmount: taxable,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: taxable + cgst + sgst,
    };
    setItems(newItems);
  };

  const handleItemFieldChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const discountedPrice = price * (1 - disc / 100);
    const taxable = qty * discountedPrice;
    const gst = Number(item.gstRate) || 0;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    item.taxableAmount = taxable;
    item.cgstAmount = cgst;
    item.sgstAmount = sgst;
    item.totalAmount = taxable + cgst + sgst;

    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    const prod = products[0];
    const price = prod?.sellingPrice || 1000;
    const gst = prod?.gstRate || 12;
    const taxable = 5 * price;
    const cgst = (taxable * (gst / 2)) / 100;
    const sgst = (taxable * (gst / 2)) / 100;

    setItems([
      ...items,
      {
        productId: prod?.id || '',
        productName: prod?.name || '',
        code: prod?.code || '',
        hsnCode: prod?.hsnCode || '3006',
        batchNumber: prod?.batchNumber || '',
        expiryDate: prod?.expiryDate || '',
        quantity: 5,
        unit: (prod?.unit || 'Box') as ProductUnit,
        unitPrice: price,
        discountPercent: 0,
        taxableAmount: taxable,
        gstRate: gst,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount: taxable + cgst + sgst,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxableTotal = items.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalDiscount = rawSubtotal - taxableTotal;
  const cgstTotal = items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const sgstTotal = items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalWithTaxes = taxableTotal + cgstTotal + sgstTotal;
  const roundedGrandTotal = Math.round(totalWithTaxes);
  const roundOff = Number((roundedGrandTotal - totalWithTaxes).toFixed(2));

  // Check if any item exceeds available stock
  const stockWarnings = items.map((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return null;
    if (item.quantity > prod.currentStock) {
      return `${prod.name}: Requested ${item.quantity} ${prod.unit}, but only ${prod.currentStock} in stock`;
    }
    return null;
  }).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hosp = hospitals.find((h) => h.id === hospitalId) || hospitals[0];
    const invoiceNum = `VO/2026-27/0${invoices.length + 104}`;

    const newInvoiceData: Omit<SalesInvoice, 'id' | 'createdAt'> = {
      invoiceNumber: invoiceNum,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      departmentStore: hosp.departmentStore,
      hospitalGstin: hosp.gstin,
      hospitalAddress: hosp.address,
      date,
      dueDate,
      deliveryChallanRef: deliveryChallanRef || undefined,
      items,
      subtotal: rawSubtotal,
      totalDiscount,
      taxableTotal,
      cgstTotal,
      sgstTotal,
      roundOff,
      grandTotal: roundedGrandTotal,
      paymentStatus,
      amountPaid: paymentStatus === 'Paid' ? roundedGrandTotal : amountPaid,
      paymentMode,
      notes,
    };

    addInvoice(newInvoiceData);

    if (onInvoiceCreated) {
      onInvoiceCreated({
        ...newInvoiceData,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Generate Automated Sales Invoice (Hospital / Store)
              </h3>
              <p className="text-xs text-teal-700 font-medium">
                ★ Stock will automatically deduct from inventory upon saving
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
          {/* Customer / Hospital Header */}
          <div className="grid gap-3 sm:grid-cols-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Hospital / Customer *</label>
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
                GSTIN: {selectedHospital?.gstin || 'None'} • {selectedHospital?.address}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Invoice Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <label className="text-xs font-medium text-slate-700 shrink-0">
                Delivery Challan Ref (Optional):
              </label>
              <select
                value={deliveryChallanRef}
                onChange={(e) => setDeliveryChallanRef(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
              >
                <option value="">No Challan Linked (Direct Invoice)</option>
                {challans.map((c) => (
                  <option key={c.id} value={c.challanNumber}>
                    {c.challanNumber} — {c.hospitalName} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Alert Warning if any */}
          {stockWarnings.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Inventory Warning:</strong> Some items have requested quantity exceeding live stock.
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-amber-800">
                  {stockWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Invoice Items Table */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Operation Materials & Consumables
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Material Row</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="p-2.5">Material & Available Stock</th>
                    <th className="p-2.5 w-24">Batch</th>
                    <th className="p-2.5 w-20 text-center">Qty</th>
                    <th className="p-2.5 w-24 text-right">Price (₹)</th>
                    <th className="p-2.5 w-16 text-center">Disc %</th>
                    <th className="p-2.5 w-16 text-center">GST %</th>
                    <th className="p-2.5 w-24 text-right">Total (₹)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, idx) => {
                    const matchedProd = products.find((p) => p.id === item.productId);
                    const stock = matchedProd ? matchedProd.currentStock : 0;
                    const isExceeded = item.quantity > stock;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full rounded border border-slate-200 p-1.5 text-xs bg-white focus:outline-none focus:border-teal-500"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Stock: {p.currentStock} {p.unit})
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            <span>HSN: {item.hsnCode}</span>
                            <span
                              className={`font-semibold ${
                                isExceeded ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            >
                              Available: {stock} {item.unit}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => handleItemFieldChange(idx, 'batchNumber', e.target.value)}
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                            }
                            className={`w-full rounded border p-1.5 text-xs font-mono text-center ${
                              isExceeded ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-slate-200'
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-right"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'discountPercent', parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs font-mono text-center"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={item.gstRate}
                            onChange={(e) =>
                              handleItemFieldChange(idx, 'gstRate', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full rounded border border-slate-200 p-1.5 text-xs text-center"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(item.totalAmount)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Breakdown & Calculations Card */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                  >
                    <option value="Unpaid">Unpaid (30-Day Credit)</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Paid">Paid in Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Hospital Cheque</option>
                    <option value="UPI">UPI Digital</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'Partial' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Amount Received (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={roundedGrandTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">Invoice Remarks / OT Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
                  placeholder="e.g. Urgent morning surgical schedule delivery"
                />
              </div>
            </div>

            {/* Tax & Total Calculation Widget */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Material Subtotal:</span>
                <span className="font-mono">{formatCurrency(rawSubtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Volume Discount:</span>
                  <span className="font-mono">-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Taxable Value:</span>
                <span className="font-mono">{formatCurrency(taxableTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (Central Tax):</span>
                <span className="font-mono">{formatCurrency(cgstTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (State Tax):</span>
                <span className="font-mono">{formatCurrency(sgstTotal)}</span>
              </div>
              {roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round-off:</span>
                  <span className="font-mono">{roundOff > 0 ? `+${roundOff}` : roundOff}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Invoice Total:</span>
                <span className="font-mono text-teal-800">{formatCurrency(roundedGrandTotal)}</span>
              </div>
              <div className="text-[11px] text-teal-700 font-medium pt-1">
                ✔ Stock will automatically decrease by {items.reduce((sum, i) => sum + i.quantity, 0)} units upon generation.
              </div>
            </div>
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
              <span>Generate Invoice & Deduct Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

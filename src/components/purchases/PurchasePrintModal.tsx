import React from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseTransaction } from '../../types';
import { X, Printer, Download, ArrowDownToLine, Users2 } from 'lucide-react';
import { exportPurchaseVoucherPDF } from '../../utils/pdfGenerator';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PurchasePrintModalProps {
  purchase: PurchaseTransaction | null;
  onClose: () => void;
}

export const PurchasePrintModal: React.FC<PurchasePrintModalProps> = ({ purchase, onClose }) => {
  const { storeProfile } = useApp();

  if (!purchase) return null;

  const handleDownloadPDF = () => {
    exportPurchaseVoucherPDF(purchase, storeProfile);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPurchasedUnits = purchase.items.reduce((s, i) => s + Number(i.quantity), 0);
  const totalFreeUnits = purchase.items.reduce((s, i) => s + Number(i.freeQuantity || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800">
              Inward Purchase Voucher: {purchase.purchaseNumber}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                purchase.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {purchase.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
              title="Download vector PDF Purchase Slip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Purchase Voucher Container */}
        <div id="printable-purchase" className="p-6 sm:p-8 bg-white text-slate-800 text-xs font-sans">
          {/* Top Brand Banner */}
          <div className="h-2 bg-slate-900 rounded-t w-full mb-4" />

          {/* Letterhead (Buyer: Vardhman Opsup) */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {storeProfile.name.toUpperCase()}
              </h1>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">
                {storeProfile.tagline}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-md">
                Warehouse / Receiving Hub: {storeProfile.warehouseAddress}
              </p>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Phone: {storeProfile.phone} | Email: {storeProfile.email}
              </div>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                GSTIN: {storeProfile.gstin} | DL No: {storeProfile.drugLicenseNo}
              </div>
            </div>

            {/* Voucher Badge */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-right shrink-0 w-full sm:w-auto">
              <div className="text-sm font-extrabold text-teal-800 uppercase tracking-wider">
                INWARD PURCHASE VOUCHER
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-slate-900">
                {purchase.purchaseNumber}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Date: <strong>{formatDate(purchase.date)}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Supplier Bill: <strong>{purchase.vendorBillNumber}</strong>
              </div>
              {purchase.transportLRNumber && (
                <div className="text-[11px] text-slate-500 font-mono">
                  LR: {purchase.transportLRNumber}
                </div>
              )}
            </div>
          </div>

          {/* Wholesaler / Manufacturer Profile Details Box */}
          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-teal-700" />
              <span>PURCHASED FROM ({purchase.vendorType || 'WHOLESALER'} / MANUFACTURER):</span>
            </span>
            <div className="mt-1.5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{purchase.vendorName}</h3>
                <div className="text-xs text-slate-700">
                  Contact: <strong>{purchase.vendorContactPerson || 'Sales Desk'}</strong> • Phone: {purchase.vendorPhone || 'N/A'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Store / Depot: {purchase.vendorAddress || 'Store Depot'}
                </div>
              </div>
              <div className="text-left sm:text-right font-mono text-xs">
                <div>GSTIN: <strong>{purchase.vendorGstin || 'URP / Not Provided'}</strong></div>
                {purchase.vendorDrugLicenseNo && (
                  <div className="text-[11px] text-slate-600">DL: {purchase.vendorDrugLicenseNo}</div>
                )}
                <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                  Payment Status: {purchase.paymentStatus} ({purchase.paymentMode})
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2 border border-slate-700 text-center w-8">#</th>
                  <th className="p-2 border border-slate-700">Operation / Medical Material Item</th>
                  <th className="p-2 border border-slate-700 text-center w-20">Batch</th>
                  <th className="p-2 border border-slate-700 text-center w-20">Expiry</th>
                  <th className="p-2 border border-slate-700 text-center w-20">Inward Qty</th>
                  <th className="p-2 border border-slate-700 text-right w-20">Cost Rate (₹)</th>
                  <th className="p-2 border border-slate-700 text-right w-24">Taxable (₹)</th>
                  <th className="p-2 border border-slate-700 text-center w-14">GST</th>
                  <th className="p-2 border border-slate-700 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {purchase.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 font-semibold text-slate-900">
                      {item.productName}
                      {item.productCode && (
                        <span className="block text-[10px] text-slate-400 font-mono">{item.productCode}</span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.batchNumber}</td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.expiryDate}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold font-mono">
                      {item.quantity} {item.unit}
                      {item.freeQuantity ? (
                        <span className="block text-[10px] text-emerald-600 font-normal">+{item.freeQuantity} Free</span>
                      ) : null}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-medium">
                      {(item.taxableAmount ?? (item.quantity * item.unitPrice)).toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.gstRate}%</td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-slate-900">
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Totals */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 items-start">
            <div className="text-xs text-slate-600 space-y-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="font-semibold text-slate-800 block mb-1">Inward Inventory Summary:</span>
                <div>Total Stocked Quantity: <strong>{totalPurchasedUnits + totalFreeUnits} Units</strong></div>
                {purchase.notes && (
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    Inspection Remarks: {purchase.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Material Taxable Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(purchase.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Input GST Tax Amount:</span>
                <span className="font-mono">{formatCurrency(purchase.totalTax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-1.5 text-base font-extrabold text-slate-900">
                <span>Total Inward Value:</span>
                <span className="font-mono text-teal-900">{formatCurrency(purchase.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Verification sign off */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
            <div className="text-[10px] text-slate-400">
              Verified by Vardhman Opsup Receiving & Stock Audit Desk
            </div>
            <div className="text-right">
              <div className="h-10" />
              <div className="text-[11px] text-slate-600 border-t border-slate-300 pt-1 px-4 inline-block font-medium">
                Store Pharmacist / Stock In-charge Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryChallan } from '../../types';
import { X, Printer, Download, Truck } from 'lucide-react';
import { exportChallanPDF } from '../../utils/pdfGenerator';
import { formatDate } from '../../utils/formatters';

interface ChallanPrintModalProps {
  challan: DeliveryChallan | null;
  onClose: () => void;
  onConvertToInvoice?: (challanId: string) => void;
}

export const ChallanPrintModal: React.FC<ChallanPrintModalProps> = ({
  challan,
  onClose,
  onConvertToInvoice,
}) => {
  const { storeProfile } = useApp();

  if (!challan) return null;

  const handleDownloadPDF = () => {
    exportChallanPDF(challan, storeProfile);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800">
              Delivery Challan: {challan.challanNumber}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                challan.status === 'Invoiced'
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : challan.status === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {challan.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {challan.status !== 'Invoiced' && onConvertToInvoice && (
              <button
                onClick={() => {
                  onConvertToInvoice(challan.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-300 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition"
              >
                <span>Generate Invoice from Challan</span>
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
              title="Download official PDF Delivery Slip"
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

        {/* Printable Delivery Challan */}
        <div id="printable-challan" className="p-6 sm:p-8 bg-white text-slate-800 text-xs font-sans">
          {/* Top Brand Banner */}
          <div className="h-2 bg-teal-700 rounded-t w-full mb-4" />

          {/* Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {storeProfile.name.toUpperCase()}
              </h1>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">
                {storeProfile.tagline}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-md">
                Office: {storeProfile.officeAddress}
              </p>
              <p className="text-[11px] text-slate-500">
                Warehouse: {storeProfile.warehouseAddress}
              </p>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                GSTIN: {storeProfile.gstin} | DL No: {storeProfile.drugLicenseNo}
              </div>
            </div>

            {/* Challan Badge */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-right shrink-0 w-full sm:w-auto">
              <div className="text-sm font-extrabold text-teal-900 uppercase tracking-wider">
                DELIVERY CHALLAN
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-slate-900">
                {challan.challanNumber}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Dispatch Date: <strong>{formatDate(challan.date)}</strong>
              </div>
              <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                Status: {challan.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Consignee & Dispatcher Dual Box */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Destination */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DELIVER TO (HOSPITAL / STORE CONSIgNEE):
              </span>
              <div className="mt-1">
                <h3 className="text-sm font-bold text-slate-900">{challan.hospitalName}</h3>
                <p className="text-xs font-semibold text-slate-700">{challan.departmentStore}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{challan.deliveryAddress}</p>
              </div>
            </div>

            {/* Logistics */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DISPATCH & LOGISTICS DETAILS:
              </span>
              <div className="mt-1 space-y-1 text-[11px] text-slate-700">
                <div>Transporter / Bearer: <strong>{challan.transporterOrPerson || 'Direct Store Delivery'}</strong></div>
                <div>Vehicle No: <strong className="font-mono">{challan.vehicleNumber || 'N/A'}</strong></div>
                <div>Condition: <strong>Sterile Sealed Packings Intact</strong></div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-teal-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2 border border-teal-800 text-center w-8">#</th>
                  <th className="p-2 border border-teal-800">Operation / Medical Material Item</th>
                  <th className="p-2 border border-teal-800 text-center w-24">Batch No.</th>
                  <th className="p-2 border border-teal-800 text-center w-20">Expiry</th>
                  <th className="p-2 border border-teal-800 text-center w-24">Dispatched Qty</th>
                  <th className="p-2 border border-teal-800">Packaging & Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {challan.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 font-semibold text-slate-900">
                      {item.productName}
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.batchNumber}</td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.expiryDate}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold font-mono text-teal-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-2 border border-slate-200 text-slate-600">
                      {item.packagingDetails || 'Standard Sealed Pack'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {challan.remarks && (
            <div className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <strong>Delivery Remarks:</strong> {challan.remarks}
            </div>
          )}

          {/* Triple Signatures Box for Hospital Delivery Handover */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-200 p-3 h-28 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  DISPATCHED BY
                </span>
                <span className="text-[10px] text-slate-400">
                  (Store Dispatcher Sign)
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 h-28 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  CHECKED BY
                </span>
                <span className="text-[10px] text-slate-400">
                  (Quality & Batch Verifier)
                </span>
              </div>

              <div className="rounded-xl border border-slate-300 bg-slate-50/50 p-3 h-28 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
                  RECEIVED IN GOOD ORDER
                </span>
                <span className="text-[10px] text-slate-500">
                  (Hospital OT Sister / Store Stamp)
                </span>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-center text-slate-400">
              Please inspect physical seal and batch integrity before signing acknowledgment. Return duplicate copy to delivery bearer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { SalesInvoice } from '../../types';
import { X, Printer, Download, Building2, ShieldCheck } from 'lucide-react';
import { exportInvoicePDF } from '../../utils/pdfGenerator';
import { formatCurrency, formatDate, numberToWords } from '../../utils/formatters';

interface InvoicePrintModalProps {
  invoice: SalesInvoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { storeProfile } = useApp();

  if (!invoice) return null;

  const handleDownloadPDF = () => {
    exportInvoicePDF(invoice, storeProfile);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800">
              Tax Invoice: {invoice.invoiceNumber}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                invoice.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {invoice.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
              title="Download vector PDF file"
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

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-slate-800 text-xs font-sans">
          {/* Top Brand Banner */}
          <div className="h-2 bg-teal-600 rounded-t w-full mb-4" />

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
                {storeProfile.officeAddress}
              </p>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Phone: {storeProfile.phone} | Email: {storeProfile.email}
              </div>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                GSTIN: {storeProfile.gstin} | DL No: {storeProfile.drugLicenseNo}
              </div>
            </div>

            {/* Invoice Meta Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-right shrink-0 w-full sm:w-auto">
              <div className="text-sm font-extrabold text-teal-800 uppercase tracking-wider">
                TAX INVOICE
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Date: <strong>{formatDate(invoice.date)}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Due: <strong>{formatDate(invoice.dueDate)}</strong>
              </div>
              {invoice.deliveryChallanRef && (
                <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                  Challan Ref: {invoice.deliveryChallanRef}
                </div>
              )}
            </div>
          </div>

          {/* Billed To / Hospital Box */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              BILLED & DELIVERED TO (HOSPITAL / STORE):
            </span>
            <div className="mt-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{invoice.hospitalName}</h3>
                <p className="text-xs font-medium text-slate-700">{invoice.departmentStore}</p>
                <p className="text-[11px] text-slate-500">{invoice.hospitalAddress || 'Hospital Main OT Complex'}</p>
              </div>
              <div className="text-left sm:text-right font-mono text-xs">
                <div>GSTIN: <strong>{invoice.hospitalGstin || 'URP'}</strong></div>
                <div className="text-[11px] text-slate-500">Terms: 30 Days Net</div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2 border border-slate-700 text-center w-8">#</th>
                  <th className="p-2 border border-slate-700">Description of Operation Material</th>
                  <th className="p-2 border border-slate-700 text-center w-16">HSN</th>
                  <th className="p-2 border border-slate-700 text-center w-16">Batch</th>
                  <th className="p-2 border border-slate-700 text-center w-16">Exp</th>
                  <th className="p-2 border border-slate-700 text-center w-14">Qty</th>
                  <th className="p-2 border border-slate-700 text-right w-16">Rate (₹)</th>
                  <th className="p-2 border border-slate-700 text-right w-20">Taxable (₹)</th>
                  <th className="p-2 border border-slate-700 text-center w-12">GST</th>
                  <th className="p-2 border border-slate-700 text-right w-20">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 font-medium text-slate-900">
                      {item.productName}
                      <span className="block text-[10px] text-slate-400 font-mono">{item.code}</span>
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.hsnCode}</td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.batchNumber}</td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{item.expiryDate}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold font-mono">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-medium">
                      {item.taxableAmount.toFixed(2)}
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

          {/* Bottom Split: Words & Banking (Left) and Taxes & Grand Total (Right) */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 items-start">
            {/* Left: Words and Bank Details */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount Chargeable (in words):
                </span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800 italic">
                  {numberToWords(invoice.grandTotal)}
                </p>
              </div>

              {/* Bank Details Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Bank Details for Electronic Transfer (NEFT / RTGS)
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <div>Bank: <strong>{storeProfile.bankName}</strong></div>
                  <div>Branch: <strong>{storeProfile.bankBranch}</strong></div>
                  <div>A/C No: <strong className="font-mono">{storeProfile.bankAccountNo}</strong></div>
                  <div>IFSC: <strong className="font-mono">{storeProfile.bankIfsc}</strong></div>
                </div>
                <div className="text-[11px] text-slate-600 pt-0.5">
                  UPI ID: <strong className="font-mono">{storeProfile.upiId}</strong>
                </div>
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Material Value:</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.taxableTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Central GST (CGST):</span>
                <span className="font-mono">{formatCurrency(invoice.cgstTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State GST (SGST):</span>
                <span className="font-mono">{formatCurrency(invoice.sgstTotal)}</span>
              </div>
              {invoice.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round-off:</span>
                  <span className="font-mono">{invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-300 pt-1.5 text-base font-extrabold text-slate-900">
                <span>Invoice Total:</span>
                <span className="font-mono text-teal-900">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions & Signatures */}
          <div className="mt-6 pt-4 border-t border-slate-200 grid sm:grid-cols-2 gap-4 items-end">
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <strong className="text-slate-700">Standard Supply Terms:</strong>
              <p>1. Certified that all surgical consumables comply with sterilization standards.</p>
              <p>2. Payment due strictly within 30 days of invoice date.</p>
              <p>3. Subject to {storeProfile.state} jurisdiction only.</p>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">
                For, {storeProfile.name.toUpperCase()}
              </div>
              <div className="h-12" />
              <div className="text-[11px] text-slate-500 border-t border-slate-300 inline-block pt-1 px-4">
                Authorized Signatory / Medical Store Manager
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

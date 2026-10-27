import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  CreditCard,
  FileText,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportSalesReportPDF } from '../../utils/pdfGenerator';

export const ReportsView: React.FC = () => {
  const { invoices, products, storeProfile, hospitals } = useApp();
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('ALL');

  // Filter invoices based on date range and hospital
  const filteredInvoices = invoices.filter((inv) => {
    const matchesHospital =
      selectedHospitalFilter === 'ALL' || inv.hospitalId === selectedHospitalFilter;

    if (!matchesHospital) return false;

    if (dateRangeFilter === 'ALL') return true;

    const invDate = new Date(inv.date);
    const now = new Date();

    if (dateRangeFilter === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      return inv.date === todayStr;
    }

    if (dateRangeFilter === 'THIS_MONTH') {
      return (
        invDate.getMonth() === now.getMonth() &&
        invDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateRangeFilter === 'LAST_30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return invDate >= thirtyDaysAgo;
    }

    return true;
  });

  // Calculate metrics
  const totalSalesRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalTaxableSales = filteredInvoices.reduce((sum, i) => sum + i.taxableTotal, 0);
  const totalGstCollected = filteredInvoices.reduce(
    (sum, i) => sum + i.cgstTotal + i.sgstTotal + (i.igstTotal || 0),
    0
  );
  const totalCollected = filteredInvoices
    .filter((i) => i.paymentStatus === 'Paid')
    .reduce((sum, i) => sum + i.grandTotal, 0) +
    filteredInvoices
      .filter((i) => i.paymentStatus === 'Partial')
      .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  const totalOutstanding = filteredInvoices
    .filter((i) => i.paymentStatus !== 'Paid')
    .reduce((sum, i) => sum + (i.grandTotal - (i.amountPaid || 0)), 0);

  // Top Products Sold
  const productSalesMap: { [pId: string]: { name: string; qty: number; revenue: number } } = {};
  filteredInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          qty: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.totalAmount;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handleExportPDF = () => {
    const label =
      dateRangeFilter === 'TODAY'
        ? 'Today'
        : dateRangeFilter === 'THIS_MONTH'
        ? 'This Month'
        : dateRangeFilter === 'LAST_30'
        ? 'Last 30 Days'
        : 'All Time';

    exportSalesReportPDF(filteredInvoices, products, storeProfile, label);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Sales & Tax Ledger Reports
          </h2>
          <p className="text-xs text-slate-500">
            Generate and export official sales statements, GST tax breakdowns, and hospital receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition"
            title="Export official vector PDF sales report"
          >
            <Download className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Period:</span>
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'TODAY', label: 'Today' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_30', label: 'Last 30 Days' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setDateRangeFilter(period.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                dateRangeFilter === period.id
                  ? 'bg-teal-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 shrink-0">Hospital:</span>
          <select
            value={selectedHospitalFilter}
            onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="ALL">All Hospitals & Stores</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Gross Sales Revenue
          </span>
          <div className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Across {filteredInvoices.length} Invoices
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            GST Tax Collected
          </span>
          <div className="mt-1 text-xl font-bold tracking-tight text-teal-800">
            {formatCurrency(totalGstCollected)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            CGST + SGST Output Tax
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Cash / Bank Realized
          </span>
          <div className="mt-1 text-xl font-bold tracking-tight text-emerald-700">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            Settled Payments
          </span>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
            Outstanding Due
          </span>
          <div className="mt-1 text-xl font-bold tracking-tight text-rose-700">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[10px] text-rose-600 mt-0.5 block">
            Hospital Credit Receivables
          </span>
        </div>
      </div>

      {/* Top Selling Operation Materials Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Top Moving Operation Materials & Surgical Consumables
        </h3>
        <div className="space-y-3">
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No sales transactions in selected period.</p>
          ) : (
            topProducts.map((p, idx) => {
              const maxRev = topProducts[0]?.revenue || 1;
              const barWidth = Math.round((p.revenue / maxRev) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(p.revenue)} ({p.qty} units)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Itemized Invoices Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filtered Invoices Breakdown
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {filteredInvoices.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Hospital Customer</th>
                <th className="py-2.5 px-3 text-center">Items</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">GST</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {formatDate(inv.date)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {inv.hospitalName}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                    {inv.items.length}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(inv.taxableTotal)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(inv.cgstTotal + inv.sgstTotal)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                        inv.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

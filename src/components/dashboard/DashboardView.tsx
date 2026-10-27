import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Truck,
  Plus,
  ArrowDownToLine,
  Eye,
  FileText,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenNewInvoice: () => void;
  onOpenNewChallan: () => void;
  onOpenNewPurchase: () => void;
  onOpenNewProduct: () => void;
  onViewInvoice: (invoiceId: string) => void;
  onViewChallan: (challanId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewInvoice,
  onOpenNewChallan,
  onOpenNewPurchase,
  onOpenNewProduct,
  onViewInvoice,
  onViewChallan,
}) => {
  const {
    products,
    invoices,
    purchases,
    challans,
    hospitals,
    lowStockProducts,
    setActiveView,
  } = useApp();

  // Metrics
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.purchasePrice,
    0
  );
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalOutstanding = hospitals.reduce(
    (sum, h) => sum + (h.outstandingBalance || 0),
    0
  );
  const totalTaxCollected = invoices.reduce(
    (sum, inv) => sum + inv.cgstTotal + inv.sgstTotal + (inv.igstTotal || 0),
    0
  );

  const recentInvoices = invoices.slice(0, 5);
  const recentChallans = challans.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-5 sm:p-6 text-white shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Operation Material Supply Terminal
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
            Vardhman Opsup Management
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-teal-100/90 max-w-xl">
            Inward purchases from medical stores, automated inventory deduction on sales, GST billing, and OT delivery challans.
          </p>
        </div>

        {/* Quick Action Matrix */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-teal-900 shadow-sm hover:bg-teal-50 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Create Invoice</span>
          </button>
          <button
            onClick={onOpenNewChallan}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600/80 px-3.5 py-2.5 text-xs font-semibold text-white border border-teal-400/30 hover:bg-teal-600 active:scale-95 transition"
          >
            <Truck className="w-4 h-4" />
            <span>Delivery Challan</span>
          </button>
          <button
            onClick={onOpenNewPurchase}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-white border border-slate-700 hover:bg-slate-800 active:scale-95 transition"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Inward Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Stock Valuation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inventory Value
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{products.length} Products in catalog</span>
            <button
              onClick={() => setActiveView('products')}
              className="text-teal-600 hover:underline font-semibold"
            >
              Stock details →
            </button>
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Invoiced
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{invoices.length} Invoices generated</span>
            <button
              onClick={() => setActiveView('sales')}
              className="text-teal-600 hover:underline font-semibold"
            >
              Sales ledger →
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          className={`rounded-2xl border p-4 shadow-2xs transition ${
            lowStockProducts.length > 0
              ? 'border-amber-200 bg-amber-50/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock Alerts
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                lowStockProducts.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {lowStockProducts.length}
            <span className="text-xs font-normal text-slate-500 ml-1">Critical SKUs</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Below reorder limit</span>
            <button
              onClick={() => setActiveView('products')}
              className="text-amber-700 font-semibold hover:underline"
            >
              Replenish →
            </button>
          </div>
        </div>

        {/* Hospital Receivables */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Receivables
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>From {hospitals.length} Hospitals</span>
            <button
              onClick={() => setActiveView('hospitals')}
              className="text-teal-600 hover:underline font-semibold"
            >
              View ledgers →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Sales Invoices & Active Delivery Challans */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Sales Invoices</h3>
              <p className="text-xs text-slate-500">Automated GST calculations & stock deductions</p>
            </div>
            <button
              onClick={() => setActiveView('sales')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition"
            >
              View All ({invoices.length}) →
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/60 rounded-xl px-2 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <FileText className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.paymentStatus === 'Partial'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium truncate max-w-[200px] sm:max-w-xs">
                      {inv.hospitalName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDate(inv.date)} • {inv.items.length} items
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(inv.grandTotal)}
                  </div>
                  <button
                    onClick={() => onViewInvoice(inv.id)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-800"
                  >
                    <span>Print/PDF</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Delivery Challans */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital OT Delivery Challans</h3>
              <p className="text-xs text-slate-500">Operation room dispatches & delivery tracking</p>
            </div>
            <button
              onClick={() => setActiveView('challans')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition"
            >
              View All ({challans.length}) →
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {recentChallans.map((dc) => (
              <div
                key={dc.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/60 rounded-xl px-2 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {dc.challanNumber}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                          dc.status === 'Invoiced'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : dc.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {dc.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium truncate max-w-[200px] sm:max-w-xs">
                      {dc.hospitalName} ({dc.departmentStore})
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDate(dc.date)} • Carrier: {dc.transporterOrPerson || 'Direct'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600">
                    {dc.items.reduce((s, i) => s + i.quantity, 0)} Units
                  </span>
                  <div>
                    <button
                      onClick={() => onViewChallan(dc.id)}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-800"
                    >
                      <span>DC Slip</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

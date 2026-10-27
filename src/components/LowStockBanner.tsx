import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ChevronDown, ChevronUp, ShoppingCart, ArrowRight } from 'lucide-react';

export const LowStockBanner: React.FC<{ onOpenPurchaseModal?: () => void }> = ({ onOpenPurchaseModal }) => {
  const { lowStockProducts, nearExpiryProducts, setActiveView } = useApp();
  const [expanded, setExpanded] = useState(false);

  const totalAlerts = lowStockProducts.length;
  if (totalAlerts === 0 && nearExpiryProducts.length === 0) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/80 transition-all shadow-xs">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-amber-900">
                Automated Inventory Stock Alert
              </span>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                {totalAlerts} items critical
              </span>
            </div>
            <p className="text-[11px] text-amber-700 hidden sm:block">
              Operation material stock levels have dropped below reorder thresholds. Immediate replenishment recommended.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveView('products');
            }}
            className="hidden md:flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition"
          >
            <span>View All in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100/50 transition"
          >
            <span>{expanded ? 'Hide' : 'Review'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-amber-200/70 bg-white/60 p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((p) => {
              const deficit = p.lowStockThreshold - p.currentStock;
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-lg border border-amber-200 bg-white p-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {p.code} • {p.category}
                      </span>
                      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        Deficit: -{deficit} {p.unit}
                      </span>
                    </div>
                    <h4 className="mt-1 font-semibold text-xs text-slate-800 line-clamp-2">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Current Stock: </span>
                      <strong className="text-rose-600 font-bold">{p.currentStock} {p.unit}</strong>
                      <span className="text-[10px] text-slate-400"> (Min: {p.lowStockThreshold})</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveView('purchases');
                        if (onOpenPurchaseModal) onOpenPurchaseModal();
                      }}
                      className="flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-100 transition"
                      title="Restock from Vendor"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  ArrowDownToLine,
  Building2,
  Users2,
  BarChart3,
  AlertTriangle,
  Store,
} from 'lucide-react';

interface SidebarProps {
  onOpenStoreModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenStoreModal }) => {
  const {
    activeView,
    setActiveView,
    lowStockProducts,
    invoices,
    challans,
    products,
    hospitals,
    vendors,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products',
      label: 'Operation Materials',
      icon: Package,
      badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} low` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'sales',
      label: 'Sales & Invoices',
      icon: ShoppingCart,
      badge: invoices.filter((i) => i.paymentStatus !== 'Paid').length > 0 
        ? `${invoices.filter((i) => i.paymentStatus !== 'Paid').length} unpaid` 
        : null,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'challans',
      label: 'Delivery Challans',
      icon: Truck,
      badge: challans.filter((c) => c.status === 'Dispatched').length > 0 
        ? `${challans.filter((c) => c.status === 'Dispatched').length} active` 
        : null,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'purchases',
      label: 'Inward Purchases',
      icon: ArrowDownToLine,
      badge: null,
    },
    {
      id: 'hospitals',
      label: 'Hospitals & OT Stores',
      icon: Building2,
      badge: `${hospitals.length}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'vendors',
      label: 'Vendors & Suppliers',
      icon: Users2,
      badge: `${vendors.length}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'reports',
      label: 'Reports & PDF Export',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Supply Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 shadow-2xs font-bold border border-teal-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-teal-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Low Stock Quick Status Widget */}
        {lowStockProducts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Low Stock Warning</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-700">
              {lowStockProducts.length} items require immediate restocking from vendors.
            </p>
            <button
              onClick={() => setActiveView('products')}
              className="mt-2.5 w-full rounded-lg bg-amber-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-amber-700 transition"
            >
              Review Stock
            </button>
          </div>
        )}
      </div>

      {/* Footer Profile trigger */}
      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={onOpenStoreModal}
          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-slate-50 transition border border-slate-100"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Store className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-800 truncate">Vardhman Opsup</div>
            <div className="text-[10px] text-slate-400 truncate">Edit Store & Bank Info</div>
          </div>
        </button>
      </div>
    </aside>
  );
};

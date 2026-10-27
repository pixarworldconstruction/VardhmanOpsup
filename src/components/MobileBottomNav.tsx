import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Building2,
  Users2,
  BarChart3,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, lowStockProducts, invoices } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    {
      id: 'products',
      label: 'Materials',
      icon: Package,
      alert: lowStockProducts.length > 0,
    },
    {
      id: 'sales',
      label: 'Sales/Inv',
      icon: ShoppingCart,
      alert: invoices.some((i) => i.paymentStatus !== 'Paid'),
    },
    { id: 'challans', label: 'Challan', icon: Truck },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-area-pb">
      <div className="flex h-16 items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative flex flex-col items-center justify-center w-full py-1 transition-all ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.alert && (
                  <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </div>
              <span className="mt-1 text-[10px] tracking-tight truncate max-w-[54px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

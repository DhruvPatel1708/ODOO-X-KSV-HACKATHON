import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, ClipboardList, GitCompare,
  CheckSquare, ShoppingCart, Receipt, Activity, BarChart3, LogOut, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockApprovals } from '../data/mockData';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Vendors', path: '/vendors', icon: Building2 },
  { label: 'RFQs', path: '/rfqs', icon: FileText },
  { label: 'Quotations', path: '/quotations', icon: ClipboardList },
  { label: 'Comparison', path: '/comparison', icon: GitCompare },
  { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: true },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Invoices', path: '/invoices', icon: Receipt },
  { label: 'Activity', path: '/activity', icon: Activity },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
];

const vendorAllowedPaths = ['/quotations', '/purchase-orders', '/activity', '/dashboard'];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pendingCount = mockApprovals.filter(a => a.status === 'pending').length;

  const filteredItems = navItems.filter(item => {
    if (user?.role === 'vendor') {
      return vendorAllowedPaths.includes(item.path);
    }
    return true;
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">VendorBridge</span>
        {mobileOpen && (
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 border-l-[3px] border-brand-500 pl-[9px]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-border p-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-brand-50 text-brand-600 tracking-wide">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="sidebar hidden lg:block fixed left-0 top-0 h-screen z-30"
        style={{ width: 'var(--sidebar-width)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-72 h-full" style={{ animation: 'slideInRight 0.3s ease' }}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

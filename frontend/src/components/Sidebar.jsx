import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, ClipboardList, GitCompare,
  CheckSquare, ShoppingCart, Receipt, Activity, BarChart3, LogOut, X, User, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockApprovals } from '../data/mockData';

/*
  Role-based access matrix:
  ┌──────────────┬───────┬──────┬─────────┬────────┐
  │ Page         │ Admin │ Proc │ Manager │ Vendor │
  ├──────────────┼───────┼──────┼─────────┼────────┤
  │ Dashboard    │  ✓    │  ✓   │   ✓     │   ✓    │
  │ Vendors      │  ✓    │  ✓   │   ✓     │   ✗    │
  │ RFQs         │  ✓    │  ✓   │   ✓     │   ✗    │
  │ Quotations   │  ✓    │  ✓   │   ✓     │   ✓    │
  │ Comparison   │  ✓    │  ✓   │   ✓     │   ✗    │
  │ Approvals    │  ✓    │  ✗   │   ✓     │   ✗    │
  │ POs          │  ✓    │  ✓   │   ✓     │   ✓    │
  │ Invoices     │  ✓    │  ✓   │   ✓     │   ✓    │
  │ Activity     │  ✓    │  ✓   │   ✓     │   ✓    │
  │ Reports      │  ✓    │  ✓   │   ✓     │   ✗    │
  │ Profile      │  ✓    │  ✓   │   ✓     │   ✓    │
  │ Settings     │  ✓    │  ✗   │   ✗     │   ✗    │
  └──────────────┴───────┴──────┴─────────┴────────┘
*/

const navItems = [
  { label: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard, roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Vendors',         path: '/vendors',         icon: Building2,       roles: ['admin', 'procurement_officer', 'manager'] },
  { label: 'RFQs',            path: '/rfqs',            icon: FileText,        roles: ['admin', 'procurement_officer', 'manager'] },
  { label: 'Quotations',      path: '/quotations',      icon: ClipboardList,   roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Comparison',      path: '/comparison',      icon: GitCompare,      roles: ['admin', 'procurement_officer', 'manager'] },
  { label: 'Approvals',       path: '/approvals',       icon: CheckSquare,     roles: ['admin', 'manager'], badge: true },
  { label: 'Purchase Orders', path: '/purchase-orders',  icon: ShoppingCart,    roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Invoices',        path: '/invoices',        icon: Receipt,         roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Activity',        path: '/activity',        icon: Activity,        roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  { label: 'Reports',         path: '/reports',         icon: BarChart3,       roles: ['admin', 'procurement_officer', 'manager'] },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pendingCount = mockApprovals.filter(a => a.status === 'pending').length;

  const filteredItems = navItems.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const sidebarContent = (
    <div className="flex flex-col h-full glass-strong">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-border dark:border-dark-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">VendorBridge</span>
        {mobileOpen && (
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-l-[3px] border-brand-500 pl-[9px]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white'
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
      <div className="border-t border-surface-border dark:border-dark-border p-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 tracking-wide">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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

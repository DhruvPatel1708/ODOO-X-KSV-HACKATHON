import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/vendors': 'Vendors',
  '/rfqs': 'RFQs',
  '/quotations': 'Quotations',
  '/comparison': 'Comparison',
  '/approvals': 'Approvals',
  '/purchase-orders': 'Purchase Orders',
  '/invoices': 'Invoices',
  '/activity': 'Activity Logs',
  '/reports': 'Reports',
};

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || 'VendorBridge';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="navbar bg-white border-b border-surface-border shrink-0 flex items-center px-6 gap-4 z-20"
      style={{ height: 'var(--navbar-height)' }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{pageTitle}</h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-brand-500 focus-within:bg-white transition-all duration-200 w-64">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="ml-2 bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-border py-2 z-50" style={{ animation: 'slideUp 0.2s ease' }}>
            <div className="px-4 py-2 border-b border-surface-border">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => { setShowDropdown(false); alert('Profile settings coming soon!'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => { setShowDropdown(false); alert('Settings coming soon!'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="border-t border-surface-border mt-1 pt-1">
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
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
      className="navbar glass-strong shrink-0 flex items-center px-6 gap-4 z-20 border-b border-surface-border dark:border-dark-border"
      style={{ height: 'var(--navbar-height)' }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-gray-400 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">{pageTitle}</h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-50 dark:bg-dark-card rounded-lg px-3 py-2 border border-transparent focus-within:border-brand-500 focus-within:bg-white dark:focus-within:bg-dark-border transition-all duration-200 w-64">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="ml-2 bg-transparent text-sm outline-none w-full text-gray-700 dark:text-dark-text placeholder:text-gray-400"
        />
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 dark:text-gray-400 transition-all duration-300"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="relative w-5 h-5">
          <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
          <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
        </div>
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name?.split(' ')[0]}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-lg border border-surface-border dark:border-dark-border py-2 z-50" style={{ animation: 'slideUp 0.2s ease' }}>
            <div className="px-4 py-2 border-b border-surface-border dark:border-dark-border">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowDropdown(false); navigate('/profile'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => { setShowDropdown(false); navigate('/settings'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="border-t border-surface-border dark:border-dark-border mt-1 pt-1">
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

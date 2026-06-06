import { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Globe, Lock, Bell, Database, Shield, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    companyName: 'VendorBridge Enterprises Pvt. Ltd.',
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    emailNotifications: true,
    approvalNotifications: true,
    poNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
    autoApproveBelow: '50000',
    requireDualApproval: true,
    gstNumber: '27AABCV1234E1ZT',
    panNumber: 'AABCV1234E',
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/30">
          <Icon className="w-5 h-5 text-brand-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-500' : 'bg-gray-300 dark:bg-dark-border'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure application preferences</p>
      </div>

      {/* Appearance */}
      <Section icon={Sun} title="Appearance">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              darkMode
                ? 'bg-dark-border text-brand-400'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </Section>

      {/* General */}
      <Section icon={Globe} title="General">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name</label>
            <input
              value={settings.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <select
              value={settings.currency}
              onChange={e => handleChange('currency', e.target.value)}
              className="input"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="label">Language</label>
            <select
              value={settings.language}
              onChange={e => handleChange('language', e.target.value)}
              className="input"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
            </select>
          </div>
          <div>
            <label className="label">Timezone</label>
            <select
              value={settings.timezone}
              onChange={e => handleChange('timezone', e.target.value)}
              className="input"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Toggle
          label="Email Notifications"
          description="Receive email alerts for important events"
          checked={settings.emailNotifications}
          onChange={v => handleChange('emailNotifications', v)}
        />
        <Toggle
          label="Approval Alerts"
          description="Notify when an approval is pending review"
          checked={settings.approvalNotifications}
          onChange={v => handleChange('approvalNotifications', v)}
        />
        <Toggle
          label="Purchase Order Alerts"
          description="Notify when a PO is generated or confirmed"
          checked={settings.poNotifications}
          onChange={v => handleChange('poNotifications', v)}
        />
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security">
        <Toggle
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          checked={settings.twoFactorAuth}
          onChange={v => handleChange('twoFactorAuth', v)}
        />
        <div className="max-w-xs">
          <label className="label">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={e => handleChange('sessionTimeout', e.target.value)}
            className="input"
            min="5"
            max="120"
          />
        </div>
      </Section>

      {/* Procurement */}
      <Section icon={Database} title="Procurement Rules">
        <div className="max-w-xs">
          <label className="label">Auto-approve below (₹)</label>
          <input
            type="number"
            value={settings.autoApproveBelow}
            onChange={e => handleChange('autoApproveBelow', e.target.value)}
            className="input"
          />
          <p className="text-xs text-gray-400 mt-1">POs below this amount skip the approval workflow</p>
        </div>
        <Toggle
          label="Require Dual Approval"
          description="Orders above ₹10L require two approvers"
          checked={settings.requireDualApproval}
          onChange={v => handleChange('requireDualApproval', v)}
        />
      </Section>

      {/* Tax Info */}
      <Section icon={Shield} title="Tax & Compliance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">GST Number</label>
            <input
              value={settings.gstNumber}
              onChange={e => handleChange('gstNumber', e.target.value)}
              className="input font-mono"
            />
          </div>
          <div>
            <label className="label">PAN Number</label>
            <input
              value={settings.panNumber}
              onChange={e => handleChange('panNumber', e.target.value)}
              className="input font-mono"
            />
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

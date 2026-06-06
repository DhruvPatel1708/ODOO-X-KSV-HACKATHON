import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import Quotations from './pages/Quotations';
import Comparison from './pages/Comparison';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RoleRoute — renders children only if user has one of the allowed roles.
 * Otherwise redirects to /dashboard.
 */
function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* All roles */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<ActivityLogs />} />

        {/* All roles — but vendors see limited data via page-level RoleGuard */}
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/invoices" element={<Invoices />} />

        {/* Admin, Procurement Officer, Manager only */}
        <Route path="/vendors" element={
          <RoleRoute roles={['admin', 'procurement_officer', 'manager']}>
            <Vendors />
          </RoleRoute>
        } />
        <Route path="/rfqs" element={
          <RoleRoute roles={['admin', 'procurement_officer', 'manager']}>
            <RFQs />
          </RoleRoute>
        } />
        <Route path="/comparison" element={
          <RoleRoute roles={['admin', 'procurement_officer', 'manager']}>
            <Comparison />
          </RoleRoute>
        } />
        <Route path="/reports" element={
          <RoleRoute roles={['admin', 'procurement_officer', 'manager']}>
            <Reports />
          </RoleRoute>
        } />

        {/* Admin and Manager only */}
        <Route path="/approvals" element={
          <RoleRoute roles={['admin', 'manager']}>
            <Approvals />
          </RoleRoute>
        } />

        {/* Admin only */}
        <Route path="/settings" element={
          <RoleRoute roles={['admin']}>
            <SettingsPage />
          </RoleRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

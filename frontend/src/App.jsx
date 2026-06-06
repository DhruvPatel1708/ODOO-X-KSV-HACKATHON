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

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/rfqs" element={<RFQs />} />
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/activity" element={<ActivityLogs />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

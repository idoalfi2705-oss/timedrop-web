import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import Layout from './components/layout/Layout';
import WorkerLayout from './components/layout/WorkerLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Warehouses from './pages/Warehouses';
import Orders from './pages/Orders';
import Workers from './pages/Workers';
import Reports from './pages/Reports';
import WorkerSchedule from './pages/worker/WorkerSchedule';
import WorkerInvoice from './pages/worker/WorkerInvoice';
import WorkerLeave from './pages/worker/WorkerLeave';
import ClientLayout from './components/layout/ClientLayout';
import ClientHome from './pages/client/ClientHome';
import ClientOrders from './pages/client/ClientOrders';
import ClientNewOrder from './pages/client/ClientNewOrder';
import ClientSettings from './pages/client/ClientSettings';
import Settings from './pages/Settings';
import WorkerSettings from './pages/worker/WorkerSettings';
import Items from './pages/Items';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0d2d5e' }}>
      <div style={{ color:'#fff', fontFamily:'Heebo', fontSize:'1.2rem' }}>טוען...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === ROLES.WORKER)   return <Navigate to="/worker"   replace />;
  if (user.role === ROLES.CLIENT)   return <Navigate to="/client"   replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Heebo', direction: 'rtl' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Employer */}
          <Route path="/dashboard" element={
            <PrivateRoute role={ROLES.EMPLOYER}><Layout /></PrivateRoute>
          }>
            <Route index           element={<Dashboard />} />
            <Route path="clients"    element={<Clients />} />
            <Route path="items"      element={<Items />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="orders"     element={<Orders />} />
            <Route path="workers"    element={<Workers />} />
            <Route path="reports"    element={<Reports />} />
            <Route path="settings"   element={<Settings />} />
          </Route>

          {/* Worker */}
          <Route path="/worker" element={
            <PrivateRoute role={ROLES.WORKER}><WorkerLayout /></PrivateRoute>
          }>
            <Route index          element={<WorkerSchedule />} />
            <Route path="invoice" element={<WorkerInvoice />} />
            <Route path="leave"   element={<WorkerLeave />} />
            <Route path="settings" element={<WorkerSettings />} />
          </Route>

          {/* Client */}
          <Route path="/client" element={
            <PrivateRoute role={ROLES.CLIENT}><ClientLayout /></PrivateRoute>
          }>
            <Route index         element={<ClientHome />} />
            <Route path="orders" element={<ClientOrders />} />
            <Route path="new"    element={<ClientNewOrder />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

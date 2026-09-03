import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleGuard from './components/common/RoleGuard';
import DashboardLayout from './components/layout/DashboardLayout';

import PublicLanding from './pages/PublicLanding';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Projects from './pages/Projects';
import Users from './pages/Users';
import ChangePasswordRequired from './pages/panel/ChangePasswordRequired';

import ContactForm from './pages/quotes/ContactForm';
import QuotesInbox from './pages/quotes/QuotesInbox';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/ingresar" element={<Login />} />
          <Route path="/olvide-password" element={<ForgotPassword />} />
          <Route path="/restablecer/:token" element={<ResetPassword />} />

          {/* Public quoting: form only, no login required */}
          <Route path="/cotizar" element={<ContactForm />} />

          {/* Forced password change after a temporary-password login. Kept
              outside the sidebar layout on purpose: a full-screen takeover,
              no nav to wander off into before finishing this step. */}
          <Route
            path="/cambiar-password"
            element={
              <RoleGuard allow={['admin', 'engineer']}>
                <ChangePasswordRequired />
              </RoleGuard>
            }
          />

          {/* Internal panel, protected by role */}
          <Route
            path="/panel"
            element={
              <RoleGuard allow={['admin', 'engineer']}>
                <DashboardLayout />
              </RoleGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="inventario"
              element={
                <RoleGuard allow={['admin', 'engineer']}>
                  <Inventory />
                </RoleGuard>
              }
            />
            <Route
              path="obras"
              element={
                <RoleGuard allow={['admin', 'engineer']}>
                  <Projects />
                </RoleGuard>
              }
            />
            <Route
              path="cotizaciones"
              element={
                <RoleGuard allow={['admin', 'engineer']}>
                  <QuotesInbox />
                </RoleGuard>
              }
            />
            <Route
              path="usuarios"
              element={
                <RoleGuard allow={['admin']}>
                  <Users />
                </RoleGuard>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
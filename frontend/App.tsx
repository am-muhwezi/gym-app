import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ClientsListPage from './pages/ClientsListPage';
import ClientDetailPage from './pages/ClientDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BookingsPage from './pages/BookingsPage';
import TrainersPage from './pages/TrainersPage';
import TrainerDetailPage from './pages/TrainerDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BlockedAccountPage from './pages/BlockedAccountPage';
import ProfilePage from './pages/ProfilePage';

// Terms Redirect Component
const TermsRedirect: React.FC = () => {
  React.useEffect(() => {
    // Get the base URL from environment variables
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    // Direct redirect to backend terms page
    window.location.href = `${apiBaseUrl}/auth/terms/`;
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-dark-900">
      <p className="text-gray-400">Redirecting to Terms and Conditions...</p>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false
}) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-900">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access
  const isAdmin = user?.user_type === 'admin' || user?.is_superuser;

  if (adminOnly && !isAdmin) {
    // Redirect trainers trying to access admin routes
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && isAdmin) {
    // Redirect admins trying to access trainer routes
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-dark-900 text-gray-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-800 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <ClientProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/terms" element={<TermsRedirect />} />
            <Route path="/blocked" element={<BlockedAccountPage />} />

            {/* Protected Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes (SaaS Platform Owner) */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <MainLayout>
                    <AdminDashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers"
              element={
                <ProtectedRoute adminOnly>
                  <MainLayout>
                    <TrainersPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers/:trainerId"
              element={
                <ProtectedRoute adminOnly>
                  <MainLayout>
                    <TrainerDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Trainer Routes (Business Owners) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClientsListPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:clientId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClientDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <BookingsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PaymentsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            </Routes>
          </ClientProvider>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
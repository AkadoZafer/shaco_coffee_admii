import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './layout/AdminLayout';

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminCampaigns = lazy(() => import('./pages/AdminCampaigns'));
const AdminStories = lazy(() => import('./pages/AdminStories'));
const AdminMembers = lazy(() => import('./pages/AdminMembers'));
const AdminBranches = lazy(() => import('./pages/AdminBranches'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminAudit = lazy(() => import('./pages/AdminAudit'));
const AdminFeedbacks = lazy(() => import('./pages/AdminFeedbacks'));
const AdminErrors = lazy(() => import('./pages/AdminErrors'));

function App() {
  const allowAdminSetup = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN_SETUP === 'true';

  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-black text-zinc-200 flex items-center justify-center">Yukleniyor...</div>}>
          <Routes>
            <Route path="/setup" element={allowAdminSetup ? <AdminSetup /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/" element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="campaigns" element={<AdminCampaigns />} />
                <Route path="stories" element={<AdminStories />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="branch" element={<AdminBranches />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="feedbacks" element={<AdminFeedbacks />} />
                <Route path="errors" element={<AdminErrors />} />

              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;

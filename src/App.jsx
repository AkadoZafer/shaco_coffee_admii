import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './layout/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminSetup from './pages/AdminSetup';

import AdminCategories from './pages/AdminCategories';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminStories from './pages/AdminStories';
import AdminMembers from './pages/AdminMembers';
import AdminBranches from './pages/AdminBranches';
import AdminSettings from './pages/AdminSettings';
import AdminAudit from './pages/AdminAudit';
import AdminFeedbacks from './pages/AdminFeedbacks';

function App() {
  const allowAdminSetup = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN_SETUP === 'true';

  return (
    <AdminAuthProvider>
      <BrowserRouter>
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

            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;

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

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/setup" element={<AdminSetup />} />
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

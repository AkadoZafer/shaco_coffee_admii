import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminGuard() {
    const { adminUser, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-shaco-red animate-spin" />
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

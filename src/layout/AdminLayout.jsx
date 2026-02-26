import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Coffee, LayoutDashboard, Package, ListTree, Megaphone, ImagePlay, Users, MapPin, Settings, LogOut, Shield } from 'lucide-react';

export default function AdminLayout() {
    const { logout, adminUser } = useAdminAuth();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', label: 'Ürün Yönetimi', icon: Package },
        { path: '/categories', label: 'Kategoriler', icon: ListTree },
        { path: '/campaigns', label: 'Kampanyalar', icon: Megaphone },
        { path: '/stories', label: 'Story Yönetimi', icon: ImagePlay },
        { path: '/members', label: 'Üye Yönetimi', icon: Users },
        { path: '/branch', label: 'Şube & Saatler', icon: MapPin },
        { path: '/audit', label: 'Denetim Günlüğü', icon: Shield },
        { path: '/settings', label: 'Ayarlar', icon: Settings },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#050505] overflow-hidden text-white">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/5 flex flex-col shrink-0 flex-col z-20">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-shaco-red/10 rounded-xl flex items-center justify-center border border-shaco-red/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Coffee size={24} className="text-shaco-red" />
                    </div>
                    <div>
                        <h2 className="font-black tracking-widest text-lg uppercase leading-none">Shaco</h2>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Admin Panel v3</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive
                                    ? 'bg-shaco-red text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="mb-4 px-4">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Oturum</p>
                        <p className="text-sm text-zinc-300 font-medium truncate">{adminUser?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.05),transparent_40%)] pointer-events-none"></div>
                <div className="p-8 md:p-12 min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

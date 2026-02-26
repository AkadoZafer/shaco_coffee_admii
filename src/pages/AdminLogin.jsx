import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Coffee, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('E-posta veya şifre hatalı!');
            } else {
                setError(err.message || 'Giriş başarısız. Yetkinizi kontrol edin.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-shaco-red/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-shaco-red/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <Coffee size={40} className="text-shaco-red" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Shaco Coffee</h1>
                    <p className="text-zinc-400 font-medium tracking-wide">Yönetici Kontrol Paneli</p>
                </div>

                <form onSubmit={handleLogin} className="glass p-8 rounded-3xl space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm font-medium">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-Posta Adresi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-shaco-red focus:ring-1 focus:ring-shaco-red transition-all"
                                    placeholder="admin@shaco.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Şifre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-shaco-red focus:ring-1 focus:ring-shaco-red transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-shaco-red hover:bg-red-600 disabled:opacity-50 text-white font-bold tracking-widest uppercase py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Sisteme Giriş Yap'}
                    </button>

                    <p className="text-center text-zinc-600 text-xs mt-4">Sadece yetkili yöneticiler içindir.</p>
                </form>
            </div>
        </div>
    );
}

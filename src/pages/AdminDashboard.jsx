import { DollarSign, QrCode, Users, Clock, ArrowUp, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { subscribeProducts } from '../services/productService';
import { subscribeMembers } from '../services/memberService';
import { subscribeCampaigns } from '../services/campaignService';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, members: 0, campaigns: 0, outOfStock: 0 });

    useEffect(() => {
        const unsubProducts = subscribeProducts(data => {
            const outOfStock = data.filter(p => p.stock === 0 || !p.isAvailable).length;
            setStats(prev => ({ ...prev, products: data.length, outOfStock }));
        });
        const unsubMembers = subscribeMembers(data => setStats(prev => ({ ...prev, members: data.length })));
        const unsubCampaigns = subscribeCampaigns(data => setStats(prev => ({ ...prev, campaigns: data.filter(c => c.isActive).length })));

        return () => { unsubProducts(); unsubMembers(); unsubCampaigns(); };
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-wide">Genel Bakış</h1>
                <p className="text-zinc-400 mt-1">Sistem istatistikleri ve genel raporlar (Simüle edilmiş veriler ve canlı sayımlar).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Toplam Üye</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">{stats.members}</h3>
                    <p className="text-emerald-500 text-xs font-bold flex items-center gap-1"><ArrowUp size={12} /> +12% dün</p>
                </div>

                <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-shaco-red/10 rounded-full blur-xl group-hover:bg-shaco-red/20 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-shaco-red/10 text-shaco-red flex items-center justify-center">
                            <QrCode size={20} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Bugünkü İşlem (Örnek)</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">142</h3>
                    <p className="text-emerald-500 text-xs font-bold flex items-center gap-1"><ArrowUp size={12} /> +5% dün</p>
                </div>

                <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                            <Package size={20} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Ürün & Stok</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">{stats.products}</h3>
                    <p className={`${stats.outOfStock > 0 ? 'text-shaco-red' : 'text-emerald-500'} text-xs font-bold flex items-center gap-1`}>
                        {stats.outOfStock > 0 ? `${stats.outOfStock} ürün tükendi` : 'Tüm stoklar tam'}
                    </p>
                </div>

                <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Aktif Kampanya</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">{stats.campaigns}</h3>
                    <p className="text-zinc-500 text-xs font-bold flex items-center gap-1">Yayında olan duyurular</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Popüler Ürünler (Örnek Veri)</h3>
                    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                        {[
                            { name: 'Lotus Biscoff Latte', sales: 342, bg: 'bg-orange-500' },
                            { name: "The Jester's Delight", sales: 289, bg: 'bg-shaco-red' },
                            { name: 'Iced Caramel Macchiato', sales: 215, bg: 'bg-amber-400' },
                            { name: 'Cold Brew', sales: 180, bg: 'bg-blue-400' }
                        ].map((item, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white ${item.bg}`}>
                                        #{i + 1}
                                    </div>
                                    <span className="font-bold text-white tracking-wide">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-zinc-400 bg-black/50 px-3 py-1 rounded-lg border border-white/5">{item.sales} Satış</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Son İşlemler (Örnek Veri)</h3>
                    <div className="glass rounded-3xl overflow-hidden shadow-2xl p-2">
                        {[
                            { user: 'Ahmet Yılmaz', type: 'QR Ödeme', amount: '120₺', time: '5 dk önce' },
                            { user: 'Ayşe Demir', type: 'Puan Harcama', amount: '-15 Yıldız', time: '12 dk önce' },
                            { user: 'Mehmet K.', type: 'Cüzdana Yükleme', amount: '500₺', time: '1 saat önce' },
                            { user: 'Zeynep Ç.', type: 'QR Ödeme', amount: '85₺', time: '2 saat önce' }
                        ].map((txn, i) => (
                            <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm">{txn.user}</span>
                                    <span className="text-xs text-zinc-500">{txn.type}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`font-bold text-sm ${txn.amount.includes('-') ? 'text-shaco-red' : 'text-emerald-500'}`}>{txn.amount}</span>
                                    <span className="text-xs text-zinc-600 font-medium">{txn.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

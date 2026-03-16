import { DollarSign, QrCode, Users, Clock, ArrowUp, Package, RefreshCw, Gift, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { subscribeProducts } from '../services/productService';
import { subscribeMembers } from '../services/memberService';
import { subscribeCampaigns } from '../services/campaignService';
import { runMarketingAutomation, subscribeKpiMetrics } from '../services/kpiMarketingService';
import SeedButton from '../components/SeedButton';
import { db } from '../firebase';

const DEFAULT_AUTOMATION_CONFIG = {
    winbackEnabled: true,
    winbackDiscountPercent: 15,
    birthdayEnabled: true,
    birthdayDiscountPercent: 20
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, members: 0, campaigns: 0, outOfStock: 0 });
    const [kpis, setKpis] = useState({
        dailyOrders: 0,
        dailyRevenue: 0,
        avgBasket: 0,
        repeatRate7d: 0,
        repeatRate30d: 0,
    });
    const [automationConfig, setAutomationConfig] = useState(DEFAULT_AUTOMATION_CONFIG);
    const [automationRunning, setAutomationRunning] = useState(false);
    const [automationResult, setAutomationResult] = useState(null);
    const settingsDocRef = doc(db, 'settings', 'general');
    const hasAnyAutomationEnabled = automationConfig.winbackEnabled || automationConfig.birthdayEnabled;
    const lastRunLabel = automationResult?.ranAt
        ? new Date(automationResult.ranAt).toLocaleString('tr-TR')
        : (automationResult?.ranAtIso ? new Date(automationResult.ranAtIso).toLocaleString('tr-TR') : null);

    useEffect(() => {
        const unsubProducts = subscribeProducts(data => {
            const outOfStock = data.filter(p => p.stock === 0 || !p.isAvailable).length;
            setStats(prev => ({ ...prev, products: data.length, outOfStock }));
        });
        const unsubMembers = subscribeMembers(data => setStats(prev => ({ ...prev, members: data.length })));
        const unsubCampaigns = subscribeCampaigns(data => setStats(prev => ({ ...prev, campaigns: data.filter(c => c.isActive).length })));

        return () => { unsubProducts(); unsubMembers(); unsubCampaigns(); };
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeKpiMetrics((metrics) => {
            setKpis({
                dailyOrders: metrics.dailyOrders,
                dailyRevenue: metrics.dailyRevenue,
                avgBasket: metrics.avgBasket,
                repeatRate7d: metrics.repeatRate7d,
                repeatRate30d: metrics.repeatRate30d
            });
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(settingsDocRef, (snap) => {
            const data = snap.exists() ? snap.data() : null;
            const saved = data?.marketingAutomationLastRun || null;
            const savedConfig = data?.marketingAutomationConfig;

            if (saved) {
                setAutomationResult(saved);
            }

            if (savedConfig && typeof savedConfig === 'object') {
                setAutomationConfig({
                    winbackEnabled: typeof savedConfig.winbackEnabled === 'boolean' ? savedConfig.winbackEnabled : DEFAULT_AUTOMATION_CONFIG.winbackEnabled,
                    winbackDiscountPercent: Number(savedConfig.winbackDiscountPercent) || DEFAULT_AUTOMATION_CONFIG.winbackDiscountPercent,
                    birthdayEnabled: typeof savedConfig.birthdayEnabled === 'boolean' ? savedConfig.birthdayEnabled : DEFAULT_AUTOMATION_CONFIG.birthdayEnabled,
                    birthdayDiscountPercent: Number(savedConfig.birthdayDiscountPercent) || DEFAULT_AUTOMATION_CONFIG.birthdayDiscountPercent
                });
            }
        });
        return () => unsub();
    }, [settingsDocRef]);

    const updateAutomationConfig = (updater) => {
        setAutomationConfig((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            void setDoc(settingsDocRef, { marketingAutomationConfig: next }, { merge: true })
                .catch((error) => console.error('Failed to persist automation config:', error));
            return next;
        });
    };

    const handleRunAutomation = async () => {
        if (automationRunning) return;

        setAutomationRunning(true);
        try {
            const result = await runMarketingAutomation(automationConfig);
            setAutomationResult(result);
        } catch (error) {
            console.error('Marketing automation failed:', error);
            alert(`Otomasyon çalıştırılamadı: ${error.message}`);
        } finally {
            setAutomationRunning(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Genel Bakış</h1>
                    <p className="text-zinc-400 mt-1">Canlı KPI metrikleri ve otomatik pazarlama akışları.</p>
                </div>
                <SeedButton />
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
                    <p className="text-zinc-500 text-xs font-bold flex items-center gap-1">Canlı kullanıcı sayımı</p>
                </div>

                <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-shaco-red/10 rounded-full blur-xl group-hover:bg-shaco-red/20 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-shaco-red/10 text-shaco-red flex items-center justify-center">
                            <QrCode size={20} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Bugünkü İşlem</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">{kpis.dailyOrders}</h3>
                    <p className="text-emerald-500 text-xs font-bold flex items-center gap-1"><ArrowUp size={12} /> Canlı sipariş akışı</p>
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
                            <DollarSign size={20} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Bugünkü Ciro</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">₺{kpis.dailyRevenue}</h3>
                    <p className="text-zinc-500 text-xs font-bold flex items-center gap-1">Gün içi canlı toplam</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <DollarSign size={18} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Ortalama Sepet</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">₺{kpis.avgBasket}</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-2">Günlük sipariş bazında ortalama</p>
                </div>

                <div className="glass p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <Clock size={18} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Tekrar Sipariş (7 Gün)</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">%{kpis.repeatRate7d}</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-2">Aynı dönemde 2+ sipariş veren oranı</p>
                </div>

                <div className="glass p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                            <CalendarDays size={18} />
                        </div>
                        <span className="text-sm font-bold text-zinc-400">Tekrar Sipariş (30 Gün)</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">%{kpis.repeatRate30d}</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-2">Aylık müşteri sadakati görünümü</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Gift size={18} className="text-emerald-400" />
                        Otomatik Pazarlama Akışları
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                            <div>
                                <p className="text-sm font-bold text-white">30 Gün Pasif Kullanıcı Kuponu</p>
                                <p className="text-xs text-zinc-500">30 gün sipariş vermeyen üyeleri hedefler.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={automationConfig.winbackEnabled}
                                onChange={(e) => updateAutomationConfig((prev) => ({ ...prev, winbackEnabled: e.target.checked }))}
                                className="w-5 h-5 accent-emerald-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                            <span className="text-sm text-zinc-300">% İndirim</span>
                            <input
                                type="number"
                                min="5"
                                max="60"
                                value={automationConfig.winbackDiscountPercent}
                                disabled={!automationConfig.winbackEnabled}
                                onChange={(e) => updateAutomationConfig((prev) => ({ ...prev, winbackDiscountPercent: Number(e.target.value) || 0 }))}
                                className="w-24 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                            <div>
                                <p className="text-sm font-bold text-white">Doğum Günü Kuponu</p>
                                <p className="text-xs text-zinc-500">Bugün doğum günü olan üyeleri hedefler.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={automationConfig.birthdayEnabled}
                                onChange={(e) => updateAutomationConfig((prev) => ({ ...prev, birthdayEnabled: e.target.checked }))}
                                className="w-5 h-5 accent-purple-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                            <span className="text-sm text-zinc-300">% İndirim</span>
                            <input
                                type="number"
                                min="5"
                                max="60"
                                value={automationConfig.birthdayDiscountPercent}
                                disabled={!automationConfig.birthdayEnabled}
                                onChange={(e) => updateAutomationConfig((prev) => ({ ...prev, birthdayDiscountPercent: Number(e.target.value) || 0 }))}
                                className="w-24 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm"
                            />
                        </label>

                        <button
                            onClick={handleRunAutomation}
                            disabled={automationRunning || !hasAnyAutomationEnabled}
                            className="w-full mt-2 bg-shaco-red hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw size={16} className={automationRunning ? 'animate-spin' : ''} />
                            {automationRunning ? 'Akış çalıştırılıyor...' : hasAnyAutomationEnabled ? 'Akışları Şimdi Çalıştır' : 'Akışlar Kapalı'}
                        </button>
                    </div>
                </div>

                <div className="glass rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Akış Sonucu</h3>
                    {!hasAnyAutomationEnabled ? (
                        <div className="h-full min-h-48 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 text-sm text-center px-4">
                            <p className="text-zinc-300 font-semibold">Akışlar şu anda kapalı.</p>
                            <p className="mt-1">Yeniden çalıştırmak için soldan en az bir akışı aç.</p>
                            {lastRunLabel ? (
                                <p className="mt-3 text-xs text-zinc-500">Son çalıştırma: {lastRunLabel}</p>
                            ) : null}
                        </div>
                    ) : automationResult ? (
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-sm text-emerald-300 font-bold">30 Gün Pasif Hedef Sayısı</p>
                                <p className="text-3xl font-black text-white">{automationResult.winbackCount}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                <p className="text-sm text-purple-300 font-bold">Doğum Günü Hedef Sayısı</p>
                                <p className="text-3xl font-black text-white">{automationResult.birthdayCount}</p>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Aynı gün içinde aynı otomasyon tipi tekrar kampanya üretmez.
                            </p>
                            {lastRunLabel ? (
                                <p className="text-xs text-zinc-500">Son çalıştırma: {lastRunLabel}</p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="h-full min-h-48 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-zinc-500 text-sm">
                            Akış henüz çalıştırılmadı.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

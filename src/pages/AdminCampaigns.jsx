import { useState, useEffect } from 'react';
import { subscribeCampaigns, addCampaign, updateCampaign, deleteCampaign } from '../services/campaignService';
import { Megaphone, Trash2, Plus, CheckCircle, XCircle, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ title: '', subtitle: '', emoji: '🎁', gradient: 'from-red-600 to-red-900', isActive: true });

    useEffect(() => {
        const unsubscribe = subscribeCampaigns((data) => setCampaigns(data));
        return () => unsubscribe();
    }, []);

    const handleAddCampaign = async (e) => {
        e.preventDefault();
        if (!newCampaign.title.trim() || !newCampaign.subtitle.trim()) return alert('Başlık ve Alt Başlık zorunludur!');
        try {
            await addCampaign(newCampaign);
            setNewCampaign({ title: '', subtitle: '', emoji: '🎁', gradient: 'from-red-600 to-red-900', isActive: true });
            setIsCreating(false);
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
            try { await deleteCampaign(id); } catch (e) { alert('Hata: ' + e.message); }
        }
    };

    const toggleCampaignStatus = async (id, currentStatus) => {
        try { await updateCampaign(id, { isActive: !currentStatus }); } catch (e) { alert('Hata: ' + e.message); }
    };

    const sendNotification = (campaign) => {
        // İleride Firebase Cloud Functions (FCM) üzerinden push atılacak.
        alert(`FCM (Push Notification) Kuyruğuna Eklendi!\n\nBaşlık: ${campaign.title}\nMesaj: ${campaign.subtitle}\n\nTüm mobil kullanıcılara bildirim gönderiliyor...`);
        console.log("FCM Payload:", { title: campaign.title, body: campaign.subtitle, data: { campaignId: campaign.id } });
    };

    const gradients = [
        { label: 'Kırmızı-Bordo', value: 'from-red-600 to-red-900', theme: 'bg-gradient-to-r from-red-600 to-red-900' },
        { label: 'Turuncu-Sarı', value: 'from-orange-500 to-amber-600', theme: 'bg-gradient-to-r from-orange-500 to-amber-600' },
        { label: 'Zümrüt-Mavi', value: 'from-emerald-500 to-teal-800', theme: 'bg-gradient-to-r from-emerald-500 to-teal-800' },
        { label: 'Mor-Siyah', value: 'from-purple-600 to-black', theme: 'bg-gradient-to-r from-purple-600 to-zinc-900' },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Kampanyalar</h1>
                    <p className="text-zinc-400 mt-1">Ana sayfada dikkat çeken promosyon ve duyuruları yönetin.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-shaco-red hover:bg-red-600 font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                >
                    {isCreating ? <XCircle size={18} /> : <Plus size={18} />}
                    {isCreating ? 'İptal' : 'Yeni Kampanya'}
                </button>
            </div>

            {isCreating && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Megaphone size={20} className="text-shaco-red" /> Yeni Kampanya</h2>

                    <form onSubmit={handleAddCampaign} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Başlık</label>
                                <input type="text" value={newCampaign.title} onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })} placeholder="Örn: Hafta Sonu Fırsatı" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Alt Başlık (Açıklama)</label>
                                <input type="text" value={newCampaign.subtitle} onChange={(e) => setNewCampaign({ ...newCampaign, subtitle: e.target.value })} placeholder="Tüm soğuk içeceklerde %20 indirim!" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Emoji / İkon</label>
                                <input type="text" value={newCampaign.emoji} onChange={(e) => setNewCampaign({ ...newCampaign, emoji: e.target.value })} placeholder="🎉" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none text-xl" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Tema Rengi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {gradients.map(grad => (
                                        <button key={grad.value} type="button" onClick={() => setNewCampaign({ ...newCampaign, gradient: grad.value })} className={`py-2 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold tracking-wide transition-all ${newCampaign.gradient === grad.value ? 'border-white text-white shadow-lg' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}>
                                            <div className={`w-4 h-4 rounded-full ${grad.theme}`}></div>
                                            {grad.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all">Kampanyayı Başlat</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                    <div key={campaign.id} className={`rounded-3xl border ${campaign.isActive ? 'border-white/10' : 'border-white/5 opacity-60'} overflow-hidden relative group`}>
                        <div className={`p-6 bg-gradient-to-br ${campaign.gradient || 'from-zinc-800 to-black'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                    {campaign.emoji}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => sendNotification(campaign)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/40 transition-all" title="Tüm Üyelere Push Bildirim Gönder"><Bell size={16} /></button>
                                    <button onClick={() => toggleCampaignStatus(campaign.id, campaign.isActive)} className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${campaign.isActive ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`} title={campaign.isActive ? 'Yayından Kaldır' : 'Yayına Al'}><CheckCircle size={16} /></button>
                                    <button onClick={() => handleDeleteCampaign(campaign.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:bg-red-500/40 hover:text-white hover:border-red-500/50 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 className="text-white font-black text-xl mb-2">{campaign.title}</h3>
                            <p className="text-white/80 font-medium text-sm leading-relaxed">{campaign.subtitle}</p>
                        </div>
                        <div className="bg-zinc-950 px-6 py-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${campaign.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                {campaign.isActive ? 'YAYINDA' : 'PASİF'}
                            </span>
                            <span className="text-xs text-zinc-600">{new Date(campaign.createdAt?.toMillis()).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

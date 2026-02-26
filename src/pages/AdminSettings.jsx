import { useState, useEffect } from 'react';
import { subscribeSettings, updateSettings } from '../services/settingsService';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({ maintenanceMode: false, appVersion: '1.0.0', announcement: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsub = subscribeSettings(data => {
            if (data) setSettings(data);
        });
        return () => unsub();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSettings(settings);
            alert('Ayarlar kaydedildi.');
        } catch (error) {
            alert('Hata!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-wide">Genel Ayarlar</h1>
                <p className="text-zinc-400 mt-1">Uygulamanın genel davranışını ve sistem uyarılarını yapılandırın.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="glass p-8 rounded-3xl space-y-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><AlertCircle className="text-shaco-red" size={20} /> Bakım Modu</h3>
                            <p className="text-sm text-zinc-400 mt-1">Müşteri uygulamasını geçici olarak devre dışı bırakır ve bakım uyarı ekranı gösterir.</p>
                        </div>
                        <button type="button" onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} className={`w-14 h-8 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Mobil Uygulama Sürümü (Version)</label>
                        <p className="text-xs text-zinc-400 mb-3">Kullanıcıların zorunlu güncelleme yapmasını sağlamak için desteklenen en düşük sürümü yazın.</p>
                        <input type="text" value={settings.appVersion} onChange={e => setSettings({ ...settings, appVersion: e.target.value })} className="w-full max-w-sm bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none font-mono" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Genel Duyuru (Header Banner)</label>
                        <p className="text-xs text-zinc-400 mb-3">Uygulamanın en üstünde herkesin göreceği acil veya kalıcı bir duyuru metni girebilirsiniz.</p>
                        <textarea rows="3" value={settings.announcement || ''} onChange={e => setSettings({ ...settings, announcement: e.target.value })} placeholder="Örn: Sistem kısa süreliğine bakıma alınacaktır." className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none"></textarea>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-shaco-red hover:bg-red-600 font-bold py-4 px-10 rounded-xl flex items-center gap-2 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50">
                        <Save size={20} /> {isSaving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}

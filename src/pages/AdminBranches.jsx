import { useState, useEffect } from 'react';
import { subscribeBranches, updateBranch, addBranch } from '../services/branchService';
import { Store, Plus, Save, Clock, MapPin, Phone } from 'lucide-react';

export default function AdminBranches() {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeBranches(setBranches);
        return () => unsubscribe();
    }, []);

    const handleNewBranch = () => {
        setSelectedBranch({
            isNew: true,
            name: '',
            address: '',
            phone: '',
            isOpen: true,
            hours: {
                weekdays: { open: '08:00', close: '22:00' },
                weekends: { open: '09:00', close: '23:00' }
            }
        });
        setIsEditing(true);
    };

    const handleSelectBranch = (branch) => {
        setSelectedBranch({ ...branch });
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedBranch(prev => ({ ...prev, [name]: value }));
    };

    const handleHoursChange = (dayType, timeType, value) => {
        setSelectedBranch(prev => ({
            ...prev,
            hours: {
                ...prev.hours,
                [dayType]: { ...prev.hours[dayType], [timeType]: value }
            }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { isNew, id, ...dataToSave } = selectedBranch;
            if (isNew) {
                await addBranch(dataToSave);
            } else {
                await updateBranch(id, dataToSave);
            }
            setIsEditing(false);
            setSelectedBranch(null);
        } catch (error) {
            alert("Şube kaydedilirken hata oluştu!");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Şube Yönetimi</h1>
                    <p className="text-zinc-400 mt-1">Sistemdeki mağazaları, çalışma saatlerini ve durumlarını düzenleyin.</p>
                </div>
                <button onClick={handleNewBranch} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all border border-white/5">
                    <Plus size={18} /> Yeni Şube Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    {branches.map(branch => (
                        <div key={branch.id} onClick={() => handleSelectBranch(branch)} className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedBranch?.id === branch.id ? 'bg-shaco-red/10 border-shaco-red/30' : 'glass hover:bg-white/5'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-bold">{branch.name}</h3>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${branch.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {branch.isOpen ? 'AÇIK' : 'KAPALI'}
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2 mt-1 flex items-start gap-1"><MapPin size={12} className="shrink-0 mt-0.5" /> {branch.address}</p>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2">
                    {isEditing && selectedBranch ? (
                        <div className="glass rounded-3xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Store size={20} className="text-shaco-red" /> {selectedBranch.isNew ? 'Yeni Şube' : 'Şubeyi Düzenle'}</h2>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Şube Adı</label>
                                        <input type="text" name="name" value={selectedBranch.name || ''} onChange={handleChange} required className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Telefon</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input type="text" name="phone" value={selectedBranch.phone || ''} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-shaco-red outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Açık Adres</label>
                                    <textarea name="address" value={selectedBranch.address || ''} onChange={handleChange} rows="2" required className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none"></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2"><Clock size={16} /> Hafta İçi</h3>
                                        <div className="flex gap-4">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 mb-1">Açılış</label>
                                                <input type="time" value={selectedBranch.hours?.weekdays?.open || ''} onChange={(e) => handleHoursChange('weekdays', 'open', e.target.value)} className="bg-black border border-white/10 rounded-lg p-2 text-white text-sm outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 mb-1">Kapanış</label>
                                                <input type="time" value={selectedBranch.hours?.weekdays?.close || ''} onChange={(e) => handleHoursChange('weekdays', 'close', e.target.value)} className="bg-black border border-white/10 rounded-lg p-2 text-white text-sm outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2"><Clock size={16} /> Hafta Sonu</h3>
                                        <div className="flex gap-4">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 mb-1">Açılış</label>
                                                <input type="time" value={selectedBranch.hours?.weekends?.open || ''} onChange={(e) => handleHoursChange('weekends', 'open', e.target.value)} className="bg-black border border-white/10 rounded-lg p-2 text-white text-sm outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 mb-1">Kapanış</label>
                                                <input type="time" value={selectedBranch.hours?.weekends?.close || ''} onChange={(e) => handleHoursChange('weekends', 'close', e.target.value)} className="bg-black border border-white/10 rounded-lg p-2 text-white text-sm outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-4 border-t border-b border-white/5">
                                    <label className="text-sm font-bold text-zinc-300 flex-1">Şube Şu An Hizmet Veriyor Mu?</label>
                                    <button type="button" onClick={() => setSelectedBranch(prev => ({ ...prev, isOpen: !prev.isOpen }))} className={`w-14 h-8 rounded-full relative transition-colors ${selectedBranch.isOpen ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${selectedBranch.isOpen ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:bg-white/5">İptal</button>
                                    <button type="submit" className="bg-shaco-red hover:bg-red-600 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"><Save size={18} /> Kaydet</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-3xl glass opacity-60">
                            <Store size={48} className="text-zinc-800 mb-4" />
                            <p className="text-zinc-500 font-medium text-center">Düzenlemek için sol taraftan bir şube seçin<br />veya yeni ekleyin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

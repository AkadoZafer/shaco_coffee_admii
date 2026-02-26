import { useState, useEffect } from 'react';
import { subscribeMembers, updateMemberTier, updateMemberBalance, deleteMember } from '../services/memberService';
import { Users, Search, Star, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function AdminMembers() {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        const unsub = subscribeMembers(setMembers);
        return () => unsub();
    }, []);

    const filtered = members.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await updateMemberTier(selectedMember.id, selectedMember.tier);
            await updateMemberBalance(selectedMember.id, Number(selectedMember.stars));
            setSelectedMember(null);
        } catch (error) {
            alert('Güncelleme hatası!');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Üyeyi tamamen silmek istediğinize emin misiniz?')) {
            await deleteMember(id);
            setSelectedMember(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Üye Yönetimi</h1>
                    <p className="text-zinc-400 mt-1">Uygulamaya kayıtlı kullanıcıların durumlarını, yıldız puanlarını düzenleyin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                    <div className="relative shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input type="text" placeholder="İsim veya E-Posta Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full glass border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-shaco-red outline-none" />
                    </div>

                    <div className="glass rounded-3xl overflow-y-auto no-scrollbar flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/40 text-xs uppercase text-zinc-500 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Kullanıcı</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Email</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Tier</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Yıldız</th>
                                    <th className="px-6 py-4 text-right font-bold tracking-wider">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(m => (
                                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">{m.name || m.displayName || 'İsimsiz'}</td>
                                        <td className="px-6 py-4 text-zinc-400">{m.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${typeof m.tier === 'string' && m.tier.includes('gold') ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-300'}`}>{m.tier || 'member'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium flex items-center gap-1"><Star size={14} className="text-orange-500" /> {m.stars || m.balance || 0}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedMember({ ...m, stars: m.stars || m.balance || 0 })} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors inline-block"><Edit2 size={16} className="text-zinc-300" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1 h-full overflow-y-auto pb-8">
                    {selectedMember ? (
                        <div className="glass p-6 rounded-3xl sticky top-0">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-full flex items-center justify-center text-xl font-bold text-white">
                                    {(selectedMember.name || selectedMember.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{selectedMember.name || 'İsimsiz'}</h3>
                                    <p className="text-zinc-400 text-xs">{selectedMember.email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Kullanıcı Segmenti (Tier)</label>
                                    <select value={selectedMember.tier || 'member'} onChange={e => setSelectedMember({ ...selectedMember, tier: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none">
                                        <option value="guest">Misafir (Guest)</option>
                                        <option value="member">Bronz (Member)</option>
                                        <option value="silver">Gümüş (Silver)</option>
                                        <option value="gold">Altın (Gold)</option>
                                        <option value="admin">Yönetici (Admin)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Yıldız Puanı (Balance)</label>
                                    <input type="number" value={selectedMember.stars} onChange={e => setSelectedMember({ ...selectedMember, stars: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none text-xl font-black text-center" />
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button type="submit" className="w-full bg-shaco-red hover:bg-red-600 font-bold py-3 rounded-xl text-white shadow-lg transition-all">Değişiklikleri Kaydet</button>
                                    <button type="button" onClick={() => setSelectedMember(null)} className="w-full bg-transparent border border-white/10 hover:bg-white/5 font-bold py-3 rounded-xl text-zinc-300 transition-all">İptal Et</button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <button type="button" onClick={() => handleDelete(selectedMember.id)} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 p-3 rounded-xl font-bold text-xs transition-colors">
                                        <ShieldAlert size={16} /> Kullanıcıyı Tamamen Sil
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-48 border border-dashed border-white/5 rounded-3xl glass opacity-60 flex items-center justify-center p-6 text-center text-zinc-500">
                            Düzenlemek için listeden<br />bir üyeye tıklayın.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

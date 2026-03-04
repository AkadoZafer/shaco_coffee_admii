import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageSquare, Star, Search, Filter } from 'lucide-react';

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStars, setFilterStars] = useState(0); // 0 = all

    useEffect(() => {
        const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setFeedbacks(list);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredFeedbacks = filterStars === 0
        ? feedbacks
        : feedbacks.filter(f => f.rating === filterStars);

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between xl:mb-8 mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Müşteri Geri Bildirimleri</h1>
                    <p className="text-zinc-400 mt-1">Uygulama üzerinden gönderilen tüm değerlendirmeler ve yorumlar.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
                <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-400 tracking-wider">TOPLAM DEĞERLENDİRME</p>
                        <p className="text-3xl font-black text-white">{feedbacks.length}</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                        <Star size={24} className="fill-yellow-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-400 tracking-wider">GENEL ORTALAMA</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-white">{averageRating}</p>
                            <span className="text-sm text-zinc-500 font-bold">/ 5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Content */}
            <div className="flex-1 min-h-0 flex flex-col glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-4 shrink-0 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Filter size={18} />
                        <span className="text-sm font-bold">Filtrele:</span>
                    </div>
                    <button
                        onClick={() => setFilterStars(0)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterStars === 0 ? 'bg-shaco-red text-white' : 'glass text-zinc-400 hover:text-white'}`}
                    >
                        Tümü
                    </button>
                    {[5, 4, 3, 2, 1].map(num => (
                        <button
                            key={num}
                            onClick={() => setFilterStars(num)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-all ${filterStars === num ? 'bg-zinc-800 text-yellow-400' : 'glass text-zinc-400 hover:text-white'}`}
                        >
                            {num} <Star size={14} className={filterStars === num ? 'fill-yellow-400' : ''} />
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {isLoading ? (
                        <div className="text-center text-zinc-500 py-10">Yükleniyor...</div>
                    ) : filteredFeedbacks.length === 0 ? (
                        <div className="text-center text-zinc-600 py-10 font-medium border border-dashed border-white/5 rounded-2xl glass">
                            Bu kritere uygun geri bildirim bulunamadı.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredFeedbacks.map(f => (
                                <div key={f.id} className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">
                                                {f.displayName ? f.displayName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white leading-tight">
                                                    {f.displayName || 'Kullanıcı'}
                                                </h4>
                                                <span className="text-[11px] font-medium text-zinc-500">
                                                    {f.createdAt ? new Date(f.createdAt.toMillis()).toLocaleString('tr-TR') : 'Şimdi'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={14} className={f.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                        "{f.comment || 'Yorum bırakılmadı'}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

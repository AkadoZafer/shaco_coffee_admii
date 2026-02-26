import { useState, useEffect, useRef } from 'react';
import { subscribeStories, addStory, deleteStory } from '../services/storyService';
import { ImagePlay, Trash2, Plus, ImageIcon, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminStories() {
    const [stories, setStories] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newStory, setNewStory] = useState({ image: '', title: '', text: '' });
    const fileInputRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeStories((data) => setStories(data));
        return () => unsubscribe();
    }, []);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewStory({ ...newStory, image: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleAddStory = async (e) => {
        e.preventDefault();
        if (!newStory.image) return alert('Lütfen bir görsel seçin!');
        setIsSaving(true);
        try {
            await addStory(newStory);
            setNewStory({ image: '', title: '', text: '' });
            setIsCreating(false);
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteStory = async (id) => {
        if (confirm('Bu hikayeyi silmek istediğinize emin misiniz?')) {
            try { await deleteStory(id); } catch (e) { alert('Hata: ' + e.message); }
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Hikayeler</h1>
                    <p className="text-zinc-400 mt-1">Uygulamada yatay akışta gösterilen Instagram tarzı hikayeleri yönetin.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="bg-shaco-red hover:bg-red-600 font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                    {isCreating ? <X size={18} /> : <Plus size={18} />} {isCreating ? 'İptal' : 'Yeni Hikaye'}
                </button>
            </div>

            {isCreating && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ImagePlay size={20} className="text-shaco-red" /> Yeni Hikaye Oluştur</h2>

                    <form onSubmit={handleAddStory} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Hikaye Görseli <span className="text-red-500">*</span></label>
                            <div className="w-full aspect-[9/16] max-w-[300px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden bg-black/50 group mx-auto">
                                {newStory.image ? (
                                    <>
                                        <img src={newStory.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => setNewStory({ ...newStory, image: '' })} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform"><Trash2 size={20} /></button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <ImageIcon size={48} className="mx-auto text-zinc-600 mb-4" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">Görsel Yükle</button>
                                        <p className="text-[10px] text-zinc-500 tracking-wider mt-4">Önerilen: 1080x1920</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                            </div>
                        </div>

                        <div className="space-y-6 flex flex-col justify-center">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Başlık (Kısa İsim)</label>
                                <input type="text" value={newStory.title} onChange={(e) => setNewStory({ ...newStory, title: e.target.value })} placeholder="Örn: Yeni Sezon Menüsü" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Metin (Hikaye İçi Açıklama)</label>
                                <textarea value={newStory.text} onChange={(e) => setNewStory({ ...newStory, text: e.target.value })} rows="4" placeholder="Hikaye üzerinde görünecek destekleyici metin" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-shaco-red outline-none resize-none"></textarea>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSaving || !newStory.image} className="w-full bg-shaco-red hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Save size={20} /> {isSaving ? 'Kaydediliyor...' : 'Hikayeyi Yayınla'}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {stories.map(story => (
                    <div key={story.id} className="glass rounded-3xl overflow-hidden group relative aspect-[9/16] shadow-xl">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                        <div className="absolute top-2 right-2 z-20">
                            <button onClick={() => handleDeleteStory(story.id)} className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md text-zinc-400 hover:text-red-500 hover:bg-black/80 flex items-center justify-center transition-all"><Trash2 size={16} /></button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                            <h3 className="text-white font-bold text-sm drop-shadow-md truncate">{story.title || 'İsimsiz'}</h3>
                            <p className="text-xs text-zinc-300 drop-shadow-md line-clamp-2 mt-1">{story.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { subscribeCategories, addCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { ListTree, Plus, Save, Trash2, Edit2 } from 'lucide-react';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeCategories(setCategories);
        return () => unsubscribe();
    }, []);

    const handleNewCat = () => {
        setSelectedCategory({ isNew: true, label: '', value: '', sortOrder: 0 });
        setIsEditing(true);
    };

    const handleEditCat = (cat) => {
        setSelectedCategory({ ...cat });
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { isNew, id, ...dataToSave } = selectedCategory;
            dataToSave.sortOrder = Number(dataToSave.sortOrder);
            if (isNew) await addCategory(dataToSave);
            else await updateCategory(id, dataToSave);
            setIsEditing(false);
            setSelectedCategory(null);
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Emin misiniz?')) {
            await deleteCategory(id);
            setIsEditing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Kategoriler</h1>
                    <p className="text-zinc-400 mt-1">Uygulama menüsünde gösterilecek ürün kategorilerini yönetin.</p>
                </div>
                <button onClick={handleNewCat} className="bg-shaco-red hover:bg-red-600 font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-white shadow-lg transition-all">
                    <Plus size={18} /> Yeni Kategori
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {categories.map((cat, idx) => (
                        <div key={cat.id} className="glass p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center font-bold text-xs text-zinc-500">#{cat.sortOrder || idx + 1}</div>
                                <div>
                                    <h3 className="text-white font-bold">{cat.label}</h3>
                                    <p className="text-xs text-zinc-500">{cat.value}</p>
                                </div>
                            </div>
                            <button onClick={() => handleEditCat(cat)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Edit2 size={16} className="text-zinc-300" /></button>
                        </div>
                    ))}
                    {categories.length === 0 && <div className="glass p-8 rounded-3xl text-center text-zinc-500">Kategori Bulunamadı.</div>}
                </div>

                <div>
                    {isEditing && selectedCategory ? (
                        <div className="glass p-6 rounded-3xl sticky top-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2"><ListTree size={20} className="text-shaco-red" /> {selectedCategory.isNew ? 'Yeni Kategori' : 'Düzenle'}</span>
                                {!selectedCategory.isNew && <button onClick={() => handleDelete(selectedCategory.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>}
                            </h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Görünen Ad (Emoji dahil edilebilir)</label>
                                    <input type="text" value={selectedCategory.label} onChange={e => setSelectedCategory({ ...selectedCategory, label: e.target.value })} placeholder="Örn: ☕ Sıcak Kahve" required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-shaco-red outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Sistem Adı (ID) - Benzersiz olmalı</label>
                                    <input type="text" value={selectedCategory.value} onChange={e => setSelectedCategory({ ...selectedCategory, value: e.target.value })} placeholder="Örn: cat_coffee" required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-shaco-red outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Sıralama (Sayı)</label>
                                    <input type="number" value={selectedCategory.sortOrder} onChange={e => setSelectedCategory({ ...selectedCategory, sortOrder: e.target.value })} required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-shaco-red outline-none" />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:bg-white/5">İptal</button>
                                    <button type="submit" className="bg-shaco-red hover:bg-red-600 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"><Save size={18} /> Kaydet</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-48 border border-dashed border-white/5 rounded-3xl glass opacity-60 flex items-center justify-center p-6 text-center text-zinc-500">
                            Düzenlemek için sol listeden bir öğeye tıklayın veya yeni ekleyin.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

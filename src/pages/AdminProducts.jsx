import { useState, useEffect, useRef } from 'react';
import { subscribeProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';
import { Coffee, Plus, Save, Trash2, Edit2, X, Image as ImageIcon, Info } from 'lucide-react';

const categories = [
    { label: '☕ Sıcak Kahve', value: 'cat_coffee' },
    { label: '🧊 Soğuk İçecek', value: 'cat_cold' },
    { label: '🍰 Tatlı & Yiyecek', value: 'cat_food' },
    { label: '🍪 Atıştırmalık', value: 'cat_snacks' },
];

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const unsub = subscribeProducts((data) => {
            setProducts(data);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const handleNewProduct = () => {
        setSelectedProduct({
            isNew: true,
            name: '',
            shortDesc: '',
            description: '',
            price: '',
            category: 'cat_coffee',
            imageUrl: '',
            isAvailable: true,
            nutrition: { calories: '', caffeine: '', protein: '', fat: '', carbs: '' },
            allergens: '',
            stock: ''
        });
        setIsEditing(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct({
            ...product,
            nutrition: product.nutrition || { calories: '', caffeine: '', protein: '', fat: '', carbs: '' },
            allergens: product.allergens || '',
            stock: product.stock !== undefined ? product.stock : ''
        });
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleNutritionChange = (field, value) => {
        setSelectedProduct(prev => ({ ...prev, nutrition: { ...prev.nutrition, [field]: value } }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedProduct({ ...selectedProduct, imageUrl: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { isNew, id, ...dataToSave } = selectedProduct;
            if (!dataToSave.price) dataToSave.price = 0; else dataToSave.price = Number(dataToSave.price);
            if (dataToSave.stock) dataToSave.stock = Number(dataToSave.stock);

            if (isNew) {
                await addProduct(dataToSave);
            } else {
                await updateProduct(id, dataToSave);
            }
            setIsEditing(false); setSelectedProduct(null);
        } catch (error) {
            alert("Kaydedilirken hata oluştu!");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Emin misiniz?")) {
            try {
                await deleteProduct(id);
                setIsEditing(false); setSelectedProduct(null);
            } catch (error) {
                alert("Silinirken hata oluştu.");
            }
        }
    }

    const filteredProducts = products.filter(p => {
        const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between xl:mb-8 mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Ürün Yönetimi</h1>
                    <p className="text-zinc-400 mt-1">Stok, alerjen, makro besin ve fiyatlama denetimi.</p>
                </div>
                <button onClick={handleNewProduct} className="bg-shaco-red hover:bg-red-600 font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                    <Plus size={18} /> Yeni Ürün
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Sol Liste */}
                <div className="lg:col-span-5 flex flex-col gap-4 h-full">
                    <div className="glass p-4 rounded-2xl flex flex-col gap-3 shrink-0">
                        <input type="text" placeholder="Ürün Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-white focus:border-shaco-red outline-none" />
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            <button onClick={() => setSelectedCategory('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === 'ALL' ? 'bg-shaco-red text-white' : 'bg-black text-zinc-400 hover:text-white'}`}>Tümü</button>
                            {categories.map(c => (
                                <button key={c.value} onClick={() => setSelectedCategory(c.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === c.value ? 'bg-shaco-red text-white' : 'bg-black text-zinc-400 hover:text-white'}`}>{c.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 no-scrollbar flex-1 pb-10">
                        {isLoading && <div className="text-zinc-500 p-4 text-center glass rounded-xl">Menü yükleniyor...</div>}
                        {!isLoading && filteredProducts.map(product => (
                            <div key={product.id} onClick={() => handleEditProduct(product)} className={`p-4 rounded-xl cursor-pointer transition-all border flex items-center gap-4 ${selectedProduct?.id === product.id ? 'bg-red-500/10 border-red-500/30' : 'glass hover:bg-white/5'}`}>
                                <div className="w-14 h-14 rounded-lg bg-black border border-white/5 overflow-hidden shrink-0">
                                    {(product.imageUrl || product.image) ? <img src={product.imageUrl || product.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Coffee size={20} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold truncate text-sm">{product.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs text-zinc-500 bg-black px-1.5 py-0.5 rounded">{categories.find(c => c.value === product.category)?.label.split(' ')[1] || 'Kategori'}</span>
                                        {!product.isAvailable && <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded font-bold">TÜKENDİ</span>}
                                    </div>
                                </div>
                                <div className="text-right"><p className="text-white font-black">₺{product.price}</p></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ Edit Form */}
                <div className="lg:col-span-7 h-full overflow-y-auto no-scrollbar pb-10">
                    {isEditing && selectedProduct ? (
                        <div className="glass rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Edit2 size={20} className="text-shaco-red" /> {selectedProduct.isNew ? 'Yeni Ürün' : 'Düzenle'}</h2>
                                {!selectedProduct.isNew && <button onClick={() => handleDelete(selectedProduct.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>}
                            </div>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-full md:col-span-1 border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col items-center justify-center relative aspect-square min-h-[200px]">
                                        {selectedProduct.imageUrl || selectedProduct.image ? (
                                            <>
                                                <img src={selectedProduct.imageUrl || selectedProduct.image} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-3">
                                                    <button type="button" onClick={() => setSelectedProduct(prev => ({ ...prev, imageUrl: '' }))} className="bg-red-500 text-white p-3 rounded-full hover:scale-110"><Trash2 size={18} /></button>
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-black p-3 rounded-full hover:scale-110"><Edit2 size={18} /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon size={48} className="mx-auto text-zinc-700 mb-3" />
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase">Fotoğraf Yükle</button>
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    </div>

                                    <div className="col-span-full md:col-span-1 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Ürün Adı</label>
                                            <input type="text" name="name" value={selectedProduct.name} onChange={handleChange} required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-shaco-red outline-none" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Fiyat (₺)</label>
                                                <input type="number" name="price" value={selectedProduct.price} onChange={handleChange} required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white font-bold text-lg focus:border-shaco-red outline-none" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Stok</label>
                                                <input type="number" name="stock" value={selectedProduct.stock} onChange={handleChange} placeholder="Sınırsız" className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-shaco-red outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Kategori</label>
                                            <select name="category" value={selectedProduct.category} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:border-shaco-red outline-none">
                                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Açıklamalar</label>
                                    <textarea name="shortDesc" value={selectedProduct.shortDesc || ''} onChange={handleChange} rows="1" placeholder="Vitrin açıklaması" className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white mb-2 text-sm focus:border-shaco-red outline-none"></textarea>
                                    <textarea name="description" value={selectedProduct.description || ''} onChange={handleChange} rows="2" placeholder="Detaylı hikaye/içerik" className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-shaco-red outline-none"></textarea>
                                </div>

                                <div className="border-t border-white/5 pt-6">
                                    <h3 className="text-sm font-bold text-shaco-red uppercase tracking-widest mb-4">Gelişmiş Bilgiler</h3>
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        {['calories', 'caffeine', 'protein', 'carbs'].map(field => (
                                            <div key={field}>
                                                <label className="block text-[10px] text-zinc-500 mb-1 uppercase">{field}</label>
                                                <input type="number" value={selectedProduct.nutrition?.[field] || ''} onChange={(e) => handleNutritionChange(field, e.target.value)} className="w-full bg-black border border-white/10 rounded-lg py-1.5 px-2 text-white outline-none text-sm" />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-zinc-500 mb-1 uppercase">Alerjen Uyarısı</label>
                                        <input type="text" name="allergens" value={selectedProduct.allergens || ''} onChange={handleChange} placeholder="Örn: Laktoz, Fındık" className="w-full bg-black border border-white/10 rounded-lg py-1.5 px-2 text-white outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-4 border-t border-b border-white/5">
                                    <label className="text-sm font-bold text-zinc-300">Satışta <span className="text-[10px] text-zinc-500 font-normal">(Uygulamada görünür)</span></label>
                                    <button type="button" onClick={() => setSelectedProduct(prev => ({ ...prev, isAvailable: !prev.isAvailable }))} className={`w-14 h-8 rounded-full relative transition-colors ${selectedProduct.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${selectedProduct.isAvailable ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:bg-white/5">İptal</button>
                                    <button type="submit" className="bg-shaco-red hover:bg-red-600 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"><Save size={18} /> Kaydet</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-2xl glass">
                            <Coffee size={48} className="text-zinc-800 mb-4" />
                            <p className="text-zinc-500 font-medium text-center">Düzenlemek için sol taraftan bir ürün seçin<br />veya yeni ekleyin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

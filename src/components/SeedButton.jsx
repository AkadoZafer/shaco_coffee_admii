import { useState } from 'react';
import { db } from '../firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Database } from 'lucide-react';

export default function SeedButton() {
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        if (!window.confirm('DİKKAT! Bu işlem Shaco Coffee menüsünü (kategoriler ve ürünler) toplu olarak Firestore\'a ekleyecektir. Onaylıyor musunuz?')) return;

        setIsSeeding(true);
        try {
            const batch = writeBatch(db);

            // 1. KATEGORİLER
            const categories = [
                { id: 'cat_espresso_based', name: "ESPRESSO BASED", label: "☕ ESPRESSO BASED", value: "cat_espresso_based", sortOrder: 1 },
                { id: 'cat_tea_based', name: "TEA BASED", label: "🫖 TEA BASED", value: "cat_tea_based", sortOrder: 2 },
                { id: 'cat_special_lattes', name: "SPECIAL LATTES", label: "✨ SPECIAL LATTES", value: "cat_special_lattes", sortOrder: 3 },
                { id: 'cat_shaco_special', name: "SHACO SPECIAL", label: "🌟 SHACO SPECIAL", value: "cat_shaco_special", sortOrder: 4 },
                { id: 'cat_shacochino', name: "SHACOCHINO", label: "🥤 SHACOCHINO", value: "cat_shacochino", sortOrder: 5 },
                { id: 'cat_extras', name: "EXTRAS", label: "➕ EXTRAS", value: "cat_extras", sortOrder: 6 }
            ];

            categories.forEach(cat => {
                const docRef = doc(collection(db, 'categories'), cat.id);
                // doc.id doesn't exist on objects, we set specific doc ids
                batch.set(docRef, { name: cat.name, label: cat.label, value: cat.value, sortOrder: cat.sortOrder });
            });

            // 2. ÜRÜNLER
            const products = [
                // ESPRESSO BASED
                { name: 'Espresso', category: 'cat_espresso_based', price: 70, sizes: [{ name: 'Küçük', price: 70 }] },
                { name: 'Double Espresso', category: 'cat_espresso_based', price: 80, sizes: [{ name: 'Küçük', price: 80 }] },
                { name: 'Filter Coffee', category: 'cat_espresso_based', price: 140, sizes: [{ name: 'Küçük', price: 140 }, { name: 'Orta', price: 150 }, { name: 'Büyük', price: 160 }] },
                { name: 'Cappuccino', category: 'cat_espresso_based', price: 165, sizes: [{ name: 'Küçük', price: 165 }, { name: 'Orta', price: 175 }, { name: 'Büyük', price: 185 }] },
                { name: 'Flat White', category: 'cat_espresso_based', price: 170, sizes: [{ name: 'Küçük', price: 170 }, { name: 'Orta', price: 180 }] },
                { name: 'Cortado', category: 'cat_espresso_based', price: 180, sizes: [{ name: 'Küçük', price: 180 }] },
                { name: 'Caramel Macchiato', category: 'cat_espresso_based', price: 194, sizes: [{ name: 'Küçük', price: 194 }, { name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Caffé Mocha', category: 'cat_espresso_based', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Hot Chocolate', category: 'cat_espresso_based', price: 194, sizes: [{ name: 'Küçük', price: 194 }, { name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Türk Kahvesi', category: 'cat_espresso_based', price: 95, sizes: [{ name: 'Küçük', price: 95 }, { name: 'Orta', price: 100 }] },
                { name: 'Latte', category: 'cat_espresso_based', price: 165, sizes: [{ name: 'Küçük', price: 165 }, { name: 'Orta', price: 175 }, { name: 'Büyük', price: 185 }] },
                { name: 'Americano', category: 'cat_espresso_based', price: 145, sizes: [{ name: 'Küçük', price: 145 }, { name: 'Orta', price: 155 }, { name: 'Büyük', price: 165 }] },
                { name: 'White Chocolate Mocha', category: 'cat_espresso_based', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },

                // TEA BASED
                { name: 'Çay', category: 'cat_tea_based', price: 50, sizes: [{ name: 'Küçük', price: 50 }, { name: 'Orta', price: 70 }, { name: 'Büyük', price: 90 }] },
                { name: 'Bitki Çayı', category: 'cat_tea_based', price: 90, sizes: [{ name: 'Orta', price: 90 }] },

                // SPECIAL LATTES
                { name: 'Lotus Latte', category: 'cat_special_lattes', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Toffee Nut Latte', category: 'cat_special_lattes', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Chai Tea Latte', category: 'cat_special_lattes', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Cookie Latte', category: 'cat_special_lattes', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Bounty Latte', category: 'cat_special_lattes', price: 204, sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Aromatic Latte', category: 'cat_special_lattes', price: 204, shortDesc: 'Hazelnut - Caramel - Vanilla - Salted Caramel', sizes: [{ name: 'Küçük', price: 204 }, { name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Antep Fıstıklı Latte', category: 'cat_special_lattes', price: 214, sizes: [{ name: 'Orta', price: 214 }, { name: 'Büyük', price: 224 }] },
                { name: 'Lavender Matcha Latte', category: 'cat_special_lattes', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },

                // SHACO SPECIAL
                { name: 'Mango Dragon', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Frozen', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Portakal Suyu', category: 'cat_shaco_special', price: 165, sizes: [{ name: 'Orta', price: 165 }, { name: 'Büyük', price: 175 }] },
                { name: 'Strawberry Acai', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Ocean Shine', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Tropical Shine', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Lemonade Mango Matcha', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Strawberry Matcha Latte', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Lavender Pink Matcha', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Passion Pop Bubble Tea', category: 'cat_shaco_special', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },

                // SHACOCHINO
                { name: 'Chocolate Milkshake', category: 'cat_shacochino', price: 204, sizes: [{ name: 'Orta', price: 204 }, { name: 'Büyük', price: 214 }] },
                { name: 'Blue Biscuit', category: 'cat_shacochino', price: 205, sizes: [{ name: 'Orta', price: 205 }, { name: 'Büyük', price: 215 }] },
                { name: 'Caramel Shacochino', category: 'cat_shacochino', price: 205, sizes: [{ name: 'Orta', price: 205 }, { name: 'Büyük', price: 215 }] },
                { name: 'Oreo Shacochino', category: 'cat_shacochino', price: 205, sizes: [{ name: 'Orta', price: 205 }, { name: 'Büyük', price: 215 }] },

                // EXTRAS
                { name: 'Extra Espresso', category: 'cat_extras', price: 40, sizes: [{ name: 'Tek Boy', price: 40 }] },
                { name: 'Extra Süt', category: 'cat_extras', price: 40, sizes: [{ name: 'Tek Boy', price: 40 }] },
                { name: 'Extra Krema', category: 'cat_extras', price: 40, sizes: [{ name: 'Tek Boy', price: 40 }] },
                { name: 'Extra Şurup', category: 'cat_extras', price: 40, sizes: [{ name: 'Tek Boy', price: 40 }] },
                { name: 'Extra Belçika Çikolata', category: 'cat_extras', price: 50, sizes: [{ name: 'Tek Boy', price: 50 }] }
            ];

            products.forEach(prod => {
                const prodRef = doc(collection(db, 'menu')); // Generate unique ID
                batch.set(prodRef, {
                    ...prod,
                    isAvailable: true,
                    stock: null,
                    imageUrl: '',
                    allergens: '',
                    shortDesc: prod.shortDesc || '',
                    description: '',
                    nutrition: { calories: '', caffeine: '', protein: '', fat: '', carbs: '' }
                });
            });

            await batch.commit();
            alert("✅ Menü ürünleri ve kategorileri başarıyla eklendi! Sayfayı yenileyebilirsiniz.");

        } catch (error) {
            console.error(error);
            alert("❌ Bir hata oluştu: " + error.message);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <button
            onClick={handleSeed}
            disabled={isSeeding}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${isSeeding ? 'bg-zinc-600 text-zinc-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
            title="Tüm Shaco Coffee menüsünü Firestore'a yükler."
        >
            <Database size={16} />
            {isSeeding ? 'Yükleniyor...' : 'Menüyü Seed Et (Toplu Yükle)'}
        </button>
    );
}

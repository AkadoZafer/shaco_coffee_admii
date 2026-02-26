import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

// Not: Mobil uygulamada koleksiyon adı 'menu' olarak kullanılıyor, o nedenle burada da 'menu' ile bağlanıyoruz.
export const subscribeProducts = (callback) => {
    return onSnapshot(collection(db, 'menu'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => (a.category > b.category ? 1 : -1)));
    });
};

export const addProduct = async (data) => {
    const docRef = await addDoc(collection(db, 'menu'), data);
    await logAction('CREATE', 'PRODUCT', docRef.id, `Yeni ürün eklendi: ${data.name}`);
    return docRef;
};

export const updateProduct = async (id, data) => {
    const result = await setDoc(doc(db, 'menu', id), data, { merge: true });
    await logAction('UPDATE', 'PRODUCT', id, `Ürün güncellendi.`);
    return result;
};

export const deleteProduct = async (id) => {
    const result = await deleteDoc(doc(db, 'menu', id));
    await logAction('DELETE', 'PRODUCT', id, `Ürün silindi.`);
    return result;
};

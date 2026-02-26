import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Not: Mobil uygulamada koleksiyon adı 'menu' olarak kullanılıyor, o nedenle burada da 'menu' ile bağlanıyoruz.
export const subscribeProducts = (callback) => {
    return onSnapshot(collection(db, 'menu'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => (a.category > b.category ? 1 : -1)));
    });
};

export const addProduct = async (data) => {
    return await addDoc(collection(db, 'menu'), data);
};

export const updateProduct = async (id, data) => {
    return await setDoc(doc(db, 'menu', id), data, { merge: true });
};

export const deleteProduct = async (id) => {
    return await deleteDoc(doc(db, 'menu', id));
};

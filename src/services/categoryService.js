import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

export const subscribeCategories = (callback) => {
    return onSnapshot(collection(db, 'categories'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => a.sortOrder - b.sortOrder));
    });
};

export const addCategory = async (data) => {
    const docRef = await addDoc(collection(db, 'categories'), data);
    await logAction('CREATE', 'CATEGORY', docRef.id, `Yeni kategori eklendi: ${data.name}`);
    return docRef;
};

export const updateCategory = async (id, data) => {
    const result = await setDoc(doc(db, 'categories', id), data, { merge: true });
    await logAction('UPDATE', 'CATEGORY', id, `Kategori güncellendi.`);
    return result;
};

export const deleteCategory = async (id) => {
    const result = await deleteDoc(doc(db, 'categories', id));
    await logAction('DELETE', 'CATEGORY', id, `Kategori silindi.`);
    return result;
};

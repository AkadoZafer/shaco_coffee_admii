import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeCategories = (callback) => {
    return onSnapshot(collection(db, 'categories'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => a.sortOrder - b.sortOrder));
    });
};

export const addCategory = async (data) => {
    return await addDoc(collection(db, 'categories'), data);
};

export const updateCategory = async (id, data) => {
    return await setDoc(doc(db, 'categories', id), data, { merge: true });
};

export const deleteCategory = async (id) => {
    return await deleteDoc(doc(db, 'categories', id));
};

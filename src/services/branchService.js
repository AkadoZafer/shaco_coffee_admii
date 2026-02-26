import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeBranches = (callback) => {
    return onSnapshot(collection(db, 'branches'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => a.name > b.name ? 1 : -1));
    });
};

export const addBranch = async (data) => {
    return await addDoc(collection(db, 'branches'), data);
};

export const updateBranch = async (id, data) => {
    return await setDoc(doc(db, 'branches', id), data, { merge: true });
};

export const deleteBranch = async (id) => {
    return await deleteDoc(doc(db, 'branches', id));
};

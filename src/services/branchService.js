import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

export const subscribeBranches = (callback) => {
    return onSnapshot(collection(db, 'branches'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => a.name > b.name ? 1 : -1));
    });
};

export const addBranch = async (data) => {
    const docRef = await addDoc(collection(db, 'branches'), data);
    await logAction('CREATE', 'BRANCH', docRef.id, `Yeni şube eklendi: ${data.name}`);
    return docRef;
};

export const updateBranch = async (id, data) => {
    const result = await setDoc(doc(db, 'branches', id), data, { merge: true });
    await logAction('UPDATE', 'BRANCH', id, `Şube bilgileri/çalışma saatleri güncellendi.`);
    return result;
};

export const deleteBranch = async (id) => {
    const result = await deleteDoc(doc(db, 'branches', id));
    await logAction('DELETE', 'BRANCH', id, `Şube silindi.`);
    return result;
};

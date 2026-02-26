import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

export const subscribeCampaigns = (callback) => {
    return onSnapshot(collection(db, 'campaigns'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
};

export const addCampaign = async (data) => {
    const docRef = await addDoc(collection(db, 'campaigns'), { ...data, createdAt: serverTimestamp() });
    await logAction('CREATE', 'CAMPAIGN', docRef.id, `Yeni kampanya eklendi: ${data.title}`);
    return docRef;
};

export const updateCampaign = async (id, data) => {
    const result = await setDoc(doc(db, 'campaigns', id), data, { merge: true });
    await logAction('UPDATE', 'CAMPAIGN', id, `Kampanya güncellendi.`);
    return result;
};

export const deleteCampaign = async (id) => {
    const result = await deleteDoc(doc(db, 'campaigns', id));
    await logAction('DELETE', 'CAMPAIGN', id, `Kampanya silindi.`);
    return result;
};

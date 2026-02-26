import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeCampaigns = (callback) => {
    return onSnapshot(collection(db, 'campaigns'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
};

export const addCampaign = async (data) => {
    return await addDoc(collection(db, 'campaigns'), { ...data, createdAt: serverTimestamp() });
};

export const updateCampaign = async (id, data) => {
    return await setDoc(doc(db, 'campaigns', id), data, { merge: true });
};

export const deleteCampaign = async (id) => {
    return await deleteDoc(doc(db, 'campaigns', id));
};

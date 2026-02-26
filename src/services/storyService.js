import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

export const subscribeStories = (callback) => {
    return onSnapshot(collection(db, 'stories'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
};

export const addStory = async (data) => {
    const docRef = await addDoc(collection(db, 'stories'), { ...data, createdAt: serverTimestamp() });
    await logAction('CREATE', 'STORY', docRef.id, `Yeni hikaye eklendi.`);
    return docRef;
};

export const updateStory = async (id, data) => {
    const result = await setDoc(doc(db, 'stories', id), data, { merge: true });
    await logAction('UPDATE', 'STORY', id, `Hikaye güncellendi.`);
    return result;
};

export const deleteStory = async (id) => {
    const result = await deleteDoc(doc(db, 'stories', id));
    await logAction('DELETE', 'STORY', id, `Hikaye silindi.`);
    return result;
};

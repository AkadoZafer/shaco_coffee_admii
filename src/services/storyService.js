import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeStories = (callback) => {
    return onSnapshot(collection(db, 'stories'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        callback(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
};

export const addStory = async (data) => {
    return await addDoc(collection(db, 'stories'), { ...data, createdAt: serverTimestamp() });
};

export const updateStory = async (id, data) => {
    return await setDoc(doc(db, 'stories', id), data, { merge: true });
};

export const deleteStory = async (id) => {
    return await deleteDoc(doc(db, 'stories', id));
};

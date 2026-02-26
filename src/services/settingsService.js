import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeSettings = (callback) => {
    return onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            callback(null);
        }
    });
};

export const updateSettings = async (data) => {
    return await setDoc(doc(db, 'settings', 'general'), data, { merge: true });
};

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

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
    const result = await setDoc(doc(db, 'settings', 'general'), data, { merge: true });
    await logAction('UPDATE', 'SETTINGS', 'general', `Genel sistem ayarları güncellendi.`);
    return result;
};

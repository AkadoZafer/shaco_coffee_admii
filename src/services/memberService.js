import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeMembers = (callback) => {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
        const list = [];
        snapshot.forEach(d => {
            const data = d.data();
            // Yalnızca üye ve misafirleri listele (adminleri gizleyebiliriz veya hepsini alabiliriz)
            list.push({ id: d.id, ...data });
        });
        callback(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
};

export const updateMemberTier = async (id, newTier) => {
    return await setDoc(doc(db, 'users', id), { tier: newTier }, { merge: true });
};

export const updateMemberBalance = async (id, newBalance) => {
    return await setDoc(doc(db, 'users', id), { balance: newBalance }, { merge: true });
};

export const deleteMember = async (id) => {
    // Sadece admin yetkisi olan bu işlemi yapabilir
    return await deleteDoc(doc(db, 'users', id));
};

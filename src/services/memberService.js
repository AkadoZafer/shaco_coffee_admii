import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

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
    const result = await setDoc(doc(db, 'users', id), { tier: newTier }, { merge: true });
    await logAction('UPDATE', 'MEMBER', id, `Üye tier seviyesi ${newTier} olarak değiştirildi.`);
    return result;
};

export const updateMemberBalance = async (id, newBalance) => {
    const result = await setDoc(doc(db, 'users', id), { balance: newBalance }, { merge: true });
    await logAction('UPDATE', 'MEMBER', id, `Üyenin yıldız bakiyesi ${newBalance} olarak güncellendi.`);
    return result;
};

export const deleteMember = async (id) => {
    // Sadece admin yetkisi olan bu işlemi yapabilir
    const result = await deleteDoc(doc(db, 'users', id));
    await logAction('DELETE', 'MEMBER', id, `Üye kaydı silindi.`);
    return result;
};

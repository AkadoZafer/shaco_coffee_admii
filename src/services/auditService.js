import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

const AUDIT_COLLECTION = 'auditLogs';

export const logAction = async (actionType, entityType, entityId, details = '') => {
    try {
        const user = auth.currentUser;
        if (!user) return; // Kullanıcı giriş yapmamışsa kaydetme

        await addDoc(collection(db, AUDIT_COLLECTION), {
            adminEmail: user.email,
            adminUid: user.uid,
            action: actionType, // Örn: 'CREATE', 'UPDATE', 'DELETE'
            entityType: entityType, // Örn: 'PRODUCT', 'CAMPAIGN', 'MEMBER'
            entityId: entityId,
            details: details,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Audit log eklenirken hata: ", error);
        // Hata fırlatmıyoruz, ana işlemleri (ürün ekleme vb.) bozmasın diye.
    }
};

export const getAuditLogs = async (maxLimit = 50) => {
    try {
        const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(maxLimit));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Audit loglar çekilerken hata: ", error);
        throw error;
    }
};

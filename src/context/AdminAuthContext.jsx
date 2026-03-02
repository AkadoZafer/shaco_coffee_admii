import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { throttle } from 'lodash';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
                    setAdminUser({ uid: user.uid, email: user.email, ...userDocSnap.data() });
                } else {
                    await signOut(auth);
                    setAdminUser(null);
                }
            } else {
                setAdminUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Idle Timeout Mekanizması (30 Dakika)
    useEffect(() => {
        let timeoutId;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (adminUser) {
                    logout();
                    // Alert yerine console ve custom ui (gerekirse entegre edilebilir ama bloklamaması için basit setTimeout)
                    setTimeout(() => alert("Oturum süreniz doldu. Hareketsizlik sebebiyle otomatik olarak çıkış yapıldı."), 500);
                }
            }, 30 * 60 * 1000); // 30 dakika
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        // Throttled event listener (performans için)
        const throttledReset = throttle(resetTimeout, 1000);

        if (adminUser) {
            resetTimeout();
            events.forEach(e => window.addEventListener(e, throttledReset));
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(e => window.removeEventListener(e, throttledReset));
        };
    }, [adminUser]);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            setAdminUser({ uid: user.uid, email: user.email, ...userDocSnap.data() });
            return user;
        } else {
            await signOut(auth);
            throw new Error('Bu panele erişim yetkiniz (admin) bulunmuyor.');
        }
    };

    const value = { adminUser, loading, login, logout };

    return (
        <AdminAuthContext.Provider value={value}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);

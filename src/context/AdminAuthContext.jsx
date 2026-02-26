import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Sadece role === 'admin' kontrolü
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
                    setAdminUser({ uid: user.uid, email: user.email, ...userDocSnap.data() });
                } else {
                    // Admin değilse hesaptan çık
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

    const logout = () => signOut(auth);

    const value = { adminUser, loading, login, logout };

    return (
        <AdminAuthContext.Provider value={value}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);

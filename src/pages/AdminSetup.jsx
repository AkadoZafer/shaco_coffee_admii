import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function AdminSetup() {
    const [msg, setMsg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCred.user.uid), {
                email: email,
                role: 'admin',
                name: 'Patron',
                balance: 150,
                joined: new Date().toISOString()
            });
            setMsg('BAŞARILI! Yeni yönetici hesabınız Firebase\'e eklendi. Şimdi giriş paneline dönüp girebilirsiniz.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setMsg('HATA: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-white">
            <h1 className="text-3xl font-bold mb-4 text-shaco-red">Özel Yönetici Oluşturma</h1>
            <p className="text-zinc-400 mb-8 max-w-md">Eski admin hesabı kilitlendiği için lütfen kendinize GÜNCEL bir e-posta ve şifre belirleyerek yeni bir Admin (Patron) hesabı yaratın.</p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4 w-full max-w-sm">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Kendi E-Postanız" required className="bg-zinc-900 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-shaco-red" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Yeni Şifre (En az 6 haneli)" required minLength={6} className="bg-zinc-900 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-shaco-red" />

                <button type="submit" className="bg-shaco-red text-white font-bold py-4 px-8 rounded-xl hover:bg-red-600 transition-colors mt-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    Yeni Admin Hesabımı Yarat
                </button>
            </form>

            {msg && <div className={`mt-8 p-4 border rounded-xl font-mono text-sm max-w-lg ${msg.includes('BAŞARILI') ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>{msg}</div>}
        </div>
    );
}

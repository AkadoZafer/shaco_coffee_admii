import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { auth } from '../firebase';

export default function AdminQRPay() {
    const [scanResult, setScanResult] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );
        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                if (decodedText && decodedText.length > 20) {
                    setScanResult(decodedText);
                    scanner.pause(true); // pause scanning
                }
            },
            () => { }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Kamera temizlenemedi", e));
            }
        };
    }, []);

    const resetScan = () => {
        setScanResult(null);
        setAmount('');
        if (scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    const handleCharge = async () => {
        if (!amount || amount <= 0) {
            Swal.fire('Hata', 'Geçerli bir tahsilat tutarı girin.', 'error');
            return;
        }

        if (!scanResult) {
            Swal.fire('Hata', 'Önce müşterinin QR kodunu okutun.', 'error');
            return;
        }

        setLoading(true);
        try {
            const idToken = await auth.currentUser.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'https://web-production-6ef52.up.railway.app';

            const req = await fetch(`${apiUrl}/api/wallet/qr-charge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    token: scanResult,
                    amount: Number(amount)
                })
            });

            const data = await req.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Tahsilat Başarılı!',
                    text: `${data.customerName} adlı müşteriden ${amount} ₺ çekildi. Kalan Bakiye: ${data.newBalance} ₺`
                });
                resetScan();
            } else {
                Swal.fire('Hata!', data.error || 'Tahsilat başarısız oldu.', 'error');
                resetScan();
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Bağlantı Hatası', 'Sunucuya ulaşılamadı.', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-black uppercase tracking-widest mb-2 flex items-center gap-3">
                <Camera className="text-shaco-red" size={32} />
                QR Tahsilat
            </h1>
            <p className="text-zinc-400 mb-8 font-medium">Müşteri cüzdanından temassız ödeme alın.</p>

            <div className="glass p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">

                    {!scanResult ? (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-4 text-center">Kameraya QR Kodu Okutun</h3>
                            <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-zinc-700 bg-black"></div>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                            <CheckCircle className="mx-auto text-emerald-500 mb-3" size={48} />
                            <h3 className="text-xl font-bold text-emerald-400 mb-1">QR Kod Okundu</h3>
                            <p className="text-zinc-400 text-sm break-all font-mono opacity-50">{scanResult.substring(0, 15)}...</p>

                            <button onClick={resetScan} className="mt-4 text-sm font-bold text-zinc-400 hover:text-white flex items-center gap-2 justify-center mx-auto transition-colors">
                                <RefreshCw size={14} /> Tekrar Okut
                            </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wide">
                                Tahsil Edilecek Tutar (₺)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                disabled={!scanResult || loading}
                                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-4 text-xl font-bold text-white focus:outline-none focus:border-shaco-red transition-all disabled:opacity-50 text-center"
                                placeholder="Örn: 120"
                            />
                        </div>

                        <button
                            onClick={handleCharge}
                            disabled={!scanResult || !amount || loading}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${scanResult && amount && !loading
                                    ? 'bg-shaco-red text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Bakiyeden Çek'
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

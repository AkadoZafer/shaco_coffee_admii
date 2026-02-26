import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/auditService';
import { Shield, Loader2, Calendar, User, FileText } from 'lucide-react';

export default function AdminAudit() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs(100);
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Bilinmiyor';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
                        <Shield className="text-shaco-red" size={32} />
                        Denetim Günlüğü
                    </h1>
                    <p className="text-zinc-400 font-medium">Sistemde yapılan kritik değişikliklerin (Audit Log) geçmişi.</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="bg-zinc-900 border border-white/10 hover:border-shaco-red text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                    <Calendar size={16} />
                    Yenile
                </button>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                <th className="p-4 pl-6">Tarih</th>
                                <th className="p-4">Yönetici</th>
                                <th className="p-4">İşlem Tipi</th>
                                <th className="p-4">Modül</th>
                                <th className="p-4">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-zinc-500">
                                        <Loader2 size={32} className="animate-spin mx-auto mb-4 text-shaco-red" />
                                        Loglar yükleniyor...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-zinc-500">
                                        Sistemde henüz bir log kaydı bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6 text-sm text-zinc-400 whitespace-nowrap">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-white">
                                                <User size={14} className="text-shaco-red" />
                                                {log.adminEmail}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                                                ${log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                                                ${log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                                                ${log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                                            `}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-zinc-300">
                                            {log.entityType}
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400 max-w-xs truncate" title={log.details}>
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-zinc-600 shrink-0" />
                                                <span className="truncate">{log.details}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

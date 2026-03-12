import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { getErrorLogs, updateErrorResolved } from '../services/errorService';

const SOURCE_OPTIONS = [
    { value: 'all', label: 'Tum Kaynaklar' },
    { value: 'app', label: 'Uygulama' },
    { value: 'admin', label: 'Admin Paneli' },
    { value: 'backend', label: 'Backend' }
];

const SEVERITY_OPTIONS = [
    { value: 'all', label: 'Tum Seviyeler' },
    { value: 'error', label: 'Hata' },
    { value: 'warning', label: 'Uyari' }
];

const RESOLUTION_OPTIONS = [
    { value: 'all', label: 'Tum Durumlar' },
    { value: 'open', label: 'Acik' },
    { value: 'resolved', label: 'Cozuldu' }
];

export default function AdminErrors() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingIds, setUpdatingIds] = useState({});
    const [filters, setFilters] = useState({
        source: 'all',
        severity: 'all',
        resolved: 'all',
        search: ''
    });

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getErrorLogs(filters);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load error logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    const onSearchSubmit = async (event) => {
        event.preventDefault();
        await loadLogs();
    };

    const toggleResolved = async (log) => {
        const nextResolved = !log.resolved;
        setUpdatingIds((prev) => ({ ...prev, [log.id]: true }));
        try {
            await updateErrorResolved(log.id, nextResolved);
            setLogs((prev) => prev.map((item) => (
                item.id === log.id ? { ...item, resolved: nextResolved } : item
            )));
        } catch (error) {
            console.error('Failed to update resolved status:', error);
        } finally {
            setUpdatingIds((prev) => ({ ...prev, [log.id]: false }));
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
                        <AlertTriangle className="text-shaco-red" size={30} />
                        Hata Kayitlari
                    </h1>
                    <p className="text-zinc-400 font-medium">Uygulama, admin paneli ve backend kaynakli calisma zamani hatalari.</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="bg-zinc-900 border border-white/10 hover:border-shaco-red text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 self-start md:self-auto"
                >
                    <RefreshCw size={16} />
                    Yenile
                </button>
            </div>

            <form onSubmit={onSearchSubmit} className="glass rounded-2xl border border-white/5 p-4 md:p-5 mb-5 grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                    value={filters.source}
                    onChange={(event) => setFilters((prev) => ({ ...prev, source: event.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100"
                >
                    {SOURCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <select
                    value={filters.severity}
                    onChange={(event) => setFilters((prev) => ({ ...prev, severity: event.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100"
                >
                    {SEVERITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <select
                    value={filters.resolved}
                    onChange={(event) => setFilters((prev) => ({ ...prev, resolved: event.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100"
                >
                    {RESOLUTION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <input
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    placeholder="Mesaj, rota, kullanici ara..."
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 md:col-span-2"
                />
            </form>

            <div className="glass rounded-3xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                <th className="p-4 pl-6">Tarih</th>
                                <th className="p-4">Kaynak</th>
                                <th className="p-4">Seviye</th>
                                <th className="p-4">Mesaj</th>
                                <th className="p-4">Rota</th>
                                <th className="p-4">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-zinc-500">
                                        <Loader2 size={32} className="animate-spin mx-auto mb-4 text-shaco-red" />
                                        Kayitlar yukleniyor...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-zinc-500">
                                        Secilen filtrelere uygun hata kaydi bulunamadi.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors align-top">
                                        <td className="p-4 pl-6 text-sm text-zinc-400 whitespace-nowrap">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-zinc-300 uppercase">{log.source || '-'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${log.severity === 'warning'
                                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                                : 'bg-red-500/10 text-red-300 border border-red-500/20'
                                                }`}>
                                                {log.severity || 'error'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-zinc-200 max-w-md whitespace-pre-wrap break-words">
                                            <div>{log.message || '-'}</div>
                                            {log.userId ? <div className="text-xs text-zinc-500 mt-1">user: {log.userId}</div> : null}
                                            {log.appVersion ? <div className="text-xs text-zinc-600">v: {log.appVersion}</div> : null}
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400 break-all">{log.route || '-'}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => void toggleResolved(log)}
                                                disabled={!!updatingIds[log.id]}
                                                className={`min-w-24 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${log.resolved
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                    : 'bg-zinc-900 border-white/10 text-zinc-200 hover:border-shaco-red'
                                                    } disabled:opacity-60`}
                                            >
                                                {updatingIds[log.id] ? '...' : log.resolved ? 'Cozuldu' : 'Acik'}
                                            </button>
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

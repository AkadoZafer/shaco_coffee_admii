import { db } from '../firebase';
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    updateDoc,
    doc
} from 'firebase/firestore';

const ERROR_COLLECTION = 'error_logs';

const normalizeText = (value) => (value || '').toString().toLowerCase();

export const getErrorLogs = async ({
    source = 'all',
    severity = 'all',
    resolved = 'all',
    search = '',
    maxLimit = 200
} = {}) => {
    const q = query(
        collection(db, ERROR_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

    const searchText = normalizeText(search);

    return logs.filter((log) => {
        const sourceOk = source === 'all' ? true : log.source === source;
        const severityOk = severity === 'all' ? true : log.severity === severity;
        const resolvedOk = resolved === 'all'
            ? true
            : resolved === 'resolved'
                ? log.resolved === true
                : log.resolved === false;

        const searchable = [
            log.message,
            log.route,
            log.userId,
            log.appVersion
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        const searchOk = searchText ? searchable.includes(searchText) : true;

        return sourceOk && severityOk && resolvedOk && searchOk;
    });
};

export const updateErrorResolved = async (errorId, resolved) => {
    await updateDoc(doc(db, ERROR_COLLECTION, errorId), { resolved: !!resolved });
};

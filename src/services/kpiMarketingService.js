import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditService';

const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const CAMPAIGNS_COLLECTION = 'campaigns';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getOrderDate = (order) => toDate(order.timestamp) || toDate(order.createdAt);

const isOrderCounted = (order) => order?.status !== 'İptal Edildi' && typeof order?.total === 'number';

const getStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getRepeatRate = (orders, windowDays) => {
    const now = Date.now();
    const windowStart = now - (windowDays * ONE_DAY_MS);
    const byUser = new Map();

    for (const order of orders) {
        if (!isOrderCounted(order)) continue;
        const orderDate = getOrderDate(order);
        if (!orderDate) continue;
        if (orderDate.getTime() < windowStart) continue;
        if (!order.userId) continue;

        byUser.set(order.userId, (byUser.get(order.userId) || 0) + 1);
    }

    const totalUsers = byUser.size;
    if (totalUsers === 0) return 0;

    let repeatedUsers = 0;
    for (const count of byUser.values()) {
        if (count >= 2) repeatedUsers += 1;
    }

    return Math.round((repeatedUsers / totalUsers) * 100);
};

export const subscribeKpiMetrics = (callback) => {
    const state = {
        orders: [],
        users: []
    };

    const emit = () => {
        const now = new Date();
        const todayStart = getStartOfDay(now).getTime();

        const todaysOrders = state.orders.filter((order) => {
            if (!isOrderCounted(order)) return false;
            const orderDate = getOrderDate(order);
            if (!orderDate) return false;
            return orderDate.getTime() >= todayStart;
        });

        const dailyOrders = todaysOrders.length;
        const dailyRevenue = todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgBasket = dailyOrders > 0 ? Math.round(dailyRevenue / dailyOrders) : 0;

        const payload = {
            dailyOrders,
            dailyRevenue,
            avgBasket,
            repeatRate7d: getRepeatRate(state.orders, 7),
            repeatRate30d: getRepeatRate(state.orders, 30),
            totalUsers: state.users.length
        };

        callback(payload);
    };

    const unsubOrders = onSnapshot(collection(db, ORDERS_COLLECTION), (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
        state.orders = list;
        emit();
    });

    const unsubUsers = onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
        state.users = list;
        emit();
    });

    return () => {
        unsubOrders();
        unsubUsers();
    };
};

const parseBirthDate = (value) => {
    if (!value || typeof value !== 'string') return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!year || !month || !day) return null;
    return { year, month, day };
};

const hasOrderInLastDays = (ordersByUser, userId, days, nowMs) => {
    const userOrders = ordersByUser.get(userId) || [];
    const threshold = nowMs - (days * ONE_DAY_MS);
    return userOrders.some((orderDate) => orderDate.getTime() >= threshold);
};

const hasAnyOrder = (ordersByUser, userId) => (ordersByUser.get(userId) || []).length > 0;

const sameMonthDay = (a, b) => a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const hasTodayAutomationCampaign = async (automationType) => {
    const campaignsSnap = await getDocs(collection(db, CAMPAIGNS_COLLECTION));
    const todayStart = getStartOfDay(new Date()).getTime();

    let exists = false;
    campaignsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.automationType !== automationType) return;
        const createdAt = toDate(data.createdAt);
        if (!createdAt) return;
        if (createdAt.getTime() >= todayStart) exists = true;
    });

    return exists;
};

export const runMarketingAutomation = async ({
    winbackEnabled,
    winbackDiscountPercent,
    birthdayEnabled,
    birthdayDiscountPercent
}) => {
    const [ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, ORDERS_COLLECTION)),
        getDocs(collection(db, USERS_COLLECTION))
    ]);

    const now = new Date();
    const nowMs = now.getTime();

    const ordersByUser = new Map();
    ordersSnap.forEach((docSnap) => {
        const order = docSnap.data();
        if (!isOrderCounted(order) || !order.userId) return;
        const orderDate = getOrderDate(order);
        if (!orderDate) return;
        const list = ordersByUser.get(order.userId) || [];
        list.push(orderDate);
        ordersByUser.set(order.userId, list);
    });

    let winbackCount = 0;
    let birthdayCount = 0;
    const createdCampaignIds = [];

    const users = [];
    usersSnap.forEach((docSnap) => users.push({ id: docSnap.id, ...docSnap.data() }));

    if (winbackEnabled) {
        const alreadyRanToday = await hasTodayAutomationCampaign('winback-30d');
        if (!alreadyRanToday) {
            const eligibleWinback = users.filter((user) => {
                if (!user?.id) return false;
                if (!hasAnyOrder(ordersByUser, user.id)) return false;
                return !hasOrderInLastDays(ordersByUser, user.id, 30, nowMs);
            });

            winbackCount = eligibleWinback.length;
            if (winbackCount > 0) {
                const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
                    title: `30 Gün Pasif Üyeye %${winbackDiscountPercent} Kupon`,
                    subtitle: `${winbackCount} uygun üye tespit edildi. Kupon kampanyası otomatik oluşturuldu.`,
                    emoji: '🎯',
                    gradient: 'from-emerald-500 to-teal-800',
                    isActive: true,
                    automationType: 'winback-30d',
                    targetCount: winbackCount,
                    discountPercent: Number(winbackDiscountPercent) || 10,
                    createdAt: serverTimestamp()
                });
                createdCampaignIds.push(docRef.id);
            }
        }
    }

    if (birthdayEnabled) {
        const alreadyRanToday = await hasTodayAutomationCampaign('birthday');
        if (!alreadyRanToday) {
            const eligibleBirthday = users.filter((user) => {
                if (!user?.birthDate) return false;
                const parsedBirth = parseBirthDate(user.birthDate);
                if (!parsedBirth) return false;
                const birthDate = new Date(parsedBirth.year, parsedBirth.month - 1, parsedBirth.day);
                return sameMonthDay(birthDate, now);
            });

            birthdayCount = eligibleBirthday.length;
            if (birthdayCount > 0) {
                const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
                    title: `Doğum Günü Üyelerine %${birthdayDiscountPercent} Kupon`,
                    subtitle: `${birthdayCount} üye için doğum günü kampanyası otomatik oluşturuldu.`,
                    emoji: '🎂',
                    gradient: 'from-purple-600 to-black',
                    isActive: true,
                    automationType: 'birthday',
                    targetCount: birthdayCount,
                    discountPercent: Number(birthdayDiscountPercent) || 20,
                    createdAt: serverTimestamp()
                });
                createdCampaignIds.push(docRef.id);
            }
        }
    }

    await logAction(
        'UPDATE',
        'MARKETING_AUTOMATION',
        'daily-flow',
        `Otomasyon çalıştı. 30g pasif: ${winbackCount}, doğum günü: ${birthdayCount}`
    );

    const summary = {
        winbackCount,
        birthdayCount,
        createdCampaignIds,
        ranAt: Date.now(),
        ranAtIso: new Date().toISOString()
    };

    await setDoc(
        doc(db, 'settings', 'general'),
        { marketingAutomationLastRun: summary },
        { merge: true }
    );

    return summary;
};

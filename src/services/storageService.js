const storagePrefix = 'letmegrab:v1';

export const storageKeys = {
    users: `${storagePrefix}:users`,
    localSession: `${storagePrefix}:session`,
    temporarySession: `${storagePrefix}:session:temporary`,
    settings: userId => `${storagePrefix}:settings:${userId}`,
    catalog: userId => `${storagePrefix}:catalog:${userId}`
};

export const safeRead = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const safeWrite = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const readUsers = () => {
    const users = safeRead(storageKeys.users, []);
    return Array.isArray(users) ? users : [];
};

export const writeUsers = users => safeWrite(storageKeys.users, users);

export const readCatalog = userId => {
    const catalog = safeRead(storageKeys.catalog(userId), { products: [], categories: [] });
    return {
        products: Array.isArray(catalog.products) ? catalog.products : [],
        categories: Array.isArray(catalog.categories) ? catalog.categories : []
    };
};

export const writeCatalog = (userId, catalog) => safeWrite(storageKeys.catalog(userId), catalog);

export const readSettings = userId => ({
    businessName: '',
    currency: 'INR',
    theme: 'light',
    ...safeRead(storageKeys.settings(userId), {})
});

export const writeSettings = (userId, settings) => safeWrite(storageKeys.settings(userId), settings);

export const readSessionId = () => (
    safeRead(storageKeys.localSession, null)?.userId
    || safeReadSession(storageKeys.temporarySession)?.userId
    || null
);

const safeReadSession = key => {
    try {
        const value = sessionStorage.getItem(key);
        return value === null ? null : JSON.parse(value);
    } catch {
        return null;
    }
};

export const writeSessionId = (userId, remember = true) => {
    localStorage.removeItem(storageKeys.localSession);
    sessionStorage.removeItem(storageKeys.temporarySession);
    if (remember) safeWrite(storageKeys.localSession, { userId });
    else sessionStorage.setItem(storageKeys.temporarySession, JSON.stringify({ userId }));
};

export const clearSession = () => {
    localStorage.removeItem(storageKeys.localSession);
    sessionStorage.removeItem(storageKeys.temporarySession);
};
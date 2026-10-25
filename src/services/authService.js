import { readSessionId, readUsers, safeRead, safeWrite, storageKeys, writeSessionId, writeUsers } from './storageService';

const legacyUsersKey = 'users';
const legacySessionKey = 'loggedInUser';
const legacyCatalogKey = 'products';
const encoder = new TextEncoder();
const iterations = 180000;

const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const encodeBase64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decodeBase64 = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));

const createPasswordHash = async (password, salt = globalThis.crypto.getRandomValues(new Uint8Array(16))) => {
    const key = await globalThis.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const hash = await globalThis.crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
    return { passwordSalt: encodeBase64(salt), passwordHash: encodeBase64(hash) };
};

const verifyPassword = async (password, user) => {
    if (!user.passwordSalt || !user.passwordHash) return false;
    const salt = decodeBase64(user.passwordSalt);
    const candidate = await createPasswordHash(password, salt);
    return candidate.passwordHash === user.passwordHash;
};

const getPublicUser = ({ passwordHash, passwordSalt, ...user }) => user;

export const migrateLegacyData = async () => {
    const legacyUsers = safeRead(legacyUsersKey, []);
    const currentUsers = readUsers();
    const migratedUsers = [];
    const isNewCatalogSaved = userId => localStorage.getItem(storageKeys.catalog(userId)) !== null;

    if (Array.isArray(legacyUsers)) {
        for (const legacyUser of legacyUsers) {
            const email = (legacyUser.email || '').trim().toLowerCase();
            if (!email || currentUsers.some(user => user.email === email)) continue;
            const credential = legacyUser.password
                ? await createPasswordHash(legacyUser.password)
                : { passwordSalt: '', passwordHash: '' };
            migratedUsers.push({
                id: makeId(),
                fullName: (legacyUser.fullName || legacyUser.username || '').trim(),
                email,
                createdAt: new Date().toISOString(),
                ...credential
            });
        }
    }

    const allUsers = [...currentUsers, ...migratedUsers];
    if (migratedUsers.length) writeUsers(allUsers);

    const legacyProducts = safeRead(legacyCatalogKey, []);
    const firstLegacyUser = migratedUsers[0];
    if (firstLegacyUser && Array.isArray(legacyProducts) && legacyProducts.length && !isNewCatalogSaved(firstLegacyUser.id)) {
        const categories = [];
        const products = legacyProducts.map(product => {
            const categoryName = (product.category || 'Uncategorized').trim();
            let category = categories.find(item => item.name.toLowerCase() === categoryName.toLowerCase());
            if (!category) {
                category = { id: makeId(), name: categoryName, createdAt: new Date().toISOString() };
                categories.push(category);
            }
            return {
                id: product.id || makeId(),
                name: product.name || product.title || 'Untitled product',
                categoryId: category.id,
                price: Number(product.price) || 0,
                image: null,
                description: product.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });
        safeWrite(storageKeys.catalog(firstLegacyUser.id), { products, categories });
    }

    const legacySession = safeRead(legacySessionKey, null);
    if (legacySession) {
        const sessionUser = allUsers.find(user => (
            user.email === (legacySession.email || '').trim().toLowerCase()
            || user.fullName === legacySession.username
        ));
        if (sessionUser) writeSessionId(sessionUser.id);
    }

    if (Array.isArray(legacyUsers)) localStorage.removeItem(legacyUsersKey);
    if (Array.isArray(legacyProducts)) localStorage.removeItem(legacyCatalogKey);
    localStorage.removeItem(legacySessionKey);
};

export const getCurrentUser = () => {
    const userId = readSessionId();
    if (!userId) return null;
    const user = readUsers().find(item => item.id === userId);
    return user ? getPublicUser(user) : null;
};

export const registerUser = async ({ fullName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    if (users.some(user => user.email === normalizedEmail)) {
        throw new Error('An account with this email already exists.');
    }
    const credential = await createPasswordHash(password);
    const user = {
        id: makeId(),
        fullName: fullName.trim(),
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
        ...credential
    };
    writeUsers([...users, user]);
    writeSessionId(user.id);
    return getPublicUser(user);
};

export const loginUser = async ({ email, password, remember = true }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = readUsers().find(item => item.email === normalizedEmail);
    if (!user || !(await verifyPassword(password, user))) {
        throw new Error('Email or password is incorrect.');
    }
    writeSessionId(user.id, remember);
    return getPublicUser(user);
};

export const exportUserData = userId => readUsers().find(user => user.id === userId) || null;

export const updateUser = (userId, updates) => {
    const users = readUsers();
    const currentUser = users.find(user => user.id === userId);
    if (!currentUser) throw new Error('Account could not be found.');
    const email = (updates.email || currentUser.email).trim().toLowerCase();
    if (users.some(user => user.id !== userId && user.email === email)) {
        throw new Error('An account with this email already exists.');
    }
    const updatedUser = { ...currentUser, ...updates, email };
    writeUsers(users.map(user => user.id === userId ? updatedUser : user));
    return getPublicUser(updatedUser);
};
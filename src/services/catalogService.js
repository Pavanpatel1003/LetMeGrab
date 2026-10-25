import { readCatalog, writeCatalog } from './storageService';

const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const getCatalog = userId => readCatalog(userId);
export const saveCatalog = (userId, catalog) => writeCatalog(userId, catalog);

export const createCategory = (name, categories) => ({
    id: makeId(),
    name: name.trim(),
    createdAt: new Date().toISOString()
});

export const createProduct = ({ name, categoryId, price, image, description }, existing) => {
    const now = new Date().toISOString();
    return {
        id: makeId(),
        name: name.trim(),
        categoryId,
        price: Number(price),
        image: image || null,
        description: (description || '').trim(),
        createdAt: now,
        updatedAt: now,
        ...existing
    };
};
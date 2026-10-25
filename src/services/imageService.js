const databaseName = 'letmegrab-media';
const storeName = 'product-images';

const openDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const useStore = async (mode, operation) => {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const saveProductImage = file => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return useStore('readwrite', store => store.put(file, id)).then(() => id);
};

export const getProductImage = id => useStore('readonly', store => store.get(id));

export const deleteProductImage = id => useStore('readwrite', store => store.delete(id));

export const validateImageFile = file => {
    if (!file) return '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPG, PNG, or WebP image.';
    if (file.size > 3 * 1024 * 1024) return 'Image must be 3 MB or smaller.';
    return '';
};
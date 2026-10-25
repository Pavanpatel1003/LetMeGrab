import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { readCatalog, readSettings, writeCatalog, writeSettings } from '../services/storageService';
import { addSampleCatalog } from '../services/sampleCatalog';

const CatalogContext = createContext(null);

export const CatalogProvider = ({ children }) => {
    const { user } = useAuth();
    const [catalog, setCatalog] = useState({ products: [], categories: [] });
    const [settings, setSettings] = useState({ businessName: '', currency: 'INR', theme: 'light' });

    useEffect(() => {
        if (!user) return;
        const savedCatalog = readCatalog(user.id);
        const hasSamples = savedCatalog.products.some(product => product.isSample);
        if (hasSamples) {
            const upgradedCatalog = addSampleCatalog(savedCatalog);
            if (upgradedCatalog.addedProducts || upgradedCatalog.addedCategories || upgradedCatalog.updatedProducts) {
                writeCatalog(user.id, upgradedCatalog.catalog);
            }
            setCatalog(upgradedCatalog.catalog);
        } else setCatalog(savedCatalog);
        setSettings(readSettings(user.id));
    }, [user?.id]);

    useEffect(() => {
        document.documentElement.dataset.theme = settings.theme || 'light';
    }, [settings.theme]);

    const saveCatalog = nextCatalog => {
        writeCatalog(user.id, nextCatalog);
        setCatalog(nextCatalog);
    };

    const saveSettings = nextSettings => {
        writeSettings(user.id, nextSettings);
        setSettings(nextSettings);
    };

    return <CatalogContext.Provider value={{ catalog, settings, saveCatalog, saveSettings }}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (!context) throw new Error('useCatalog must be used inside CatalogProvider.');
    return context;
};
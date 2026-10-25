import React, { useState } from 'react';
import { Download, LogOut, Moon, Sun, Trash2, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useToast } from '../contexts/ToastContext';
import { deleteProductImage } from '../services/imageService';

const downloadFile = (fileName, content, type) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
    }, 1000);
};

const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

const Settings = () => {
    const { user, updateProfile, logout } = useAuth();
    const { catalog, settings, saveCatalog, saveSettings } = useCatalog();
    const { notify } = useToast();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ fullName: user.fullName, email: user.email });
    const [businessName, setBusinessName] = useState(settings.businessName);
    const [currency, setCurrency] = useState(settings.currency || 'INR');
    const [theme, setTheme] = useState(settings.theme || 'light');
    const [profileError, setProfileError] = useState('');
    const [confirmClear, setConfirmClear] = useState(false);

    const saveProfile = event => {
        event.preventDefault();
        if (!profile.fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
            setProfileError('Add your name and a valid email address.');
            return;
        }
        try {
            updateProfile(profile);
            setProfileError('');
            notify('Profile details saved.');
        } catch (error) {
            setProfileError(error.message);
        }
    };

    const savePreferences = event => {
        event.preventDefault();
        saveSettings({ ...settings, businessName: businessName.trim(), currency, theme });
        notify('Preferences saved.');
    };

    const exportJson = () => {
        const exportData = { exportedAt: new Date().toISOString(), businessName, currency, categories: catalog.categories, products: catalog.products };
        downloadFile('letmegrab-catalog.json', JSON.stringify(exportData, null, 2), 'application/json');
        notify('Catalog JSON downloaded.');
    };

    const exportCsv = () => {
        const rows = [['Product', 'Category', 'Price', 'Description', 'Created at'], ...catalog.products.map(product => [product.name, catalog.categories.find(category => category.id === product.categoryId)?.name || '', product.price, product.description, product.createdAt])];
        downloadFile('letmegrab-products.csv', rows.map(row => row.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
        notify('Products CSV downloaded.');
    };

    const clearCatalog = async () => {
        const sampleProducts = catalog.products.filter(product => product.isSample);
        const sampleCategoryIds = new Set(sampleProducts.map(product => product.categoryId));
        const sampleCategories = catalog.categories.filter(category => category.isSample || sampleCategoryIds.has(category.id));
        await Promise.all(catalog.products.filter(product => !product.isSample && product.image).map(product => deleteProductImage(product.image).catch(() => null)));
        saveCatalog({ products: sampleProducts, categories: sampleCategories });
        setConfirmClear(false);
        notify(sampleProducts.length ? 'Your products were cleared. Example items were kept.' : 'Catalog data cleared.', 'info');
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <main className="page-content settings-page">
            <section className="page-title-row"><div><p className="page-eyebrow">MAKE IT YOURS</p><h1>Settings</h1><p className="page-subtitle">Manage your profile and catalog preferences.</p></div></section>
            <div className="settings-stack">
                <section className="settings-panel"><div className="settings-panel-heading"><span className="settings-panel-icon"><UserRound size={18} /></span><div><h2>Profile</h2><p>Your account details</p></div></div><form className="settings-form" onSubmit={saveProfile}><div className="settings-grid"><label className="form-field"><span>Full name</span><input value={profile.fullName} onChange={event => setProfile(previous => ({ ...previous, fullName: event.target.value }))} /></label><label className="form-field"><span>Email address</span><input type="email" value={profile.email} onChange={event => setProfile(previous => ({ ...previous, email: event.target.value }))} /></label></div>{profileError && <p className="form-error" role="alert">{profileError}</p>}<button className="button button-primary" type="submit">Save profile</button></form></section>
                <section className="settings-panel"><div className="settings-panel-heading"><span className="settings-panel-icon"><Sun size={18} /></span><div><h2>Workspace preferences</h2><p>Personalize your catalog view</p></div></div><form className="settings-form" onSubmit={savePreferences}><div className="settings-grid"><label className="form-field"><span>Business name <small>Optional</small></span><input value={businessName} onChange={event => setBusinessName(event.target.value)} placeholder="Your shop or business" /></label><label className="form-field"><span>Preferred currency</span><select value={currency} onChange={event => setCurrency(event.target.value)}><option value="INR">INR · ₹ Indian Rupee</option><option value="USD">USD · $ US Dollar</option><option value="EUR">EUR · € Euro</option><option value="GBP">GBP · £ Pound Sterling</option></select></label></div><fieldset className="theme-setting"><legend>Theme</legend><label className={`theme-choice${theme === 'light' ? ' is-selected' : ''}`}><input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} /><Sun size={16} /><span>Light</span></label><label className={`theme-choice${theme === 'dark' ? ' is-selected' : ''}`}><input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} /><Moon size={16} /><span>Dark</span></label></fieldset><button className="button button-primary" type="submit">Save preferences</button></form></section>
                <section className="settings-panel"><div className="settings-panel-heading"><span className="settings-panel-icon"><Download size={18} /></span><div><h2>Your catalog data</h2><p>Download a copy for your records</p></div></div><div className="export-row"><span><strong>Export catalog</strong><small>JSON includes products and categories. CSV includes product details.</small></span><div className="export-actions"><button className="button button-secondary" type="button" onClick={exportJson}>Export JSON</button><button className="button button-secondary" type="button" onClick={exportCsv}>Export CSV</button></div></div></section>
                <section className="settings-panel settings-danger-panel"><div className="settings-panel-heading"><span className="settings-panel-icon settings-danger-icon"><Trash2 size={18} /></span><div><h2>Clear catalog data</h2><p>Remove your products and categories from this browser. Read-only example items will stay.</p></div></div><div className="export-row"><span><strong>This only affects your current account</strong><small>Your profile, sign-in details, and examples will remain.</small></span><button className="button button-danger-outline" type="button" onClick={() => setConfirmClear(true)}>Clear catalog</button></div></section>
                <section className="settings-panel settings-logout-panel"><div className="settings-panel-heading"><span className="settings-panel-icon"><LogOut size={18} /></span><div><h2>Sign out</h2><p>End this local demo session.</p></div></div><button className="button button-secondary" type="button" onClick={handleLogout}>Log out</button></section>
                <p className="local-data-note">Demo limitation: profile and catalog data stay in this browser and do not sync to another device. Passwords are stored as salted hashes, but production authentication requires a secure backend.</p>
            </div>
            <ConfirmDialog open={confirmClear} title="Clear your catalog?" message="Your products and custom categories will be removed from this browser. Read-only example items will remain." confirmLabel="Clear catalog" destructive onClose={() => setConfirmClear(false)} onConfirm={clearCatalog} />
        </main>
    );
};

export default Settings;
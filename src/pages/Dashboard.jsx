import React from 'react';
import { ArrowRight, Clock3, Package, Plus, Sparkles, Tags } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import ProductCard from '../components/ProductCard';
import { useToast } from '../contexts/ToastContext';
import { addSampleCatalog } from '../services/sampleCatalog';

const Dashboard = () => {
    const { user } = useAuth();
    const { catalog, settings, saveCatalog } = useCatalog();
    const { notify } = useToast();
    const navigate = useNavigate();
    const products = [...catalog.products].sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt));
    const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentCount = products.filter(product => new Date(product.createdAt).getTime() >= recentCutoff).length;
    const currency = settings.currency || 'INR';
    const hasSamples = catalog.products.some(product => product.isSample);

    const loadSamples = () => {
        const result = addSampleCatalog(catalog);
        saveCatalog(result.catalog);
        notify(result.addedProducts ? `${result.addedProducts} example products added.` : result.updatedProducts ? 'Example product images updated.' : 'Example catalog is already loaded.', result.addedProducts || result.updatedProducts ? 'success' : 'info');
    };

    const removeProduct = product => {
        saveCatalog({ ...catalog, products: catalog.products.filter(item => item.id !== product.id) });
    };

    return (
        <main className="page-content dashboard-page">
            <section className="page-title-row dashboard-welcome">
                <div><p className="page-eyebrow">YOUR STORE AT A GLANCE</p><h1>Welcome back, {user.fullName.split(' ')[0]}.</h1><p className="page-subtitle">Here’s what’s in your product catalog today.</p></div>
                <div className="dashboard-header-actions">
                    {!hasSamples && <button className="button button-secondary" type="button" onClick={loadSamples}><Sparkles size={16} /> Load sample catalog</button>}
                    <Link className="button button-primary" to="/products?create=1"><Plus size={17} /> Add product</Link>
                </div>
            </section>
            <section className="summary-grid" aria-label="Catalog summary">
                <article className="summary-card"><span className="summary-icon summary-icon-indigo"><Package size={19} /></span><div><span>Total products</span><strong>{catalog.products.length}</strong><small>In your catalog</small></div></article>
                <article className="summary-card"><span className="summary-icon summary-icon-blue"><Tags size={19} /></span><div><span>Total categories</span><strong>{catalog.categories.length}</strong><small>Organized groups</small></div></article>
                <article className="summary-card"><span className="summary-icon summary-icon-purple"><Clock3 size={19} /></span><div><span>Recently added</span><strong>{recentCount}</strong><small>Added in the last 30 days</small></div></article>
            </section>
            <section className="dashboard-recent-section">
                <div className="section-title-row"><div><p className="page-eyebrow">LATEST UPDATES</p><h2>Recent products</h2></div><Link to="/products" className="subtle-link">View all <ArrowRight size={15} /></Link></div>
                {products.length ? (
                    <div className="product-grid dashboard-product-grid">
                        {products.slice(0, 4).map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                category={catalog.categories.find(item => item.id === product.categoryId)?.name}
                                currency={currency}
                                showDelete={false}
                                onEdit={() => navigate(`/products?edit=${encodeURIComponent(product.id)}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-panel"><span className="empty-symbol"><Package size={23} /></span><h3>Your catalog starts here</h3><p>Add the products your business offers. You can update categories, images and prices anytime.</p><Link className="button button-primary" to="/products?create=1"><Plus size={16} /> Add your first product</Link></div>
                )}
            </section>
        </main>
    );
};

export default Dashboard;
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ListFilter, Plus, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import { useCatalog } from '../contexts/CatalogContext';
import { useToast } from '../contexts/ToastContext';
import { createProduct } from '../services/catalogService';
import { deleteProductImage, saveProductImage } from '../services/imageService';
import { addSampleCatalog } from '../services/sampleCatalog';

const Products = () => {
    const { catalog, settings, saveCatalog } = useCatalog();
    const { notify } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sort, setSort] = useState('recent');
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const searchValue = searchParams.get('search') || '';
        setSearch(searchValue);
        const createParam = searchParams.get('create');
        const editId = searchParams.get('edit');
        if (createParam === '1') setEditing({});
        else if (editId) {
            const product = catalog.products.find(item => item.id === editId);
            if (product?.isSample) {
                notify('Example products are read-only. Add your own copy to make changes.', 'info');
                const next = new URLSearchParams(searchParams);
                next.delete('edit');
                setSearchParams(next, { replace: true });
                setEditing(null);
            } else setEditing(product || null);
        }
    }, [searchParams, catalog.products, notify, setSearchParams]);

    const filteredProducts = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return catalog.products
            .filter(product => product.name.toLowerCase().includes(needle))
            .filter(product => categoryFilter === 'all' || product.categoryId === categoryFilter)
            .sort((first, second) => {
                if (sort === 'name') return first.name.localeCompare(second.name);
                if (sort === 'price-low') return first.price - second.price;
                if (sort === 'price-high') return second.price - first.price;
                return new Date(second.updatedAt) - new Date(first.updatedAt);
            });
    }, [catalog.products, search, categoryFilter, sort]);

    const closeEditor = () => {
        setEditing(null);
        if (searchParams.has('create') || searchParams.has('edit')) {
            const next = new URLSearchParams(searchParams);
            next.delete('create');
            next.delete('edit');
            setSearchParams(next, { replace: true });
        }
    };

    const saveProduct = async values => {
        if (editing?.isSample) throw new Error('Example products are read-only.');
        let image = values.image || null;
        if (values.file) image = await saveProductImage(values.file);
        const { file, ...productValues } = values;
        const product = createProduct(productValues, editing?.id ? {
            id: editing.id,
            createdAt: editing.createdAt,
            updatedAt: new Date().toISOString()
        } : {});
        product.image = image;
        saveCatalog({ ...catalog, products: editing?.id
            ? catalog.products.map(item => item.id === editing.id ? product : item)
            : [product, ...catalog.products] });
        if (values.file && editing?.image && editing.image !== image) await deleteProductImage(editing.image).catch(() => {});
        closeEditor();
        notify(editing?.id ? 'Product details updated.' : 'Product added to your catalog.');
    };

    const confirmDelete = async () => {
        if (deleting?.isSample) {
            notify('Example products cannot be deleted.', 'info');
            setDeleting(null);
            return;
        }
        const remaining = catalog.products.filter(item => item.id !== deleting.id);
        saveCatalog({ ...catalog, products: remaining });
        if (deleting.image) await deleteProductImage(deleting.image).catch(() => {});
        notify('Product removed from your catalog.', 'info');
        setDeleting(null);
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setSort('recent');
        setSearchParams({}, { replace: true });
    };

    const loadSamples = () => {
        const result = addSampleCatalog(catalog);
        saveCatalog(result.catalog);
        notify(result.addedProducts ? `${result.addedProducts} example products added.` : result.updatedProducts ? 'Example product images updated.' : 'Example catalog is already loaded.', result.addedProducts || result.updatedProducts ? 'success' : 'info');
    };

    return (
        <main className="page-content products-page">
            <section className="page-title-row">
                <div><p className="page-eyebrow">CATALOG WORKSPACE</p><h1>Products</h1><p className="page-subtitle">Manage product details, categories and prices.</p></div>
                <div className="products-heading-actions">
                    {!catalog.products.some(product => product.isSample) && <button className="button button-secondary" type="button" onClick={loadSamples}><Sparkles size={16} /> Load sample catalog</button>}
                    <button className="button button-primary" type="button" onClick={() => setEditing({})}><Plus size={17} /> Add product</button>
                </div>
            </section>
            <section className="catalog-toolbar" aria-label="Product search and filters">
                <label className="catalog-search"><Search size={17} /><span className="visually-hidden">Search by product name</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search product names" /></label>
                <button className={`button button-secondary filter-toggle${showFilters ? ' is-active' : ''}`} type="button" onClick={() => setShowFilters(value => !value)}><SlidersHorizontal size={16} /> Filters</button>
                <label className="sort-control"><ArrowDownUp size={15} /><span className="visually-hidden">Sort products</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recently updated</option><option value="name">Name A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
            </section>
            {showFilters && <section className="filter-row"><label>Category<select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option value="all">All categories</option>{catalog.categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><button className="text-button" type="button" onClick={clearFilters}><X size={14} /> Clear filters</button></section>}
            <div className="results-caption"><span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span><span>{settings.currency || 'INR'} · Saved in this browser</span></div>
            {filteredProducts.length ? <div className="product-grid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} category={catalog.categories.find(item => item.id === product.categoryId)?.name} currency={settings.currency} onEdit={productToEdit => productToEdit.isSample ? notify('Example products are read-only.', 'info') : setEditing(productToEdit)} onDelete={setDeleting} />)}</div> : (
                <div className="empty-panel"><span className="empty-symbol"><ListFilter size={23} /></span><h3>{catalog.products.length ? 'No products match these filters' : 'Your catalog is empty'}</h3><p>{catalog.products.length ? 'Try another product name or category, or clear the filters.' : 'Add a product to begin building your catalog.'}</p><div className="empty-actions">{catalog.products.length ? <button className="button button-secondary" type="button" onClick={clearFilters}>Clear filters</button> : <><Link className="button button-primary" to="/categories">Create a category</Link><button className="button button-secondary" type="button" onClick={() => setEditing({})}>Add product</button><button className="button button-secondary" type="button" onClick={loadSamples}><Sparkles size={15} /> Load sample catalog</button></>}</div></div>
            )}
            {editing && <ProductForm product={editing.id ? editing : null} categories={catalog.categories} onSave={saveProduct} onClose={closeEditor} />}
            <ConfirmDialog open={Boolean(deleting)} title="Delete this product?" message={`“${deleting?.name || ''}” will be removed from your catalog. This cannot be undone.`} confirmLabel="Delete product" destructive onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
        </main>
    );
};

export default Products;
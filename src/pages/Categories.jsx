import React, { useState } from 'react';
import { Boxes, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useCatalog } from '../contexts/CatalogContext';
import { useToast } from '../contexts/ToastContext';
import { createCategory } from '../services/catalogService';

const starterCategories = ['Groceries', 'Clothing', 'Accessories', 'Stationery', 'Home & Handmade'];

const Categories = () => {
    const { catalog, saveCatalog } = useCatalog();
    const { notify } = useToast();
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [reassignTo, setReassignTo] = useState('uncategorized');

    const countProducts = categoryId => catalog.products.filter(product => product.categoryId === categoryId).length;
    const isProtectedCategory = category => category.isSample || catalog.products.some(product => product.categoryId === category.id && product.isSample);

    const submit = event => {
        event.preventDefault();
        const normalizedName = name.trim();
        if (!normalizedName) return setError('Enter a category name.');
        if (catalog.categories.some(category => category.id !== editingId && category.name.toLowerCase() === normalizedName.toLowerCase())) {
            return setError('A category with this name already exists.');
        }
        const categories = editingId
            ? catalog.categories.map(category => category.id === editingId ? { ...category, name: normalizedName } : category)
            : [...catalog.categories, createCategory(normalizedName)];
        saveCatalog({ ...catalog, categories });
        notify(editingId ? 'Category renamed.' : 'Category added.');
        setName('');
        setEditingId(null);
        setError('');
    };

    const beginEdit = category => {
        if (isProtectedCategory(category)) {
            notify('Example categories are read-only.', 'info');
            return;
        }
        setEditingId(category.id);
        setName(category.name);
        setError('');
        document.getElementById('categoryName')?.focus();
    };

    const useStarterCategories = () => {
        const existing = new Set(catalog.categories.map(category => category.name.toLowerCase()));
        const additions = starterCategories.filter(item => !existing.has(item.toLowerCase())).map(item => createCategory(item));
        saveCatalog({ ...catalog, categories: [...catalog.categories, ...additions] });
        notify(`${additions.length} starter categories added.`);
    };

    const confirmDelete = () => {
        if (!deleting) return;
        const count = countProducts(deleting.id);
        let categories = catalog.categories.filter(category => category.id !== deleting.id);
        let products = catalog.products;
        if (count) {
            let targetId = reassignTo;
            if (targetId === 'uncategorized') {
                let uncategorized = categories.find(category => category.name.toLowerCase() === 'uncategorized');
                if (!uncategorized) {
                    uncategorized = createCategory('Uncategorized');
                    categories = [...categories, uncategorized];
                }
                targetId = uncategorized.id;
            }
            products = products.map(product => product.categoryId === deleting.id ? { ...product, categoryId: targetId, updatedAt: new Date().toISOString() } : product);
        }
        saveCatalog({ categories, products });
        notify(count ? `Category deleted; ${count} product${count === 1 ? '' : 's'} reassigned.` : 'Category deleted.', 'info');
        setDeleting(null);
    };

    const beginDelete = category => {
        if (isProtectedCategory(category)) {
            notify('Example categories are read-only.', 'info');
            return;
        }
        setDeleting(category);
        const nextCategory = catalog.categories.find(item => item.id !== category.id);
        setReassignTo(nextCategory?.id || 'uncategorized');
    };

    return (
        <main className="page-content categories-page">
            <section className="page-title-row"><div><p className="page-eyebrow">KEEP THINGS ORGANIZED</p><h1>Categories</h1><p className="page-subtitle">Group products in a way that makes sense for your shop.</p></div>{!catalog.categories.length && <button className="button button-secondary" type="button" onClick={useStarterCategories}><Boxes size={16} /> Add starter categories</button>}</section>
            <div className="category-workspace">
                <section className="category-list-panel">
                    <div className="panel-heading"><div><h2>Your categories</h2><p>{catalog.categories.length} {catalog.categories.length === 1 ? 'category' : 'categories'}</p></div></div>
                    {catalog.categories.length ? <div className="category-list">{catalog.categories.map(category => (
                        <article className="category-row" key={category.id}>
                            <span className="category-row-icon"><Boxes size={18} /></span>
                            <div className="category-row-name"><strong>{category.name}{isProtectedCategory(category) && <span className="sample-category-tag">EXAMPLE</span>}</strong><small>{countProducts(category.id)} {countProducts(category.id) === 1 ? 'product' : 'products'}</small></div>
                            {!isProtectedCategory(category) && <><button className="icon-button" type="button" aria-label={`Rename ${category.name}`} onClick={() => beginEdit(category)}><Pencil size={16} /></button><button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${category.name}`} onClick={() => beginDelete(category)}><Trash2 size={16} /></button></>}
                        </article>
                    ))}</div> : <div className="category-empty"><p>No categories yet. Add your own or start with a few common ones.</p><button className="text-button" type="button" onClick={useStarterCategories}>Add common categories <Plus size={14} /></button></div>}
                </section>
                <section className="category-form-panel"><div className="panel-heading"><div><h2>{editingId ? 'Rename category' : 'Add a category'}</h2><p>Use a short name your team will recognize.</p></div>{editingId && <button className="icon-button" type="button" aria-label="Cancel rename" onClick={() => { setEditingId(null); setName(''); }}><X size={17} /></button>}</div><form className="category-form" onSubmit={submit}><label className="form-field" htmlFor="categoryName"><span>Category name</span><input id="categoryName" value={name} onChange={event => { setName(event.target.value); setError(''); }} maxLength={45} placeholder="e.g. Seasonal produce" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit">{editingId ? <Check size={16} /> : <Plus size={16} />}{editingId ? 'Save name' : 'Add category'}</button></form><p className="category-tip">Categories are private to your account. You can rename them anytime.</p></section>
            </div>
            {deleting && countProducts(deleting.id) > 0 ? (
                <div className="dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setDeleting(null)}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="category-delete-title"><button className="dialog-close" type="button" aria-label="Close dialog" onClick={() => setDeleting(null)}><X size={18} /></button><span className="dialog-icon dialog-icon-danger"><Trash2 size={19} /></span><h2 id="category-delete-title">Move products before deleting?</h2><p>{countProducts(deleting.id)} products are in “{deleting.name}”. Choose where they should go.</p><label className="form-field reassign-field"><span>Move products to</span><select value={reassignTo} onChange={event => setReassignTo(event.target.value)}><option value="uncategorized">Uncategorized</option>{catalog.categories.filter(item => item.id !== deleting.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="dialog-actions"><button className="button button-secondary" type="button" onClick={() => setDeleting(null)}>Cancel</button><button className="button button-danger" type="button" onClick={confirmDelete}>Reassign & delete</button></div></section></div>
            ) : <ConfirmDialog open={Boolean(deleting)} title="Delete this category?" message={`“${deleting?.name || ''}” will be removed from your category list.`} confirmLabel="Delete category" destructive onClose={() => setDeleting(null)} onConfirm={confirmDelete} />}
        </main>
    );
};

export default Categories;
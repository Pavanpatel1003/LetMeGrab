import React, { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { getProductImage, validateImageFile } from '../services/imageService';

const ProductForm = ({ product, categories, onSave, onClose }) => {
    const [form, setForm] = useState({ name: '', categoryId: '', price: '', description: '', image: null, ...product });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let objectUrl = '';
        let active = true;
        if (file) {
            objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        } else if (form.image) {
            getProductImage(form.image).then(blob => {
                if (blob && active) {
                    objectUrl = URL.createObjectURL(blob);
                    setPreview(objectUrl);
                }
            }).catch(() => setPreview(''));
        }
        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [file, form.image]);

    const change = event => {
        const { name, value } = event.target;
        setForm(previous => ({ ...previous, [name]: value }));
        setError('');
    };

    const handleFile = event => {
        const nextFile = event.target.files?.[0] || null;
        const fileError = validateImageFile(nextFile);
        if (fileError) {
            setError(fileError);
            event.target.value = '';
            return;
        }
        setFile(nextFile);
        setError('');
    };

    const submit = async event => {
        event.preventDefault();
        if (!form.name.trim() || !form.categoryId) {
            setError('Add a product name and choose a category.');
            return;
        }
        if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0 || form.price === '') {
            setError('Enter a valid non-negative price.');
            return;
        }
        setSaving(true);
        try {
            await onSave({ ...form, price: Number(form.price), file });
        } catch (saveError) {
            setError(saveError.message || 'Product could not be saved.');
            setSaving(false);
        }
    };

    return (
        <div className="dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <section className="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
                <header className="dialog-header">
                    <div><span className="dialog-kicker">PRODUCT DETAILS</span><h2 id="product-dialog-title">{product ? 'Edit product' : 'Add product'}</h2></div>
                    <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
                </header>
                <form onSubmit={submit}>
                    <div className="dialog-body">
                        <label className="form-field"><span>Product name <b>*</b></span><input autoFocus name="name" value={form.name} onChange={change} maxLength={100} placeholder="e.g. Everyday canvas tote" required /></label>
                        <div className="form-grid-two">
                            <label className="form-field"><span>Category <b>*</b></span><select name="categoryId" value={form.categoryId} onChange={change} required><option value="">Choose a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                            <label className="form-field"><span>Price <b>*</b></span><div className="currency-input"><span>₹</span><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} placeholder="0.00" required /></div></label>
                        </div>
                        <div className="form-field"><span id="product-image-label">Product image <small>Optional · JPG, PNG or WebP · max 3 MB</small></span><label className="image-upload-zone" htmlFor="productImage"><input id="productImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} /><ImagePlus size={18} /><span>{file ? file.name : 'Choose an image'}</span></label></div>
                        {preview && <div className="image-preview"><img src={preview} alt="Product preview" /></div>}
                        <label className="form-field"><span>Description <small>Optional</small></span><textarea name="description" value={form.description || ''} onChange={change} rows={3} maxLength={400} placeholder="Add a few helpful details" /></label>
                        {error && <p className="form-error" role="alert">{error}</p>}
                    </div>
                    <footer className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button></footer>
                </form>
            </section>
        </div>
    );
};

export default ProductForm;
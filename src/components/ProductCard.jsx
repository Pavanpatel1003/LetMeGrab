import React, { useEffect, useState } from 'react';
import { Image, LockKeyhole, Pencil, Trash2 } from 'lucide-react';
import { getProductImage } from '../services/imageService';

const ProductCard = ({ product, category, currency = 'INR', onEdit, onDelete, showDelete = true }) => {
    const [imageUrl, setImageUrl] = useState('');
    const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 });
    const updatedAt = new Date(product.updatedAt || product.createdAt || Date.now());

    useEffect(() => {
        let objectUrl = '';
        let active = true;
        if (product.image) {
            if (product.isSample) setImageUrl(product.image);
            else getProductImage(product.image).then(blob => {
                    if (blob && active) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    }
                }).catch(() => setImageUrl(''));
        }
        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [product.image]);

    return (
        <article className="product-card">
            <div className="product-card-image">
                {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span><Image size={23} /></span>}
                <span className="product-card-category">{category || 'Uncategorized'}</span>
                {product.isSample ? <span className="sample-lock-badge"><LockKeyhole size={12} /> Example</span> : <div className="product-card-actions">
                    <button type="button" aria-label={`Edit ${product.name}`} onClick={() => onEdit(product)}><Pencil size={15} /></button>
                    {showDelete && <button type="button" aria-label={`Delete ${product.name}`} onClick={() => onDelete(product)}><Trash2 size={15} /></button>}
                </div>}
            </div>
            <div className="product-card-details">
                <div><h3>{product.name}</h3><strong>{currencyFormatter.format(Number(product.price) || 0)}</strong></div>
                {product.description && <p>{product.description}</p>}
                <small>Updated {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(updatedAt)}</small>
            </div>
        </article>
    );
};

export default ProductCard;
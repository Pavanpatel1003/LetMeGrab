import { createCategory, createProduct } from './catalogService';
import boutiqueImage from '../img/boutique-shop.jpg';
import handmadeImage from '../img/handmade-studio.jpg';
import groceryImage from '../img/market-produce.jpg';
import retailImage from '../img/retail-watch.jpg';
import stationeryImage from '../img/stationery-desk.jpg';

const sampleItems = [
    { key: 'grocery-apples', category: 'Grocery Stores', name: 'Fresh Apples', price: 120, description: 'Crisp seasonal apples, sold per kilogram.', image: groceryImage },
    { key: 'boutique-kurta', category: 'Boutiques & Clothing', name: 'Cotton Everyday Kurta', price: 1299, description: 'Soft cotton kurta for everyday wear.', image: boutiqueImage },
    { key: 'stationery-notebook', category: 'Stationery Shops', name: 'A5 Dotted Notebook', price: 95, description: 'Compact dotted notebook for notes and sketches.', image: stationeryImage },
    { key: 'retail-bottle', category: 'Retail Stores', name: 'Insulated Steel Bottle', price: 499, description: 'Reusable stainless-steel bottle with a secure lid.', image: retailImage },
    { key: 'home-soy-candle', category: 'Home Businesses', name: 'Hand-poured Soy Candle', price: 450, description: 'Small-batch soy candle poured by a home business.', image: handmadeImage }
];

export const addSampleCatalog = catalog => {
    let categories = [...catalog.categories];
    const products = [...catalog.products];
    const existingSamples = new Set(products.map(product => product.sampleKey).filter(Boolean));
    let addedProducts = 0;
    let addedCategories = 0;
    let updatedProducts = 0;

    for (const sample of sampleItems) {
        let category = categories.find(item => item.name.toLowerCase() === sample.category.toLowerCase());
        if (!category) {
            category = { ...createCategory(sample.category), isSample: true };
            categories = [...categories, category];
            addedCategories += 1;
        }

        const existingProduct = products.find(product => product.sampleKey === sample.key);
        if (existingProduct && (!existingProduct.isSample || !existingProduct.image)) {
            const productIndex = products.findIndex(product => product.id === existingProduct.id);
            products[productIndex] = { ...existingProduct, image: sample.image, isSample: true };
            updatedProducts += 1;
        } else if (!existingSamples.has(sample.key)) {
            products.unshift({
                ...createProduct({ name: sample.name, categoryId: category.id, price: sample.price, description: sample.description, image: sample.image }),
                isSample: true,
                sampleKey: sample.key
            });
            addedProducts += 1;
        }
    }

    return { catalog: { categories, products }, addedCategories, addedProducts, updatedProducts };
};
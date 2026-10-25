import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Boxes, Search, ShoppingBag, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import boutique from '../img/boutique-shop.jpg';
import handmade from '../img/handmade-studio.jpg';
import groceries from '../img/market-produce.jpg';
import stationery from '../img/stationery-desk.jpg';

const slides = [
    {
        image: groceries,
        alt: 'Fresh produce displayed in a neighborhood grocery store',
        title: 'All Your Products in One Place',
        description: 'Bring product names, categories, prices and descriptions together in one clear catalog.',
        label: 'A CALMER WAY TO RUN YOUR CATALOG',
        icon: Boxes
    },
    {
        image: boutique,
        alt: 'Boutique shopper exploring a clothing collection',
        title: 'Add, Edit & Manage Products Easily',
        description: 'Keep your shop details up to date with a straightforward product workflow.',
        label: 'MADE FOR THE EVERYDAY DETAILS',
        icon: Tags
    },
    {
        image: stationery,
        alt: 'Stationery and writing supplies on a work desk',
        title: 'Find Products Faster with Search & Categories',
        description: 'Use quick search and category filters to find the item you need without digging.',
        label: 'LESS LOOKING. MORE DOING.',
        icon: Search
    },
    {
        image: handmade,
        alt: 'Handmade craft materials arranged on a home studio table',
        title: 'Made for Small Businesses',
        description: 'From a corner shop to a home-based business, keep your catalog simple and yours.',
        label: 'YOUR STORE, YOUR WAY',
        icon: ShoppingBag
    }
];

const HeroSlider = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
        const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 7000);
        return () => window.clearInterval(timer);
    }, []);

    const move = amount => setActive(current => (current + amount + slides.length) % slides.length);
    const slide = slides[active];
    const ActiveIcon = slide.icon;

    return (
        <section className="hero-section" aria-label="LetMeGrab overview">
            <div className="hero-copy">
                <div className="eyebrow-line"><span /> CATALOG MANAGEMENT, MADE SIMPLE</div>
                <h1>Manage Your Products, <em>Simply.</em></h1>
                <p>Organize your products, categories, and prices in one simple place.</p>
                <div className="hero-cta-row">
                    <Link to="/register" className="button button-primary">Get started <ArrowUpRight size={17} /></Link>
                    <Link to="/login" className="button button-outline">Login</Link>
                </div>
                <div className="hero-proof"><span className="proof-check">✓</span> Simple product catalog <span className="proof-divider" /> No checkout or stock tracking</div>
            </div>
            <div className="hero-slider" aria-roledescription="carousel" aria-label="Product catalog features">
                {slides.map((item, index) => (
                    <img className={`hero-slide-image${index === active ? ' is-active' : ''}`} src={item.image} alt={item.alt} key={item.title} aria-hidden={index !== active} />
                ))}
                <div className="hero-image-wash" />
                <div className="hero-slide-copy" aria-live="polite">
                    <span className="hero-slide-icon"><ActiveIcon size={17} /></span>
                    <p className="hero-slide-label">{slide.label}</p>
                    <h2>{slide.title}</h2>
                    <p className="hero-slide-description">{slide.description}</p>
                    <Link to="/register" className="hero-slide-cta">Explore the workspace <ArrowUpRight size={15} /></Link>
                </div>
                <div className="hero-slide-controls">
                    <div className="hero-slide-dots" aria-label="Choose a slide">
                        {slides.map((item, index) => (
                            <button key={item.title} type="button" className={index === active ? 'is-active' : ''} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-pressed={index === active} onClick={() => setActive(index)} />
                        ))}
                    </div>
                    <span className="hero-slide-count">0{active + 1}<span>/</span>0{slides.length}</span>
                    <button type="button" className="hero-arrow" aria-label="Previous slide" onClick={() => move(-1)}><ArrowLeft size={17} /></button>
                    <button type="button" className="hero-arrow" aria-label="Next slide" onClick={() => move(1)}><ArrowRight size={17} /></button>
                </div>
            </div>
        </section>
    );
};

export default HeroSlider;
import React from 'react';
import { ArrowRight, Boxes, LayoutDashboard, Package, Search, Smartphone, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';

const features = [
    { icon: Package, title: 'Product management', text: 'Add, edit and remove catalog items with the details that matter.' },
    { icon: Tags, title: 'Category organization', text: 'Group products in categories you can rename and customize.' },
    { icon: Search, title: 'Quick search', text: 'Find a product by name and narrow the catalog by category.' },
    { icon: Boxes, title: 'Clear price details', text: 'Keep product prices together and easy to scan.' },
    { icon: LayoutDashboard, title: 'Simple dashboard', text: 'See your catalog at a glance, including recent additions.' },
    { icon: Smartphone, title: 'Works on your screen', text: 'Manage your catalog from desktop, tablet or mobile.' }
];

const businesses = [
    { name: 'Grocery stores', note: 'Everyday goods and fresh market products', mark: '01' },
    { name: 'Boutiques', note: 'Clothing, accessories and collections', mark: '02' },
    { name: 'Stationery shops', note: 'Books, paper goods and supplies', mark: '03' },
    { name: 'Retail businesses', note: 'Independent shops and local stores', mark: '04' },
    { name: 'Home businesses', note: 'Handmade goods and small-batch products', mark: '05' }
];

const Home = () => (
    <main className="marketing-page">
        <HeroSlider />
        <section className="features-section page-section" id="features">
            <div className="section-heading">
                <div><p className="section-kicker">A SMALL TOOL FOR THE DAILY WORK</p><h2>Everything your catalog needs.<br /><span>Nothing it doesn’t.</span></h2></div>
                <p>Keep product information close at hand, without bringing orders, payments or stock tracking into the mix.</p>
            </div>
            <div className="feature-grid">
                {features.map(({ icon: Icon, title, text }, index) => (
                    <article className="feature-item" key={title}>
                        <span className="feature-icon"><Icon size={19} strokeWidth={1.8} /></span>
                        <span className="feature-index">0{index + 1}</span>
                        <h3>{title}</h3><p>{text}</p>
                    </article>
                ))}
            </div>
        </section>
        <section className="audience-section page-section" id="about">
            <div className="audience-intro"><p className="section-kicker">BUILT FOR INDEPENDENT BUSINESS</p><h2>A better fit for<br />the way you work.</h2><p>Whether you sell from a storefront or from home, LetMeGrab helps keep your product catalog organized.</p><Link to="/register" className="text-link">Create your workspace <ArrowRight size={16} /></Link></div>
            <div className="audience-list">
                {businesses.map(business => <article className="audience-item" key={business.name}><span>{business.mark}</span><div><h3>{business.name}</h3><p>{business.note}</p></div><ArrowRight size={17} /></article>)}
            </div>
        </section>
        <footer className="public-footer">
            <Link to="/" className="public-brand"><span className="public-brand-mark"><Package size={18} /></span><span>LetMeGrab<small>PRODUCT CATALOG</small></span></Link>
            <p>A simple place to organize your products, categories and prices.</p>
            <nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#about">About</a><Link to="/login">Login</Link><Link to="/register">Create account</Link></nav>
            <small>© {new Date().getFullYear()} LetMeGrab. A local demo catalog.</small>
        </footer>
    </main>
);

export default Home;
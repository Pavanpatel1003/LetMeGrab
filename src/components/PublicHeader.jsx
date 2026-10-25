import React, { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="public-header">
            <div className="public-header-inner">
                <Link to="/" className="public-brand" aria-label="LetMeGrab home" onClick={closeMenu}>
                    <span className="public-brand-mark"><ShoppingBag size={19} /></span>
                    <span>LetMeGrab<small>PRODUCT CATALOG</small></span>
                </Link>
                <button className="public-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>
                    {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
                <nav className={`public-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
                    <NavLink to="/" onClick={closeMenu}>Home</NavLink>
                    <a href="/#features" onClick={closeMenu}>Features</a>
                    <a href="/#about" onClick={closeMenu}>About</a>
                    {user ? (
                        <>
                            <Link className="public-login-link" to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                            <button className="public-account-button" type="button" onClick={() => { logout(); closeMenu(); }}>Log out</button>
                        </>
                    ) : (
                        <>
                            <Link className="public-login-link" to="/login" onClick={closeMenu}>Login</Link>
                            <Link className="button button-primary public-create-button" to="/register" onClick={closeMenu}>Create account</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default PublicHeader;
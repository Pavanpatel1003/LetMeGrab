import React from 'react';
import { NavLink } from 'react-router-dom';
import { Boxes, LayoutDashboard, Package, Settings, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/categories', label: 'Categories', icon: Boxes },
    { to: '/settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ open, onClose, onLogout }) => {
    const { user } = useAuth();

    return (
        <>
            <button className={`sidebar-scrim${open ? ' is-visible' : ''}`} type="button" aria-label="Close menu" onClick={onClose} />
            <aside className={`app-sidebar${open ? ' is-open' : ''}`} aria-label="Main navigation">
                <div className="sidebar-brand-row">
                    <NavLink to="/dashboard" className="brand-lockup" onClick={onClose}>
                        <span className="brand-mark"><ShoppingBag size={19} /></span>
                        <span className="brand-name">LetMeGrab<small>CATALOG WORKSPACE</small></span>
                    </NavLink>
                    <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
                </div>
                <p className="sidebar-section-label">WORKSPACE</p>
                <nav className="sidebar-nav">
                    {navigation.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}>
                            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-account">
                        <span className="avatar avatar-small">{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                        <span className="sidebar-account-copy"><strong>{user?.fullName || 'Your account'}</strong><small>{user?.email}</small></span>
                    </div>
                    <button className="sidebar-logout" type="button" onClick={onLogout}><span>Log out</span></button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
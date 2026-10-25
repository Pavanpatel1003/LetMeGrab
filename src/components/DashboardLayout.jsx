import React, { useState } from 'react';
import { Menu, Search, Plus } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const pageNames = {
    '/dashboard': 'Dashboard',
    '/products': 'Products',
    '/categories': 'Categories',
    '/settings': 'Settings'
};

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = pageNames[location.pathname] || 'Workspace';

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="workspace-layout">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
            <div className="workspace-main">
                <header className="workspace-header">
                    <button className="mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
                    <div className="workspace-page-title"><span>Workspace</span><strong>{currentPage}</strong></div>
                    <div className="workspace-header-actions">
                        <label className="header-search">
                            <Search size={16} />
                            <span className="visually-hidden">Search products</span>
                            <input aria-label="Search products" placeholder="Search catalog" onFocus={() => location.pathname !== '/products' && navigate('/products')} onChange={event => { if (event.target.value) navigate(`/products?search=${encodeURIComponent(event.target.value)}`); }} />
                            <kbd>/</kbd>
                        </label>
                        <Link className="button button-primary header-add-button" to="/products?create=1"><Plus size={17} /><span>Add product</span></Link>
                        <div className="header-profile" title={user?.email}>
                            <span className="avatar avatar-small">{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                            <span>{user?.fullName?.split(' ')[0]}</span>
                        </div>
                    </div>
                </header>
                <div className="workspace-content"><Outlet /></div>
            </div>
        </div>
    );
};

export default DashboardLayout;
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CatalogProvider } from '../contexts/CatalogContext';

const ProtectedLayout = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return (
        <CatalogProvider>
            <Outlet />
        </CatalogProvider>
    );
};

export default ProtectedLayout;
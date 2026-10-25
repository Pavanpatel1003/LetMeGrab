import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ProtectedLayout from './components/ProtectedLayout';
import PublicLayout from './components/PublicLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthPage from './pages/AuthPage';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Products from './pages/Products';
import Settings from './pages/Settings';
import './App.css';

const AppRoutes = () => {
    const { ready } = useAuth();
    if (!ready) return <main className="boot-screen"><span className="boot-mark">LM</span><span>Opening your workspace…</span></main>;

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<AuthPage mode="login" />} />
                    <Route path="register" element={<AuthPage mode="register" />} />
                </Route>
                <Route element={<ProtectedLayout />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

const App = () => (
    <AuthProvider>
        <ToastProvider>
            <AppRoutes />
        </ToastProvider>
    </AuthProvider>
);

export default App;
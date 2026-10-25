import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearSession, readSessionId, readUsers } from '../services/storageService';
import { getCurrentUser, loginUser, migrateLegacyData, registerUser, updateUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        migrateLegacyData()
            .then(() => {
                if (active) setUser(getCurrentUser());
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setReady(true);
            });
        return () => { active = false; };
    }, []);

    const login = async credentials => {
        const nextUser = await loginUser(credentials);
        setUser(nextUser);
        return nextUser;
    };

    const register = async details => {
        const nextUser = await registerUser(details);
        setUser(nextUser);
        return nextUser;
    };

    const updateProfile = updates => {
        const nextUser = updateUser(user.id, updates);
        setUser(nextUser);
        return nextUser;
    };

    const logout = () => {
        clearSession();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, ready, login, register, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider.');
    return context;
};
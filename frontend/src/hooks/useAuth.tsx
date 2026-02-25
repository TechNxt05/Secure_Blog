'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getToken, getStoredUser, setToken, setStoredUser, removeToken, clearStoredUser } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => void;
}

const defaultAuth: AuthContextType = {
    user: null,
    loading: true,
    isAuthenticated: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        const stored = getStoredUser();
        if (token && stored) {
            setUser(stored);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        setToken(res.access_token);
        setStoredUser(res.user);
        setUser(res.user);
    }, []);

    const register = useCallback(async (email: string, name: string, password: string) => {
        const res = await authApi.register({ email, name, password });
        setToken(res.access_token);
        setStoredUser(res.user);
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        removeToken();
        clearStoredUser();
        setUser(null);
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, getStoredUser, setToken, setStoredUser, removeToken, clearStoredUser } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
}

export function useAuth() {
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
        return res;
    }, []);

    const register = useCallback(async (email: string, name: string, password: string) => {
        const res = await authApi.register({ email, name, password });
        setToken(res.access_token);
        setStoredUser(res.user);
        setUser(res.user);
        return res;
    }, []);

    const logout = useCallback(() => {
        removeToken();
        clearStoredUser();
        setUser(null);
    }, []);

    return { user, loading, login, register, logout, isAuthenticated: !!user };
}

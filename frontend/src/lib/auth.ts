import Cookies from 'js-cookie';

const TOKEN_KEY = 'blog_token';
const USER_KEY = 'blog_user';

export function getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
}

export function removeToken(): void {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
}

export function getStoredUser(): { id: string; email: string; name: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setStoredUser(user: { id: string; email: string; name: string }): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

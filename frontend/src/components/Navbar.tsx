'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { PenLine, LogOut, Home, LayoutDashboard, Rss } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-brand">
                    <PenLine size={24} />
                    <span>SecureBlog</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        href="/feed"
                        className={`nav-link ${pathname === '/feed' ? 'active' : ''}`}
                    >
                        <Rss size={16} />
                        Feed
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={`nav-link ${pathname?.startsWith('/dashboard') ? 'active' : ''}`}
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                            <span className="nav-user">{user?.name}</span>
                            <button onClick={logout} className="nav-logout">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={`nav-link ${pathname === '/login' ? 'active' : ''}`}
                            >
                                Login
                            </Link>
                            <Link href="/register" className="nav-cta">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

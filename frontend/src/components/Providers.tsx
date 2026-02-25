'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Navbar />
            <main className="main-content">{children}</main>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1e1e2e',
                        color: '#cdd6f4',
                        border: '1px solid rgba(137, 180, 250, 0.2)',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                }}
            />
        </AuthProvider>
    );
}

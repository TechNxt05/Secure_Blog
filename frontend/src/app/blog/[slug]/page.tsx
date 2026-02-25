'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import { Calendar, User, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BlogDetail {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary: string | null;
    createdAt: string;
    user: { id: string; name: string };
    _count: { likes: number; comments: number };
}

export default function BlogDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [blog, setBlog] = useState<BlogDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const loadBlog = async () => {
            try {
                const data = await publicApi.getBlogBySlug(slug);
                setBlog(data);
            } catch {
                setError('Blog not found');
            } finally {
                setLoading(false);
            }
        };
        if (slug) loadBlog();
    }, [slug]);

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spin" size={40} />
                <p>Loading blog...</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="error-container">
                <h2>404</h2>
                <p>{error || 'Blog not found'}</p>
                <Link href="/feed" className="btn btn-primary">
                    <ArrowLeft size={16} /> Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <article className="blog-detail">
            <Link href="/feed" className="back-link">
                <ArrowLeft size={16} /> Back to Feed
            </Link>

            <header className="blog-detail-header">
                <h1 className="blog-detail-title">{blog.title}</h1>
                <div className="blog-detail-meta">
                    <span className="meta-item">
                        <User size={16} />
                        {blog.user.name}
                    </span>
                    <span className="meta-item">
                        <Calendar size={16} />
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </header>

            <div className="blog-detail-content">
                {blog.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))}
            </div>

            <div className="blog-detail-actions">
                <LikeButton
                    blogId={blog.id}
                    initialLikeCount={blog._count.likes}
                    isAuthenticated={isAuthenticated}
                />
            </div>

            <CommentSection blogId={blog.id} isAuthenticated={isAuthenticated} />
        </article>
    );
}

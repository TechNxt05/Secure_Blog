'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
    Plus,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardBlog {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
    _count: { likes: number; comments: number };
}

export default function DashboardPage() {
    const [blogs, setBlogs] = useState<DashboardBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }
        if (isAuthenticated) {
            loadBlogs();
        }
    }, [isAuthenticated, authLoading, router]);

    const loadBlogs = async () => {
        try {
            const data = await blogsApi.getMyBlogs();
            setBlogs(data);
        } catch {
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;
        setDeleting(id);
        try {
            await blogsApi.delete(id);
            setBlogs((prev) => prev.filter((b) => b.id !== id));
            toast.success('Blog deleted');
        } catch {
            toast.error('Failed to delete blog');
        } finally {
            setDeleting(null);
        }
    };

    const handleTogglePublish = async (id: string, isPublished: boolean) => {
        try {
            await blogsApi.update(id, { isPublished: !isPublished });
            setBlogs((prev) =>
                prev.map((b) =>
                    b.id === id ? { ...b, isPublished: !isPublished } : b,
                ),
            );
            toast.success(isPublished ? 'Blog unpublished' : 'Blog published!');
        } catch {
            toast.error('Failed to update blog');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spin" size={40} />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">
                        <LayoutDashboard size={28} />
                        Dashboard
                    </h1>
                    <p className="page-subtitle">Manage your blog posts</p>
                </div>
                <Link href="/dashboard/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Post
                </Link>
            </div>

            {blogs.length === 0 ? (
                <div className="empty-container">
                    <Edit3 size={48} />
                    <h2>No posts yet</h2>
                    <p>Create your first blog post!</p>
                    <Link href="/dashboard/new" className="btn btn-primary">
                        <Plus size={18} /> Create Post
                    </Link>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h3 className="dashboard-card-title">{blog.title}</h3>
                                <span
                                    className={`status-badge ${blog.isPublished ? 'published' : 'draft'}`}
                                >
                                    {blog.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="dashboard-card-stats">
                                <span>❤️ {blog._count.likes}</span>
                                <span>💬 {blog._count.comments}</span>
                                <span>
                                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="dashboard-card-actions">
                                <button
                                    onClick={() => handleTogglePublish(blog.id, blog.isPublished)}
                                    className="btn-icon"
                                    title={blog.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                    {blog.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <Link
                                    href={`/dashboard/edit/${blog.id}`}
                                    className="btn-icon"
                                    title="Edit"
                                >
                                    <Edit3 size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="btn-icon btn-danger"
                                    disabled={deleting === blog.id}
                                    title="Delete"
                                >
                                    {deleting === blog.id ? (
                                        <Loader2 className="spin" size={16} />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

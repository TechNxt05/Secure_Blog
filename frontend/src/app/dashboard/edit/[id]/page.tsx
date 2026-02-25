'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { blogsApi } from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface BlogData {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    isPublished: boolean;
}

export default function EditBlogPage() {
    const params = useParams();
    const id = params.id as string;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadBlog = async () => {
            try {
                const blog = (await blogsApi.getById(id)) as BlogData;
                setTitle(blog.title);
                setContent(blog.content);
                setSummary(blog.summary ?? '');
                setIsPublished(blog.isPublished);
            } catch {
                toast.error('Blog not found');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        if (id) loadBlog();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        try {
            await blogsApi.update(id, {
                title,
                content,
                summary: summary || undefined,
                isPublished,
            });
            toast.success('Blog updated!');
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spin" size={40} />
                <p>Loading blog...</p>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <Link href="/dashboard" className="back-link">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <h1 className="page-title">Edit Post</h1>

            <form onSubmit={handleSubmit} className="editor-form">
                <div className="form-group">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        id="title"
                        type="text"
                        className="input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        minLength={3}
                        disabled={saving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="summary" className="form-label">Summary</label>
                    <input
                        id="summary"
                        type="text"
                        className="input"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        maxLength={500}
                        disabled={saving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content" className="form-label">Content</label>
                    <textarea
                        id="content"
                        className="input textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        minLength={10}
                        rows={15}
                        disabled={saving}
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            disabled={saving}
                        />
                        <span>Published</span>
                    </label>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                    {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}

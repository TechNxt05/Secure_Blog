'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogsApi } from '@/lib/api';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewBlogPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            await blogsApi.create({
                title,
                content,
                summary: summary || undefined,
                isPublished,
            });
            toast.success(isPublished ? 'Blog published!' : 'Draft saved!');
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create blog';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editor-page">
            <Link href="/dashboard" className="back-link">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <h1 className="page-title">Create New Post</h1>

            <form onSubmit={handleSubmit} className="editor-form">
                <div className="form-group">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        id="title"
                        type="text"
                        className="input"
                        placeholder="Enter a compelling title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        minLength={3}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="summary" className="form-label">Summary (optional)</label>
                    <input
                        id="summary"
                        type="text"
                        className="input"
                        placeholder="Brief summary for the feed..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        maxLength={500}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content" className="form-label">Content</label>
                    <textarea
                        id="content"
                        className="input textarea"
                        placeholder="Write your blog content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        minLength={10}
                        rows={15}
                        disabled={loading}
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            disabled={loading}
                        />
                        <span>Publish immediately</span>
                    </label>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                    {loading ? 'Saving...' : isPublished ? 'Publish Post' : 'Save Draft'}
                </button>
            </form>
        </div>
    );
}

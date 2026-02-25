'use client';

import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import { Loader2, Rss, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedBlog {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    createdAt: string;
    user: { id: string; name: string };
    _count: { likes: number; comments: number };
}

export default function FeedPage() {
    const [blogs, setBlogs] = useState<FeedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const loadFeed = async () => {
            setLoading(true);
            try {
                const res = await publicApi.getFeed(page, 9);
                setBlogs(res.data);
                setTotalPages(res.meta.totalPages);
            } catch {
                console.error('Failed to load feed');
            } finally {
                setLoading(false);
            }
        };
        loadFeed();
    }, [page]);

    return (
        <div className="feed-page">
            <div className="page-header">
                <h1 className="page-title">
                    <Rss size={28} />
                    Blog Feed
                </h1>
                <p className="page-subtitle">
                    Discover the latest stories from our community
                </p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Loader2 className="spin" size={40} />
                    <p>Loading posts...</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="empty-container">
                    <Rss size={48} />
                    <h2>No posts yet</h2>
                    <p>Be the first to publish a blog post!</p>
                </div>
            ) : (
                <>
                    <div className="blog-grid">
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                title={blog.title}
                                slug={blog.slug}
                                summary={blog.summary}
                                createdAt={blog.createdAt}
                                author={blog.user.name}
                                likeCount={blog._count.likes}
                                commentCount={blog._count.comments}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-secondary"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="pagination-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-secondary"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

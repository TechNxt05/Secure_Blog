'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentsApi } from '@/lib/api';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
}

interface CommentSectionProps {
    blogId: string;
    isAuthenticated: boolean;
}

export default function CommentSection({ blogId, isAuthenticated }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const loadComments = useCallback(async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await commentsApi.getByBlog(blogId, pageNum);
            if (pageNum === 1) {
                setComments(res.data);
            } else {
                setComments((prev) => [...prev, ...res.data]);
            }
            setHasMore(res.meta.hasNext);
            setTotal(res.meta.total);
        } catch {
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [blogId]);

    useEffect(() => {
        loadComments(1);
    }, [loadComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || submitting) return;

        if (!isAuthenticated) {
            toast.error('Please login to comment');
            return;
        }

        setSubmitting(true);
        try {
            const newComment = await commentsApi.create(blogId, content.trim()) as Comment;
            setComments((prev) => [newComment, ...prev]);
            setTotal((t) => t + 1);
            setContent('');
            toast.success('Comment added!');
        } catch {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">
                <MessageCircle size={20} />
                Comments ({total})
            </h3>

            {isAuthenticated && (
                <form onSubmit={handleSubmit} className="comment-form">
                    <textarea
                        className="comment-input"
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        className="comment-submit"
                        disabled={submitting || !content.trim()}
                    >
                        {submitting ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            )}

            {!isAuthenticated && (
                <p className="comment-login-prompt">
                    Please <a href="/login">login</a> to leave a comment.
                </p>
            )}

            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                            <span className="comment-author">{comment.user.name}</span>
                            <span className="comment-date">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                    </div>
                ))}

                {loading && (
                    <div className="loading-spinner">
                        <Loader2 className="spin" size={24} />
                    </div>
                )}

                {!loading && comments.length === 0 && (
                    <p className="empty-state">No comments yet. Be the first!</p>
                )}

                {hasMore && !loading && (
                    <button
                        className="load-more"
                        onClick={() => {
                            const next = page + 1;
                            setPage(next);
                            loadComments(next);
                        }}
                    >
                        Load More Comments
                    </button>
                )}
            </div>
        </div>
    );
}

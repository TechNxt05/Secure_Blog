'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { blogsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface LikeButtonProps {
    blogId: string;
    initialLikeCount: number;
    initialLiked?: boolean;
    isAuthenticated: boolean;
}

export default function LikeButton({
    blogId,
    initialLikeCount,
    initialLiked = false,
    isAuthenticated,
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to like posts');
            return;
        }

        if (loading) return;

        // Optimistic update
        const previousLiked = liked;
        const previousCount = likeCount;
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        setLoading(true);

        try {
            const res = liked
                ? await blogsApi.unlike(blogId)
                : await blogsApi.like(blogId);
            setLiked(res.liked);
            setLikeCount(res.likeCount);
        } catch {
            // Rollback on failure
            setLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error('Failed to update like');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
            aria-label={liked ? 'Unlike' : 'Like'}
        >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
        </button>
    );
}

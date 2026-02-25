'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';

interface BlogCardProps {
    title: string;
    slug: string;
    summary: string | null;
    createdAt: string;
    author: string;
    likeCount: number;
    commentCount: number;
}

export default function BlogCard({
    title,
    slug,
    summary,
    createdAt,
    author,
    likeCount,
    commentCount,
}: BlogCardProps) {
    return (
        <Link href={`/blog/${slug}`} className="blog-card">
            <article>
                <h2 className="blog-card-title">{title}</h2>
                <p className="blog-card-summary">
                    {summary || 'No summary available...'}
                </p>
                <div className="blog-card-meta">
                    <span className="blog-card-meta-item">
                        <User size={14} />
                        {author}
                    </span>
                    <span className="blog-card-meta-item">
                        <Calendar size={14} />
                        {new Date(createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                    <span className="blog-card-meta-item">
                        <Heart size={14} />
                        {likeCount}
                    </span>
                    <span className="blog-card-meta-item">
                        <MessageCircle size={14} />
                        {commentCount}
                    </span>
                </div>
            </article>
        </Link>
    );
}

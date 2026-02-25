import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="hero">
      <div className="hero-glow" />
      <h1 className="hero-title">
        Welcome to <span className="gradient-text">SecureBlog</span>
      </h1>
      <p className="hero-subtitle">
        A production-grade blog platform built with NestJS, Next.js 15, and PostgreSQL.
        Secure authentication, real-time interactions, and a stunning reading experience.
      </p>
      <div className="hero-actions">
        <Link href="/feed" className="btn btn-primary">
          Browse Feed
        </Link>
        <Link href="/register" className="btn btn-secondary">
          Get Started
        </Link>
      </div>
      <div className="hero-features">
        <div className="hero-feature">
          <span className="feature-icon">🔐</span>
          <span>JWT Authentication</span>
        </div>
        <div className="hero-feature">
          <span className="feature-icon">❤️</span>
          <span>Like System</span>
        </div>
        <div className="hero-feature">
          <span className="feature-icon">💬</span>
          <span>Comments</span>
        </div>
        <div className="hero-feature">
          <span className="feature-icon">⚡</span>
          <span>Rate Limiting</span>
        </div>
      </div>
    </div>
  );
}

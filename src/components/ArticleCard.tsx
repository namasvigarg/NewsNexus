import React, { useState } from 'react';
import { Article } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  showRelevanceScore?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, showRelevanceScore }) => {
  const { theme } = useTheme();
  const { isAuthenticated, saveArticle, unsaveArticle, isArticleSaved } = useAuth();
  const [showCopied, setShowCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDark = theme === 'dark';
  const isSaved = isArticleSaved(article.id);

  // Cache article when card is rendered
  React.useEffect(() => {
    const cachedArticles = localStorage.getItem('newsNexusAllArticles');
    const articles = cachedArticles ? JSON.parse(cachedArticles) : [];
    const exists = articles.find((a: Article) => a.id === article.id);
    if (!exists) {
      articles.push(article);
      localStorage.setItem('newsNexusAllArticles', JSON.stringify(articles.slice(-200))); // Keep last 200
    }
  }, [article]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }
    if (isSaved) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(article.url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        border: isHovered ? '1px solid var(--border-glow-hover)' : '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {article.urlToImage && (
        <div style={{
          width: '100%',
          height: '220px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
          position: 'relative'
        }}>
          <img
            src={article.urlToImage}
            alt={article.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: 'var(--accent-purple)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {article.source}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {showRelevanceScore && article.relevanceScore !== undefined && (
              <span style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: 'var(--gradient-accent)',
                color: 'white',
                borderRadius: '9999px',
                fontWeight: '700',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.2)'
              }}>
                {article.relevanceScore > 0 ? `Match: ${article.relevanceScore}` : 'New'}
              </span>
            )}
            <button
              onClick={handleBookmark}
              title={isSaved ? 'Remove from saved' : 'Save article'}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.borderColor = 'var(--accent-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {isSaved ? '🔖' : '📑'}
            </button>
            <button
              onClick={handleShare}
              title="Copy article link"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.borderColor = 'var(--accent-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {showCopied ? '✅' : '🔗'}
            </button>
          </div>
        </div>

        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '700',
          lineHeight: '1.4',
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          transition: 'color 0.3s'
        }}>
          {article.title}
        </h3>
        {article.description && (
          <p style={{
            margin: '0 0 18px 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}>
            {article.description}
          </p>
        )}


        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            📅 {formatDate(article.publishedAt)}
          </span>
          {article.author && (
            <span style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              fontWeight: '600',
              maxWidth: '120px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              👤 {article.author}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
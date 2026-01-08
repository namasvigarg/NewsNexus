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
    return date.toLocaleDateString();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to save articles');
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
      style={{
        backgroundColor: isDark ? '#1e293b' : 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isDark 
          ? '0 2px 8px rgba(0,0,0,0.4)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 4px 12px rgba(0,0,0,0.6)' 
          : '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 2px 8px rgba(0,0,0,0.4)' 
          : '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {article.urlToImage && (
        <div style={{
          width: '100%',
          height: '200px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#0f172a' : '#f5f5f5'
        }}>
          <img
            src={article.urlToImage}
            alt={article.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isDark ? '#60a5fa' : '#1976d2',
            textTransform: 'uppercase'
          }}>
            {article.source}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {showRelevanceScore && article.relevanceScore !== undefined && (
              <span style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: isDark ? '#1e40af' : '#e3f2fd',
                color: isDark ? '#93c5fd' : '#1976d2',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                {article.relevanceScore > 0 ? `Match: ${article.relevanceScore}` : 'New'}
              </span>
            )}
            <button
              onClick={handleBookmark}
              title={isSaved ? 'Remove from saved' : 'Save article'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isSaved ? '🔖' : '📑'}
            </button>
            <button
              onClick={handleShare}
              title="Copy article link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                position: 'relative',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {showCopied ? '✅' : '🔗'}
            </button>
          </div>
        </div>

        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600',
          lineHeight: '1.4',
          color: isDark ? '#f1f5f9' : '#212121',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {article.title}
        </h3>

        {article.description && (
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: isDark ? '#94a3b8' : '#666',
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
          paddingTop: '12px',
          borderTop: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`
        }}>
          <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#999' }}>
            {formatDate(article.publishedAt)}
          </span>
          {article.author && (
            <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#999' }}>
              By {article.author}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
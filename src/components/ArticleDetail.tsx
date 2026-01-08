import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  const { markArticleAsRead } = useStore();
  const { theme } = useTheme();
  const { isAuthenticated, saveArticle, unsaveArticle, isArticleSaved } = useAuth();
  const [showCopied, setShowCopied] = useState(false);
  const isDark = theme === 'dark';
  const isSaved = isArticleSaved(article.id);

  useEffect(() => {
    markArticleAsRead(article.id);
  }, [article.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBookmark = () => {
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

  const handleShare = () => {
    navigator.clipboard.writeText(article.url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: isDark ? '#1e293b' : '#f5f5f5',
          color: isDark ? '#f1f5f9' : '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#e0e0e0'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f5f5f5'}
      >
        ← Back to Feed
      </button>

      <article style={{
        backgroundColor: isDark ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: isDark 
          ? '0 2px 8px rgba(0,0,0,0.4)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'background-color 0.3s, box-shadow 0.3s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: isDark ? '#60a5fa' : '#1976d2',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {article.source}
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBookmark}
              title={isSaved ? 'Remove from saved' : 'Save article'}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
                backgroundColor: isSaved 
                  ? (isDark ? '#1e40af' : '#e3f2fd')
                  : (isDark ? '#1e293b' : 'white'),
                color: isSaved 
                  ? (isDark ? '#fff' : '#1976d2')
                  : (isDark ? '#d1d5db' : '#333'),
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isSaved 
                  ? (isDark ? '#1e40af' : '#e3f2fd')
                  : (isDark ? '#1e293b' : 'white');
              }}
            >
              {isSaved ? '🔖 Saved' : '📑 Save'}
            </button>
            <button
              onClick={handleShare}
              title="Copy article link"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
                backgroundColor: isDark ? '#1e293b' : 'white',
                color: isDark ? '#d1d5db' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : 'white';
              }}
            >
              {showCopied ? '✅ Copied!' : '🔗 Share'}
            </button>
          </div>
        </div>

        <h1 style={{
          margin: '0 0 20px 0',
          fontSize: '32px',
          fontWeight: 'bold',
          lineHeight: '1.3',
          color: isDark ? '#f1f5f9' : '#212121'
        }}>
          {article.title}
        </h1>

        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e0e0e0'}`,
          fontSize: '14px',
          color: isDark ? '#94a3b8' : '#666'
        }}>
          {article.author && (
            <span>
              <strong>By</strong> {article.author}
            </span>
          )}
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        {article.urlToImage && (
          <div style={{
            marginBottom: '30px',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <img
              src={article.urlToImage}
              alt={article.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        )}

        {article.description && (
          <p style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: isDark ? '#cbd5e1' : '#424242',
            marginBottom: '30px',
            fontWeight: '500'
          }}>
            {article.description}
          </p>
        )}

        {article.content && (
          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: isDark ? '#cbd5e1' : '#424242',
            marginBottom: '30px'
          }}>
            {article.content}
          </div>
        )}

        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: isDark ? '#0f172a' : '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          transition: 'background-color 0.3s'
        }}>
          <p style={{ 
            marginBottom: '15px', 
            color: isDark ? '#94a3b8' : '#666' 
          }}>
            Read the full article at the source
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: isDark ? '#1e40af' : '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e3a8a' : '#1565c0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e40af' : '#1976d2'}
          >
            Read Full Article →
          </a>
        </div>
      </article>
    </div>
  );
};
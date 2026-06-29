import React from 'react';
import { useStore } from '../context/StoreContext';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';
import { NewsMoodMeter } from './NewsMoodMeter';

interface NewsFeedProps {
  onArticleClick: (article: Article) => void;
  currentCategory: string | null;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ onArticleClick, currentCategory }) => {
  const { newsState } = useStore();

  if (newsState.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ 
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--accent-purple)',
          borderRadius: '50%',
          animation: 'shimmer 1.5s infinite linear, spin 1s infinite linear',
          marginBottom: '20px'
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px' }}>Fetching latest stories...</p>
      </div>
    );
  }

  if (newsState.error) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', borderRadius: '16px', maxWidth: '500px', margin: '40px auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ef4444', fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>Connection Failure</h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{newsState.error}</p>
      </div>
    );
  }

  if (newsState.articles.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', maxWidth: '500px', margin: '40px auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>Feed is Empty</h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>No articles match your selection. Check back later!</p>
      </div>
    );
  }
  return (
    <div className="animate-fade-in">
      {!currentCategory && <NewsMoodMeter articles={newsState.articles} />}
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: '28px', 
        fontWeight: '800',
        fontFamily: 'var(--font-heading)',
        color: 'var(--text-primary)',
        letterSpacing: '-0.5px'
      }}>
        {currentCategory 
          ? `Latest Stories in ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}` 
          : 'Latest Stories'}
      </h2>

      <div 
        className="animate-fade-in-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}
      >
        {newsState.articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick(article)}
          />
        ))}
      </div>
    </div>
  );
};
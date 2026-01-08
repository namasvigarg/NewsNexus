import React from 'react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface NewsFeedProps {
  onArticleClick: (article: Article) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ onArticleClick }) => {
  const { newsState } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (newsState.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ color: isDark ? '#94a3b8' : '#666' }}>Loading news...</p>
      </div>
    );
  }

  if (newsState.error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <p style={{ color: '#ef4444' }}>{newsState.error}</p>
      </div>
    );
  }

  if (newsState.articles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
        <p style={{ color: isDark ? '#94a3b8' : '#666' }}>No articles found</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '24px', 
        fontWeight: 'bold',
        color: isDark ? '#f1f5f9' : '#212121'
      }}>
        Latest News
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
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
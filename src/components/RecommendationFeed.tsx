import React from 'react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface RecommendationFeedProps {
  onArticleClick: (article: Article) => void;
}

export const RecommendationFeed: React.FC<RecommendationFeedProps> = ({ onArticleClick }) => {
  const { recommendationState, userPreferences } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (recommendationState.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
        <p style={{ color: isDark ? '#94a3b8' : '#666' }}>Generating personalized recommendations...</p>
      </div>
    );
  }

  if (recommendationState.error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <p style={{ color: '#ef4444' }}>{recommendationState.error}</p>
      </div>
    );
  }

  if (recommendationState.recommendations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
        <h3 style={{ 
          marginBottom: '10px',
          color: isDark ? '#f1f5f9' : '#212121'
        }}>
          No recommendations yet
        </h3>
        <p style={{ color: isDark ? '#94a3b8' : '#666', marginBottom: '20px' }}>
          Set your preferences in the sidebar to get personalized news recommendations!
        </p>
        {userPreferences.categories.length === 0 && (
          <p style={{ 
            padding: '15px', 
            backgroundColor: isDark ? '#422006' : '#fff3cd',
            color: isDark ? '#fbbf24' : '#856404',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            💡 Tip: Select your favorite categories to start getting recommendations
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: isDark ? '#f1f5f9' : '#212121'
        }}>
          Recommended For You
        </h2>
        <p style={{ color: isDark ? '#64748b' : '#666', fontSize: '14px', margin: 0 }}>
          Based on your interests: {userPreferences.categories.join(', ') || 'None selected'}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {recommendationState.recommendations.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick(article)}
            showRelevanceScore={true}
          />
        ))}
      </div>
    </div>
  );
};
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
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ 
          display: 'inline-block',
          width: '50px',
          height: '50px',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--accent-purple)',
          borderRadius: '50%',
          animation: 'spin 1s infinite linear',
          marginBottom: '20px'
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '15px' }}>Analyzing your interests and fetching AI recommendations...</p>
      </div>
    );
  }

  if (recommendationState.error) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', borderRadius: '16px', maxWidth: '500px', margin: '40px auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ef4444', fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>Recommendation Error</h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{recommendationState.error}</p>
      </div>
    );
  }

  if (recommendationState.recommendations.length === 0) {
    return (
      <div 
        className="glass-panel animate-fade-in-up" 
        style={{ 
          textAlign: 'center', 
          padding: '60px 40px', 
          maxWidth: '520px', 
          margin: '40px auto',
          borderRadius: '20px',
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(99, 102, 241, 0.05)'
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 4s infinite ease-in-out' }}>✨</div>
        <h3 style={{ 
          fontFamily: 'var(--font-heading)',
          fontWeight: '800',
          fontSize: '22px',
          marginBottom: '12px',
          color: 'var(--text-primary)'
        }}>
          Personalize Your Feed
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500', lineHeight: '1.6', marginBottom: '24px' }}>
          Select categories under the preferences dashboard to allow Gemini AI to generate custom articles curated for you.
        </p>
        {userPreferences.categories.length === 0 && (
          <div style={{ 
            padding: '16px 20px', 
            backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : '#fffbeb',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            color: isDark ? '#fbbf24' : '#b45309',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            💡 Tip: Click on Dashboard {"->"} Preferences to enable personalized content feeds
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '28px', 
          fontWeight: '800',
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px'
        }}>
          Curated For You
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px', margin: 0 }}>
          Based on your selected categories: {userPreferences.categories
            .map(cat => cat.charAt(0).toUpperCase() + cat.slice(1))
            .join(', ') || 'None selected'}
        </p>
      </div>

      <div 
        className="animate-fade-in-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}
      >
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface SavedArticlesProps {
  onArticleClick: (article: Article) => void;
}

export const SavedArticles: React.FC<SavedArticlesProps> = ({ onArticleClick }) => {
  const { user } = useAuth();
  const { newsState } = useStore();
  const { theme } = useTheme();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const isDark = theme === 'dark';

  useEffect(() => {
    // Collect all unique articles from newsState and localStorage
    const articlesMap = new Map<string, Article>();
    
    // Add current newsState articles
    newsState.articles.forEach(article => {
      articlesMap.set(article.id, article);
    });
    
    // Try to get articles from localStorage cache
    const cachedArticles = localStorage.getItem('newsNexusAllArticles');
    if (cachedArticles) {
      try {
        const parsed = JSON.parse(cachedArticles);
        parsed.forEach((article: Article) => {
          if (!articlesMap.has(article.id)) {
            articlesMap.set(article.id, article);
          }
        });
      } catch (e) {
        console.error('Error parsing cached articles:', e);
      }
    }
    
    setAllArticles(Array.from(articlesMap.values()));
    
    // Cache current articles
    if (newsState.articles.length > 0) {
      const existing = cachedArticles ? JSON.parse(cachedArticles) : [];
      const merged = [...existing, ...newsState.articles];
      const unique = Array.from(new Map(merged.map(a => [a.id, a])).values());
      localStorage.setItem('newsNexusAllArticles', JSON.stringify(unique.slice(-200))); // Keep last 200
    }
  }, [newsState.articles]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 4s infinite ease-in-out' }}>🔒</div>
        <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>Credentials Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Please login to view saved bookmarks.</p>
      </div>
    );
  }

  // Filter articles that are saved
  const savedArticles = allArticles.filter(article => 
    user.savedArticles.includes(article.id)
  );

  if (savedArticles.length === 0) {
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
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 4s infinite ease-in-out' }}>🔖</div>
        <h3 style={{ 
          fontFamily: 'var(--font-heading)',
          fontWeight: '800',
          fontSize: '22px',
          marginBottom: '12px',
          color: 'var(--text-primary)'
        }}>
          Bookmarks are Empty
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '500', lineHeight: '1.6', marginBottom: '20px' }}>
          Bookmarks you save while reading will appear here. Click the bookmark icon on any article card to pin it.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: '28px', 
        fontWeight: '800',
        fontFamily: 'var(--font-heading)',
        color: 'var(--text-primary)',
        letterSpacing: '-0.5px'
      }}>
        Saved Bookmarks
      </h2>

      <div 
        className="animate-fade-in-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}
      >
        {savedArticles.map((article) => (
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
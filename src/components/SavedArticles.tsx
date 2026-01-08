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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: isDark ? '#f1f5f9' : '#212121', marginBottom: '10px' }}>
          Login Required
        </h2>
        <p style={{ color: isDark ? '#94a3b8' : '#666' }}>
          Please login to view your saved articles
        </p>
      </div>
    );
  }

  // Filter articles that are saved
  const savedArticles = allArticles.filter(article => 
    user.savedArticles.includes(article.id)
  );

  if (savedArticles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔖</div>
        <h2 style={{ 
          color: isDark ? '#f1f5f9' : '#212121', 
          marginBottom: '10px' 
        }}>
          No Saved Articles
        </h2>
        <p style={{ color: isDark ? '#94a3b8' : '#666', marginBottom: '20px' }}>
          You haven't saved any articles yet. Click the bookmark icon on any article to save it for later.
        </p>
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
        🔖 Saved Articles
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
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
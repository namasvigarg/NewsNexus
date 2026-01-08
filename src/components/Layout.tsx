import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NewsFeed } from './NewsFeed';
import { RecommendationFeed } from './RecommendationFeed';
import { SavedArticles } from './SavedArticles';
import { Dashboard } from './Dashboard';
import { ArticleDetail } from './ArticleDetail';
import { Article } from '../types';

type View = 'news' | 'recommendations' | 'saved' | 'dashboard' | 'article';

export const Layout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('news');
  const [previousView, setPreviousView] = useState<View>('news');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchNews, searchNews, fetchRecommendations, fetchNewsByCategory } = useStore();
  const { theme } = useTheme();

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('news');
    setCurrentCategory(null);
    if (query.trim()) {
      searchNews(query);
    } else {
      fetchNews();
    }
  };

  const handleViewChange = (view: View) => {
    setPreviousView(currentView);
    setCurrentView(view);
    setSearchQuery('');
    setCurrentCategory(null);
    if (view === 'recommendations') {
      fetchRecommendations();
    } else if (view === 'news') {
      fetchNews();
    }
  };

  const handleCategoryClick = (category: string) => {
    setPreviousView(currentView);
    setCurrentView('news');
    setCurrentCategory(category);
    setSearchQuery('');
    fetchNewsByCategory(category);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setPreviousView(currentView);
    setCurrentView('article');
  };

  const handleBackToFeed = () => {
    setSelectedArticle(null);
    setCurrentView(previousView);
    
    // Restore previous state
    if (searchQuery.trim()) {
      searchNews(searchQuery);
    } else if (currentCategory) {
      fetchNewsByCategory(currentCategory);
    } else if (previousView === 'recommendations') {
      fetchRecommendations();
    } else if (previousView === 'news') {
      fetchNews();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: isDark ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s'
    }}>
      <Header onSearch={handleSearch} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          currentView={currentCategory ? 'category' : currentView} 
          currentCategory={currentCategory}
          onViewChange={handleViewChange}
          onCategoryClick={handleCategoryClick}
        />
        <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {currentView === 'news' && <NewsFeed onArticleClick={handleArticleClick} />}
          {currentView === 'recommendations' && <RecommendationFeed onArticleClick={handleArticleClick} />}
          {currentView === 'saved' && <SavedArticles onArticleClick={handleArticleClick} />}
          {currentView === 'dashboard' && <Dashboard onArticleClick={handleArticleClick} />}
          {currentView === 'article' && selectedArticle && (
            <ArticleDetail article={selectedArticle} onBack={handleBackToFeed} />
          )}
        </main>
      </div>
    </div>
  );
};
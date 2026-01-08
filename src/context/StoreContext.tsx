import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article, UserPreferences, NewsState, RecommendationState } from '../types';
import { newsAPI } from '../services/api';

interface StoreContextType {
  newsState: NewsState;
  recommendationState: RecommendationState;
  userPreferences: UserPreferences;
  userId: string;
  fetchNews: (page?: number) => Promise<void>;
  searchNews: (query: string) => Promise<void>;
  fetchNewsByCategory: (category: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  markArticleAsRead: (articleId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [userId] = useState<string>(() => {
    const stored = localStorage.getItem('newsNexusUserId');
    if (stored) return stored;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('newsNexusUserId', newId);
    return newId;
  });

  const [newsState, setNewsState] = useState<NewsState>({
    articles: [],
    loading: false,
    error: null,
    totalResults: 0
  });

  const [recommendationState, setRecommendationState] = useState<RecommendationState>({
    recommendations: [],
    loading: false,
    error: null
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    categories: [],
    interests: [],
    sources: [],
    readArticles: []
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await newsAPI.getUserPreferences(userId);
        setUserPreferences(prefs);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, [userId]);

  const fetchNews = async (page = 1) => {
    setNewsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await newsAPI.fetchNews(page);
      setNewsState({
        articles: data.articles,
        loading: false,
        error: null,
        totalResults: data.totalResults
      });
    } catch (error) {
      setNewsState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch news'
      }));
    }
  };

  const searchNews = async (query: string) => {
    setNewsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await newsAPI.searchNews(query);
      setNewsState({
        articles: data.articles,
        loading: false,
        error: null,
        totalResults: data.totalResults
      });
    } catch (error) {
      setNewsState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to search news'
      }));
    }
  };

  const fetchNewsByCategory = async (category: string) => {
    setNewsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await newsAPI.getNewsByCategory(category);
      setNewsState({
        articles: data.articles,
        loading: false,
        error: null,
        totalResults: data.totalResults
      });
    } catch (error) {
      setNewsState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch news by category'
      }));
    }
  };

  const fetchRecommendations = async () => {
    setRecommendationState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // First fetch latest news
      const newsData = await newsAPI.fetchNews(1, 50);
      
      // If user has no preferences, show all news
      if (userPreferences.categories.length === 0) {
        setRecommendationState({
          recommendations: newsData.articles.slice(0, 20),
          loading: false,
          error: null
        });
        return;
      }
      
      // Get recommendations based on user preferences
      const data = await newsAPI.getRecommendations(userPreferences);
      setRecommendationState({
        recommendations: data.recommendations,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Recommendation error:', error);
      setRecommendationState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch recommendations'
      }));
    }
  };

  const updateUserPreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const updated = await newsAPI.updateUserPreferences(userId, prefs);
      setUserPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const markArticleAsRead = async (articleId: string) => {
    try {
      await newsAPI.markArticleAsRead(userId, articleId);
      setUserPreferences(prev => ({
        ...prev,
        readArticles: [...prev.readArticles, articleId]
      }));
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        newsState,
        recommendationState,
        userPreferences,
        userId,
        fetchNews,
        searchNews,
        fetchNewsByCategory,
        fetchRecommendations,
        updateUserPreferences,
        markArticleAsRead
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article, UserPreferences, NewsState, RecommendationState } from '../types';
import { newsAPI } from '../services/api';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const userId = user?.id || '';

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
    if (!userId || userId === 'guest') {
      const guestPrefs = localStorage.getItem('newsNexusGuestPreferences');
      if (guestPrefs) {
        try {
          setUserPreferences(JSON.parse(guestPrefs));
        } catch (e) {
          console.error('Error parsing guest preferences:', e);
        }
      } else {
        setUserPreferences({
          categories: [],
          interests: [],
          sources: [],
          readArticles: []
        });
      }
      return;
    }
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
      // If user has no preferences, show message
      if (userPreferences.categories.length === 0) {
        setRecommendationState({
          recommendations: [],
          loading: false,
          error: null
        });
        return;
      }
      
      // Fetch news from all selected categories
      const allRecommendations = [];
      
      for (const category of userPreferences.categories) {
        try {
          const data = await newsAPI.getNewsByCategory(category, 1, 50);
          allRecommendations.push(...data.articles);
        } catch (error) {
          console.error(`Error fetching ${category}:`, error);
        }
      }
      
      // Remove duplicates based on article ID
      const uniqueArticles = Array.from(
        new Map(allRecommendations.map(article => [article.id, article])).values()
      );
      
      // Score and sort articles
      const scoredArticles = uniqueArticles.map(article => ({
        ...article,
        relevanceScore: calculateRelevanceScore(article, userPreferences)
      }));
      
      // Sort by relevance (return all articles, not limited to 20)
      const sorted = scoredArticles
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setRecommendationState({
        recommendations: sorted,
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

  const calculateRelevanceScore = (article: Article, prefs: UserPreferences): number => {
    let score = 0;
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    if (prefs.categories.includes(article.category || '')) {
      score += 5;
    }
    
    if (prefs.interests && prefs.interests.length > 0) {
      prefs.interests.forEach(interest => {
        if (text.includes(interest.toLowerCase())) {
          score += 2;
        }
      });
    }
    
    return score;
  };

  const updateUserPreferences = async (prefs: Partial<UserPreferences>) => {
    if (!userId || userId === 'guest') {
      setUserPreferences(prev => {
        const updated = {
          ...prev,
          categories: prefs.categories || prev.categories,
          interests: prefs.interests || prev.interests,
          sources: prefs.sources || prev.sources
        };
        localStorage.setItem('newsNexusGuestPreferences', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    try {
      const updated = await newsAPI.updateUserPreferences(userId, prefs);
      setUserPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const markArticleAsRead = async (articleId: string) => {
    // 1. Update local state immediately
    setUserPreferences(prev => {
      if (prev.readArticles.includes(articleId)) return prev;
      const updated = {
        ...prev,
        readArticles: [...prev.readArticles, articleId]
      };
      if (!userId || userId === 'guest') {
        localStorage.setItem('newsNexusGuestPreferences', JSON.stringify(updated));
      }
      return updated;
    });

    // 2. Log read event dynamically for dashboard analytics
    const article = newsState.articles.find(a => a.id === articleId) || 
                    recommendationState.recommendations.find(a => a.id === articleId);
                    
    // Cache the full article object locally so it's always available in the Reading History list
    const readArticlesKey = `newsNexusReadArticlesList_${userId}`;
    const savedReadArticles = JSON.parse(localStorage.getItem(readArticlesKey) || '[]');
    if (article && !savedReadArticles.some((a: any) => a.id === article.id)) {
      savedReadArticles.push(article);
      localStorage.setItem(readArticlesKey, JSON.stringify(savedReadArticles));
    }
                    
    const logsKey = `newsNexusReadLogs_${userId}`;
    const existingLogs = JSON.parse(localStorage.getItem(logsKey) || '[]');
    
    if (!existingLogs.some((l: any) => l.articleId === articleId)) {
      const text = article ? `${article.title} ${article.description || ''} ${article.content || ''}` : '';
      const wordsCount = text.split(/\s+/).filter(Boolean).length;
      const readingTimeMin = Math.max(1, Math.round(wordsCount / 200)) || 2; // standard reading speed
      
      const logEntry = {
        articleId,
        timestamp: Date.now(),
        category: article?.category || 'general',
        source: article?.source || 'General News',
        readingTimeMin
      };
      existingLogs.push(logEntry);
      localStorage.setItem(logsKey, JSON.stringify(existingLogs));
    }

    // 3. Try to save on server only for authenticated users
    if (userId && userId !== 'guest') {
      try {
        await newsAPI.markArticleAsRead(userId, articleId);
      } catch (error) {
        console.error('Error marking article as read on server:', error);
      }
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
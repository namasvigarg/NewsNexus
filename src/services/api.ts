import { Article, UserPreferences } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('newsNexusToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const newsAPI = {
  async fetchNews(page = 1, limit = 50) {
    const response = await fetch(`${API_BASE}/news?page=${page}&limit=${limit}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },

  async searchNews(query: string, page = 1, limit = 50) {
    const response = await fetch(`${API_BASE}/news/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to search news');
    return response.json();
  },

  async getNewsByCategory(category: string, page = 1, limit = 50) {
    const response = await fetch(`${API_BASE}/news/category/${category}?page=${page}&limit=${limit}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch news by category');
    return response.json();
  },

  async getRecommendations(userPreferences: UserPreferences) {
    const response = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userPreferences })
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  async getAIRecommendations(query: string) {
    const response = await fetch(`${API_BASE}/recommendations/ai`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error('Failed to fetch AI recommendations');
    return response.json();
  },

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE}/user/preferences/${userId}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user preferences');
    const data = await response.json();
    return data.preferences;
  },

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE}/user/preferences/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(preferences)
    });
    if (!response.ok) throw new Error('Failed to update user preferences');
    const data = await response.json();
    return data.preferences;
  },

  async markArticleAsRead(userId: string, articleId: string) {
    const response = await fetch(`${API_BASE}/user/read/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ articleId })
    });
    if (!response.ok) throw new Error('Failed to mark article as read');
    return response.json();
  },

  async askAIAboutArticle(article: Article, message: string) {
    const response = await fetch(`${API_BASE}/news/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ article, message })
    });
    if (!response.ok) throw new Error('Failed to get response from AI assistant');
    return response.json();
  },

  async getArticleInsights(article: Article) {
    const response = await fetch(`${API_BASE}/news/insights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ article })
    });
    if (!response.ok) throw new Error('Failed to fetch article insights');
    return response.json();
  }
};
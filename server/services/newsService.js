import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';
const CATEGORIES = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

// Fetch latest news from all categories
export const fetchNews = async (page = 1, limit = 50) => {
  try {
    // Fetch articles from all categories
    const allArticles = [];
    
    for (const category of CATEGORIES) {
      try {
        const response = await axios.get(`${NEWS_API_BASE}/top-headlines`, {
          params: {
            apiKey: NEWS_API_KEY,
            category: category,
            country: 'us',
            pageSize: Math.ceil(limit / CATEGORIES.length),
            page: 1
          }
        });
        
        const articles = response.data.articles.map(article => ({
          id: article.url,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name,
          author: article.author,
          category: category
        }));
        
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching ${category}:`, error.message);
      }
    }
    
    // Sort by date and limit
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
    
    return {
      articles: sortedArticles,
      totalResults: sortedArticles.length
    };
  } catch (error) {
    console.error('Error fetching news:', error.message);
    throw new Error('Failed to fetch news');
  }
};

// Search news
export const searchNews = async (query, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${NEWS_API_BASE}/everything`, {
      params: {
        apiKey: NEWS_API_KEY,
        q: query,
        pageSize: limit,
        page: page,
        sortBy: 'relevancy'
      }
    });
    
    return {
      articles: response.data.articles.map(article => ({
        id: article.url,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.author
      })),
      totalResults: response.data.totalResults
    };
  } catch (error) {
    console.error('Error searching news:', error.message);
    throw new Error('Failed to search news');
  }
};

// Get news by category
export const getNewsByCategory = async (category, page = 1, limit = 50) => {
  try {
    const response = await axios.get(`${NEWS_API_BASE}/top-headlines`, {
      params: {
        apiKey: NEWS_API_KEY,
        category: category,
        country: 'us',
        pageSize: limit,
        page: page
      }
    });
    
    return {
      articles: response.data.articles.map(article => ({
        id: article.url,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.author,
        category: category
      })),
      totalResults: response.data.totalResults
    };
  } catch (error) {
    console.error('Error fetching news by category:', error.message);
    throw new Error('Failed to fetch news by category');
  }
};
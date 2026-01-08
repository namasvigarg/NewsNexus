import express from 'express';
import { getRecommendations, getAIRecommendations, extractTopics } from '../services/recommendationService.js';
import { fetchNews } from '../services/newsService.js';

const router = express.Router();

// Get personalized recommendations
router.post('/', async (req, res) => {
  try {
    const { userPreferences } = req.body;
    
    if (!userPreferences) {
      return res.status(400).json({ error: 'User preferences required' });
    }
    
    // Fetch latest news
    const newsData = await fetchNews(1, 50);
    
    // Get recommendations
    const recommendations = await getRecommendations(newsData.articles, userPreferences);
    
    res.json({ recommendations: recommendations.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI-powered recommendations
router.post('/ai', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }
    
    // Fetch latest news
    const newsData = await fetchNews(1, 30);
    
    // Get AI recommendations
    const recommendations = await getAIRecommendations(newsData.articles, query);
    
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract trending topics
router.get('/topics', async (req, res) => {
  try {
    // Fetch latest news
    const newsData = await fetchNews(1, 50);
    
    // Extract topics
    const topics = await extractTopics(newsData.articles);
    
    res.json({ topics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
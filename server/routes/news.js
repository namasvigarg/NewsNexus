import express from 'express';
import { fetchNews, searchNews, getNewsByCategory } from '../services/newsService.js';

const router = express.Router();

// Get latest news
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const news = await fetchNews(page, limit);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const news = await searchNews(q, page, limit);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const news = await getNewsByCategory(category, page, limit);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
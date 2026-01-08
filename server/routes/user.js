import express from 'express';

const router = express.Router();

// In-memory storage (replace with database in production)
const users = new Map();

// Get user preferences
router.get('/preferences/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = users.get(userId) || {
      categories: [],
      interests: [],
      sources: [],
      readArticles: []
    };
    res.json({ preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
router.post('/preferences/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { categories, interests, sources } = req.body;
    
    const currentPrefs = users.get(userId) || { readArticles: [] };
    
    const updatedPrefs = {
      ...currentPrefs,
      categories: categories || currentPrefs.categories || [],
      interests: interests || currentPrefs.interests || [],
      sources: sources || currentPrefs.sources || []
    };
    
    users.set(userId, updatedPrefs);
    
    res.json({ preferences: updatedPrefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track read article
router.post('/read/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { articleId } = req.body;
    
    const preferences = users.get(userId) || {
      categories: [],
      interests: [],
      sources: [],
      readArticles: []
    };
    
    if (!preferences.readArticles.includes(articleId)) {
      preferences.readArticles.push(articleId);
    }
    
    users.set(userId, preferences);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get read articles
router.get('/read/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = users.get(userId) || { readArticles: [] };
    res.json({ readArticles: preferences.readArticles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
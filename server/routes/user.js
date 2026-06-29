import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PREFS_FILE = path.join(DATA_DIR, 'preferences.json');

// Ensure data directory exists on load
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read/Load JSON data securely
const loadJSON = (filePath, fallback = {}) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error loading JSON file ${filePath}:`, e.message);
  }
  return fallback;
};

// Write/Save JSON data securely
const saveJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error saving JSON file ${filePath}:`, e.message);
  }
};

// Secret key for token signature verification
const SECRET_KEY = process.env.GEMINI_API_KEY || 'newsnexus_default_token_signature_secret_99831';

// Password Hashing Helper using PBKDF2
const hashPassword = (password) => {
  const salt = 'newsnexus_salt_secret_129';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

// Custom Stateless Base64 Signed Token Generator
const generateToken = (userId) => {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7-day expiration
  const data = `${userId}.${expires}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return Buffer.from(`${data}.${signature}`).toString('base64');
};

// Token Verification Helper
const verifyToken = (token) => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [userId, expires, signature] = decoded.split('.');
    if (!userId || !expires || !signature) return null;
    
    // Check expiration
    if (Date.now() > parseInt(expires)) return null;
    
    const data = `${userId}.${expires}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    if (signature === expectedSignature) {
      return userId;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.userId = userId;
  next();
};

// User Registration Route
router.post('/signup', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const accounts = loadJSON(USERS_FILE, {});
    
    const existing = Object.values(accounts).find(u => u.email === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists!' });
    }
    
    const userId = `user_${Date.now()}`;
    const newAccount = {
      id: userId,
      email: normalizedEmail,
      name,
      passwordHash: hashPassword(password),
      savedArticles: []
    };
    
    accounts[userId] = newAccount;
    saveJSON(USERS_FILE, accounts);
    
    // Set initial preferences
    const preferences = loadJSON(PREFS_FILE, {});
    preferences[userId] = {
      categories: [],
      interests: [],
      sources: [],
      readArticles: []
    };
    saveJSON(PREFS_FILE, preferences);
    
    const token = generateToken(userId);
    res.json({
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        name,
        savedArticles: []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Sign In Route
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const accounts = loadJSON(USERS_FILE, {});
    
    const foundAccount = Object.values(accounts).find(u => u.email === normalizedEmail);
    if (!foundAccount || foundAccount.passwordHash !== hashPassword(password)) {
      return res.status(400).json({ error: 'Invalid email or password!' });
    }
    
    const token = generateToken(foundAccount.id);
    res.json({
      token,
      user: {
        id: foundAccount.id,
        email: foundAccount.email,
        name: foundAccount.name,
        savedArticles: foundAccount.savedArticles || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify active token route
router.get('/me', authMiddleware, (req, res) => {
  try {
    const accounts = loadJSON(USERS_FILE, {});
    const account = accounts[req.userId];
    if (!account) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        savedArticles: account.savedArticles || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user preferences
router.get('/preferences/:userId', authMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const preferences = loadJSON(PREFS_FILE, {});
    const userPrefs = preferences[userId] || {
      categories: [],
      interests: [],
      sources: [],
      readArticles: []
    };
    res.json({ preferences: userPrefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
router.post('/preferences/:userId', authMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    const { categories, interests, sources } = req.body;
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const preferences = loadJSON(PREFS_FILE, {});
    const currentPrefs = preferences[userId] || { readArticles: [] };
    const updatedPrefs = {
      ...currentPrefs,
      categories: categories || currentPrefs.categories || [],
      interests: interests || currentPrefs.interests || [],
      sources: sources || currentPrefs.sources || []
    };
    
    preferences[userId] = updatedPrefs;
    saveJSON(PREFS_FILE, preferences);
    res.json({ preferences: updatedPrefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track read article
router.post('/read/:userId', authMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    const { articleId } = req.body;
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const preferences = loadJSON(PREFS_FILE, {});
    const currentPrefs = preferences[userId] || {
      categories: [],
      interests: [],
      sources: [],
      readArticles: []
    };
    
    if (!currentPrefs.readArticles.includes(articleId)) {
      currentPrefs.readArticles.push(articleId);
    }
    
    preferences[userId] = currentPrefs;
    saveJSON(PREFS_FILE, preferences);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get read articles
router.get('/read/:userId', authMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const preferences = loadJSON(PREFS_FILE, {});
    const currentPrefs = preferences[userId] || { readArticles: [] };
    res.json({ readArticles: currentPrefs.readArticles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bookmark an article
router.post('/save/:userId', authMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    const { articleId } = req.body;
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const accounts = loadJSON(USERS_FILE, {});
    const account = accounts[userId];
    if (!account) return res.status(404).json({ error: 'User account not found' });
    
    if (!account.savedArticles) {
      account.savedArticles = [];
    }
    
    if (!account.savedArticles.includes(articleId)) {
      account.savedArticles.push(articleId);
    }
    
    accounts[userId] = account;
    saveJSON(USERS_FILE, accounts);
    res.json({ success: true, savedArticles: account.savedArticles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unbookmark an article
router.post('/unsave/:userId', authMiddleware, (req, res) => {
  try {
    const { userId } = req.params;
    const { articleId } = req.body;
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const accounts = loadJSON(USERS_FILE, {});
    const account = accounts[userId];
    if (!account) return res.status(404).json({ error: 'User account not found' });
    
    if (!account.savedArticles) {
      account.savedArticles = [];
    }
    
    account.savedArticles = account.savedArticles.filter(id => id !== articleId);
    accounts[userId] = account;
    saveJSON(USERS_FILE, accounts);
    res.json({ success: true, savedArticles: account.savedArticles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
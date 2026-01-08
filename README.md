# 📰 NewsNexus

**AI-Powered News Aggregation Platform with Personalized Recommendations**

NewsNexus is a modern, full-stack news aggregation platform that delivers personalized news experiences using AI-powered recommendations, smart categorization, and an intuitive user interface.

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time News Aggregation** - Fetch latest news from multiple sources via News API
- **AI-Powered Recommendations** - Get personalized news based on your interests using Google Gemini AI
- **Smart Search** - Search across all news articles with instant results
- **Category Filtering** - Browse news by 6 categories: Business, Entertainment, Health, Science, Sports, Technology
- **Bookmark System** - Save articles for later reading
- **Reading History** - Track all articles you've read

### 👤 User Features
- **User Authentication** - Secure login and signup system
- **User Dashboard** - Manage profile, preferences, saved articles, and reading history
- **Personalized Preferences** - Select your interests to customize your news feed
- **Profile Management** - Edit your personal information

### 🎨 Design & UI
- **Dark/Light Mode** - Toggle between themes with preference persistence
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Article Sharing** - One-click copy article links to clipboard

### 🧠 AI & ML Features
- **NLP-Based Recommendations** - Semantic analysis of article content
- **Relevance Scoring** - Articles ranked by match to user interests
- **Topic Extraction** - Automatic identification of trending topics
- **Hybrid Ranking System** - Combines AI recommendations with user preferences

---

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Context API** - State management
- **CSS-in-JS** - Component-scoped styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **News API** - News aggregation service
- **Google Gemini AI** - AI-powered recommendations
- **Axios** - HTTP client

### Storage
- **localStorage** - Client-side data persistence
- Caches up to 200 articles for offline access
- Stores user preferences and authentication


## 📁 Project Structure

```
NewsNexus/
├── server/                      # Backend
│   ├── index.js                # Express server
│   ├── routes/
│   │   ├── news.js            # News endpoints
│   │   ├── recommendations.js # AI recommendation endpoints
│   │   └── user.js            # User management endpoints
│   └── services/
│       ├── newsService.js     # News API integration
│       └── recommendationService.js # AI recommendation logic
│
├── src/                        # Frontend
│   ├── components/
│   │   ├── ArticleCard.tsx    # Article preview card
│   │   ├── ArticleDetail.tsx  # Full article view
│   │   ├── Dashboard.tsx      # User dashboard
│   │   ├── Header.tsx         # App header
│   │   ├── Layout.tsx         # Main layout
│   │   ├── Login.tsx          # Login page
│   │   ├── NewsFeed.tsx       # News feed view
│   │   ├── RecommendationFeed.tsx # Personalized feed
│   │   ├── SavedArticles.tsx  # Bookmarked articles
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Signup.tsx         # Signup page
│   │   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   │   └── UserMenu.tsx       # User profile menu
│   ├── context/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── StoreContext.tsx   # App state management
│   │   └── ThemeContext.tsx   # Theme state
│   ├── services/
│   │   └── api.ts             # API client
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   ├── types.ts               # TypeScript types
│   └── index.css              # Global styles
│
├── .env                        # Backend environment variables
├── .env.local                  # Frontend environment variables
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── README.md                   # This file
```

[⬆ Back to Top](#-newsnexus)

</div>

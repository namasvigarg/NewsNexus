# 📰 NewsNexus

**AI-Powered News Aggregation Platform with Personalized Recommendations**

NewsNexus is a modern, full-stack news aggregation platform that delivers personalized news experiences using AI-powered recommendations, smart categorization, and an intuitive user interface.

🔗 **Live demo:** [newsnexus-two.vercel.app](https://newsnexus-two.vercel.app)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time News Aggregation** — Fetch the latest news from multiple sources via News API
- **AI-Powered Recommendations** — Get personalized news based on your interests using Google Gemini AI
- **Smart Search** — Search across all news articles with instant results
- **Category Filtering** — Browse news by 6 categories: Business, Entertainment, Health, Science, Sports, Technology
- **Bookmark System** — Save articles for later reading
- **Reading History** — Track all the articles you've read

### 👤 User Features
- **User Authentication** — Secure login and signup system
- **User Dashboard** — Manage profile, preferences, saved articles, and reading history
- **Personalized Preferences** — Select your interests to customize your news feed
- **Profile Management** — Edit your personal information

### 🎨 Design & UI
- **Dark/Light Mode** — Toggle between themes with preference persistence
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Modern UI** — Clean, intuitive interface with smooth animations
- **Article Sharing** — One-click copy article links to clipboard

### 🧠 AI & ML Features
- **NLP-Based Recommendations** — Semantic analysis of article content
- **Relevance Scoring** — Articles ranked by match to user interests
- **Topic Extraction** — Automatic identification of trending topics
- **Hybrid Ranking System** — Combines AI recommendations with user preferences

---

## 🚀 Tech Stack

### Frontend
- **React 19** — Modern UI library with the latest features
- **TypeScript** — Type-safe development
- **Vite** — Lightning-fast build tool
- **Context API** — State management
- **CSS-in-JS** — Component-scoped styling

### Backend
- **Node.js / Express** — Server runtime and web framework
- **News API** — News aggregation service
- **Google Gemini AI** — AI-powered recommendations
- **Supabase** — Backend-as-a-service (auth/data)
- **Axios** — HTTP client

### Storage
- **localStorage** — Client-side data persistence
- Caches up to 200 articles for offline access
- Stores user preferences and authentication state

### Tooling
- **ESLint** — Linting
- **Nodemon** — Backend live-reload during development
- **Vercel** — Deployment

---

## 📁 Project Structure

```
NewsNexus/
├── server/                      # Backend
│   ├── index.js                 # Express server
│   ├── routes/
│   │   ├── news.js              # News endpoints
│   │   ├── recommendations.js   # AI recommendation endpoints
│   │   └── user.js              # User management endpoints
│   └── services/
│       ├── newsService.js       # News API integration
│       └── recommendationService.js # AI recommendation logic
│
├── src/                         # Frontend
│   ├── components/
│   │   ├── ArticleCard.tsx      # Article preview card
│   │   ├── ArticleDetail.tsx    # Full article view
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Header.tsx           # App header
│   │   ├── Layout.tsx           # Main layout
│   │   ├── Login.tsx            # Login page
│   │   ├── NewsFeed.tsx         # News feed view
│   │   ├── RecommendationFeed.tsx # Personalized feed
│   │   ├── SavedArticles.tsx    # Bookmarked articles
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── Signup.tsx           # Signup page
│   │   ├── ThemeToggle.tsx      # Dark/light mode toggle
│   │   └── UserMenu.tsx         # User profile menu
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── StoreContext.tsx     # App state management
│   │   └── ThemeContext.tsx     # Theme state
│   ├── services/
│   │   └── api.ts               # API client
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   ├── types.ts                 # TypeScript types
│   └── index.css                # Global styles
│
├── .env                         # Backend environment variables
├── .env.local                   # Frontend environment variables
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- A [News API](https://newsapi.org/) key
- A [Google Gemini AI](https://ai.google.dev/) API key
- A [Supabase](https://supabase.com/) project (URL + anon key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/namasvigarg/NewsNexus.git
   cd NewsNexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root for the backend:
   ```env
   NEWS_API_KEY=your_news_api_key
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   PORT=5000
   ```

   Create a `.env.local` file in the project root for the frontend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the backend server**
   ```bash
   npm run dev:server
   ```

5. **Run the frontend (in a separate terminal)**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite frontend dev server |
| `npm run dev:server` | Start the backend with Nodemon (auto-restart) |
| `npm run start:server` | Start the backend in production mode |
| `npm run build` | Type-check and build the frontend for production |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Preview the production build locally |

---

## 🚢 Deployment

This project is configured for deployment on [Vercel](https://vercel.com/) via `vercel.json`. Push to your connected repository or run the Vercel CLI to deploy. Make sure all required environment variables are set in your Vercel project settings.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 🙏 Acknowledgements

- [News API](https://newsapi.org/) for news aggregation
- [Google Gemini AI](https://ai.google.dev/) for AI-powered recommendations
- [Supabase](https://supabase.com/) for backend services

[⬆ Back to Top](#-newsnexus)

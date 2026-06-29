import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_API_BASE = 'https://gnews.io/api/v4';
const CATEGORIES = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

// Simple memory cache to conserve GNews API requests (100 request/day limit)
const articleCache = new Map();
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours cache

const getCachedArticles = (key) => {
  const cached = articleCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.articles;
  }
  return null;
};

const setCachedArticles = (key, articles) => {
  articleCache.set(key, {
    timestamp: Date.now(),
    articles
  });
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// High-quality mock news database covering all categories
const MOCK_ARTICLES = {
  science: [
    {
      title: "James Webb Telescope Discovers Atmospheric Water on Distant Exoplanet",
      description: "NASA's James Webb Space Telescope has detected significant amounts of water vapor in the atmosphere of a gas giant exoplanet located 150 light-years away.",
      content: "In a groundbreaking discovery, astronomers using NASA's James Webb Space Telescope have identified clear signatures of water vapor in the atmosphere of WASP-96b, a hot gas giant orbiting a sun-like star. The observations reveal the presence of clouds and hazes in the exoplanet's atmosphere, which was previously thought to be completely cloudless. Scientists say this discovery opens new avenues for studying potentially habitable worlds in the future.",
      url: "https://example.com/science-webb-water",
      urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: "Space Science Daily",
      author: "Dr. Sarah Jenkins",
      category: "science"
    },
    {
      title: "New Breakthrough in Fusion Energy Reaches Critical Net Energy Gain",
      description: "Physicists at the National Ignition Facility have successfully replicated a controlled fusion reaction that produced more energy than it consumed.",
      content: "For the second time in history, scientists at the Lawrence Livermore National Laboratory have achieved a net energy gain in a fusion reaction, yielding a higher energy output than previous attempts. The fusion milestone represents a crucial step forward in the quest for clean, near-limitless power. Researchers believe commercial fusion power plants could become a reality within the next two decades, reshaping the global energy landscape.",
      url: "https://example.com/science-fusion-gain",
      urlToImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: "Physics Review",
      author: "David Vance",
      category: "science"
    }
  ],
  sports: [
    {
      title: "Championship Underdogs Secure Historic Victory in Thrilling Final Match",
      description: "A last-minute goal sealed the victory for the underdogs in a match that will be remembered for generations.",
      content: "In one of the greatest upsets in modern sports history, the underdogs rallied from a two-goal deficit to win the championship trophy. The dramatic final minutes saw a stunning volley from substitute striker Marcus Vance, securing the victory in stoppage time. Fans flooded the streets in celebration of a historic milestone that broke a thirty-year championship drought.",
      url: "https://example.com/sports-championship-upset",
      urlToImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: "Global Sports Network",
      author: "Marcus Vance",
      category: "sports"
    },
    {
      title: "World Tennis Star Announces Return Ahead of Grand Slam Open Tournament",
      description: "After a six-month injury layoff, the former world number one has confirmed participation in the upcoming tournament.",
      content: "Tennis icon Elena Rostova has officially announced her return to competitive play after recovering from knee surgery. Rostova, who has won fifteen grand slam singles titles, expressed excitement about competing at the highest level again. Critics are eager to see if she can regain her form and challenge the current top seed in the upcoming championship match.",
      url: "https://example.com/sports-tennis-return",
      urlToImage: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: "Court Side News",
      author: "Elena Rostova",
      category: "sports"
    }
  ],
  technology: [
    {
      title: "Next-Generation Quantum Computer Achieves Quantum Supremacy Benchmark",
      description: "Tech researchers have developed a 1000-qubit processor capable of solving complex cryptographic algorithms in seconds.",
      content: "Quantum Computing Corp has unveiled its newest processor, code-named 'Aether', which has successfully demonstrated computing capabilities that surpass conventional supercomputers by a factor of millions. The processor resolved a highly complex mathematical sequence in just under 3 seconds, a calculation that would take contemporary servers years to finish. Industry leaders caution that this advance accelerates the urgency for quantum-resistant security standards.",
      url: "https://example.com/tech-quantum-supremacy",
      urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: "Tech Vanguard",
      author: "Nadia Petrova",
      category: "technology"
    },
    {
      title: "Global Supply Chain Resolves Semiconductor Shortage with New Factories",
      description: "Leading semiconductor fabricators announce a major expansion of local microchip production capacity.",
      content: "Silicon Fab International has opened two new state-of-the-art chip manufacturing facilities, aimed at fully resolving the lingering microchip supply constraints. The factories are designed to produce next-gen 3nm processors for automotive and consumer electronics companies. Economists predict that the local capacity boost will stabilize prices and support technological manufacturing growth throughout the year.",
      url: "https://example.com/tech-semiconductor-expansion",
      urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date(Date.now() - 5400000).toISOString(),
      source: "Silicon Insider",
      author: "James Liang",
      category: "technology"
    }
  ],
  business: [
    {
      title: "Federal Reserve Announces Key Interest Rate Decision Aimed at Inflation Control",
      description: "Central bank chooses to hold interest rates steady, signaling progress in stabilizing consumer pricing spikes.",
      content: "The Federal Reserve has decided to keep interest rates in their current target range, stating that while inflation remains above target, economic indicators suggest that consumer spending is normalizing. Markets responded positively to the announcement, with major indices closing at record highs. Analysts predict that rate cuts could be on the horizon if inflation figures continue to trend downward.",
      url: "https://example.com/business-fed-rate",
      urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: "Market Pulse",
      author: "Arthur Vance",
      category: "business"
    }
  ],
  entertainment: [
    {
      title: "Blockbuster Cinematic Release Shatters Opening Weekend Box Office Records",
      description: "The highly anticipated sci-fi sequel has earned a record-breaking $250 million globally in its opening three days.",
      content: "Director Christopher Vance's latest cinematic epic, 'Chronicles of WASP', has taken the box office by storm, grossing over $250 million on its debut weekend. Audiences and critics alike have praised the film's stunning visuals and complex narrative. Theatre chains report sold-out screenings across the country, signaling a powerful rebound for theatrical entertainment releases.",
      url: "https://example.com/entertainment-box-office",
      urlToImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: "Hollywood Insider",
      author: "Christopher Vance",
      category: "entertainment"
    }
  ],
  health: [
    {
      title: "Promising Medical Trial Shows High Efficacy in Combating Rare Illnesses",
      description: "A newly developed therapeutic drug has successfully passed final clinical testing with minimal side effects.",
      content: "BioPharma Lab has announced successful results from its phase-three trials of a new immunotherapy drug. The treatment, designed to target specific rare neurological conditions, showed a significant reduction in symptoms for over 85% of trial participants. Researchers are optimistic about fast-track regulatory approval, which could make the drug available to patients by early next year.",
      url: "https://example.com/health-treatment-success",
      urlToImage: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: "Medical Science Journal",
      author: "Dr. Nadia Petrova",
      category: "health"
    }
  ]
};

// Server-side cache to minimize Gemini API calls and stay within free tier rate limits
const insightsCache = new Map(); // url -> { insights, timeline, sentiment }

// Local keyword-based sentiment analyzer fallback on the backend
const calculateFallbackSentiment = (article) => {
  const positiveWords = ['gain', 'rise', 'win', 'benefit', 'success', 'grow', 'improve', 'boost', 'recovery', 'save', 'safe', 'deal', 'agreement', 'support'];
  const negativeWords = ['loss', 'drop', 'fail', 'decline', 'protest', 'clash', 'crisis', 'warn', 'risk', 'fear', 'death', 'kill', 'arrest', 'ban', 'cut', 'inflation'];
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  
  let score = 0;
  positiveWords.forEach(w => { if (text.includes(w)) score++; });
  negativeWords.forEach(w => { if (text.includes(w)) score--; });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

// Advanced dynamic local fallback summarizer
const generateFallbackInsights = (article) => {
  const insights = [];
  
  // Clean description and content of raw HTML tags and character indicators
  const cleanHTML = (text) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // strip HTML tags completely
      .replace(/\[\+\d+ chars\]/g, '') // remove characters limit indicator
      .replace(/\s+/g, ' ') // clean up duplicate whitespaces/tabs/newlines
      .trim();
  };

  const cleanDesc = cleanHTML(article.description);
  const cleanCont = cleanHTML(article.content);

  const fullText = `${cleanDesc}. ${cleanCont}`;
  const rawSentences = fullText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 130);
  
  // Deduplicate and filter out near-identical sentences
  rawSentences.forEach(s => {
    const normalized = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isDuplicate = insights.some(existing => {
      const existingNormalized = existing.toLowerCase().replace(/[^a-z0-9]/g, '');
      return existingNormalized.includes(normalized) || normalized.includes(existingNormalized);
    });
    
    if (insights.length < 5 && !isDuplicate && normalized.length > 15) {
      insights.push(s);
    }
  });
  
  const titleClean = cleanHTML(article.title.split(' - ')[0]);
  
  // Add dynamic, highly descriptive metadata-backed insights if not enough unique sentences were found
  if (insights.length < 5) {
    insights.push(`Key report details updates concerning: "${titleClean}".`);
  }
  if (insights.length < 5) {
    insights.push(`Coverage and publication courtesy of ${article.source || 'editorial networks'}.`);
  }
  if (insights.length < 5 && article.author) {
    insights.push(`Reporting compiled under the authorship of ${article.author}.`);
  }
  if (insights.length < 5) {
    const formattedDate = new Date(article.publishedAt || Date.now()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    insights.push(`Official reporting released and cataloged on ${formattedDate}.`);
  }
  if (insights.length < 5) {
    insights.push(`Review the primary source details on original publisher website.`);
  }
  
  return insights.slice(0, 5);
};

// Fallback logic to generate a 4-step chronological timeline of story events leading up to this article
const generateFallbackTimeline = (article) => {
  const dateObj = new Date(article.publishedAt || Date.now());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const currentMonthIdx = dateObj.getMonth();
  
  // Preceding months leading up to the current article publication month
  const m1 = months[(currentMonthIdx - 3 + 12) % 12];
  const m2 = months[(currentMonthIdx - 2 + 12) % 12];
  const m3 = months[(currentMonthIdx - 1 + 12) % 12];
  
  const titleClean = article.title.split(' - ')[0].replace(/<[^>]*>/g, '').trim();
  
  return [
    { date: m1, event: `Initial background developments on ${article.source || 'topic'}` },
    { date: m2, event: `Related public discussion and observations` },
    { date: m3, event: `Key stakeholder announcements and reactions` },
    { date: 'Today', event: `New updates published: ${titleClean.substring(0, 32)}...` }
  ];
};

// Batch request to Gemini to generate 5 insights, 4 timeline events, and sentiment classification for each article
const generateInsights = async (articles) => {
  if (!articles || articles.length === 0) return [];
  
  // Filter which articles need generating (not in cache)
  const missingArticles = [];
  
  articles.forEach(article => {
    if (!insightsCache.has(article.url)) {
      missingArticles.push(article);
    }
  });
  
  if (missingArticles.length > 0) {
    try {
      const prompt = `For each of the following news articles, provide:
1. Exactly 5 short, key insight bullet points (max 12 words per bullet point).
2. A chronological timeline of exactly 4 key steps/events leading up to this news article (each step should have a 'date' like a month name 'March' or 'Today' and a short 'event' summary of max 8 words).
3. A general sentiment classification: classify the article sentiment as exactly "positive", "neutral", or "negative" based on reading comprehension of the topic context.

Return a JSON object where the keys are the article indices (as strings, e.g., "0", "1") and the values are objects with "insights" (array of strings), "timeline" (array of objects with "date" and "event" keys), and "sentiment" (string, one of "positive", "neutral", "negative").

Articles:
${missingArticles.map((a, i) => `${i}. Title: ${a.title}\nDescription: ${a.description}`).join('\n\n')}

Return ONLY the raw JSON object, no markdown.`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );
      
      const text = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error('Failed to parse JSON response');
      const resultMap = JSON.parse(jsonMatch[0]);
      
      missingArticles.forEach((article, i) => {
        const entry = resultMap[String(i)] || {};
        const insights = entry.insights || generateFallbackInsights(article);
        const timeline = entry.timeline || generateFallbackTimeline(article);
        const sentiment = entry.sentiment || calculateFallbackSentiment(article);
        insightsCache.set(article.url, { insights, timeline, sentiment });
      });
    } catch (error) {
      console.error('Error generating insights and timelines in batch:', error.message);
      // Fallback for missing articles on error
      missingArticles.forEach(article => {
        insightsCache.set(article.url, {
          insights: generateFallbackInsights(article),
          timeline: generateFallbackTimeline(article),
          sentiment: calculateFallbackSentiment(article)
        });
      });
    }
  }
  
  // Return articles populated with cached insights, timelines, and sentiment
  return articles.map(article => {
    const cached = insightsCache.get(article.url) || {
      insights: generateFallbackInsights(article),
      timeline: generateFallbackTimeline(article),
      sentiment: calculateFallbackSentiment(article)
    };
    return {
      id: article.id || article.url,
      ...article,
      insights: cached.insights,
      timeline: cached.timeline,
      sentiment: cached.sentiment
    };
  });
};

// Helper to fetch multiple pages sequentially from GNews
const fetchGNewsPages = async (endpoint, params, maxPages = 4) => {
  const articles = [];
  let totalArticles = 0;
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await axios.get(`${GNEWS_API_BASE}/${endpoint}`, {
        params: { ...params, max: 10, page }
      });
      
      const pageArticles = response.data.articles || [];
      articles.push(...pageArticles);
      totalArticles = response.data.totalArticles || articles.length;
      
      // If we got fewer than 10 articles, we reached the end of the available news
      if (pageArticles.length < 10) {
        break;
      }
      
      // Delay before the next page request to respect GNews free-tier rate limit (1 req/sec)
      if (page < maxPages) {
        await sleep(1100);
      }
    } catch (error) {
      console.error(`Error fetching page ${page} from GNews:`, error.message);
      // If page 1 fails, propagate error. If subsequent pages fail, return what we have so far.
      if (page === 1) {
        throw error;
      }
      break;
    }
  }
  
  return {
    articles,
    totalArticles
  };
};

// Fetch latest news from all categories
export const fetchNews = async (page = 1, limit = 50) => {
  try {
    const cacheKey = `all_news_page_${page}_limit_${limit}`;
    const cached = getCachedArticles(cacheKey);
    if (cached) {
      return {
        articles: cached,
        totalResults: cached.length
      };
    }

    // Fetch up to 6 pages (up to 60 articles) and slice to 51
    const { articles, totalArticles } = await fetchGNewsPages('top-headlines', {
      token: GNEWS_API_KEY,
      country: 'in',
      lang: 'en'
    }, 6);
    
    const mapped = articles.slice(0, 51).map(article => ({
      id: article.url,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: article.source.name,
      author: null,
      category: 'general'
    }));
    
    if (mapped.length === 0) {
      throw new Error('GNews returned empty results');
    }
    
    const articlesWithInsights = await generateInsights(mapped);
    setCachedArticles(cacheKey, articlesWithInsights);
    
    return {
      articles: articlesWithInsights,
      totalResults: Math.min(totalArticles, 51)
    };
  } catch (error) {
    console.warn('GNews API fetchNews failed, returning mock news fallback:', error.message);
    const mockFeed = [];
    Object.keys(MOCK_ARTICLES).forEach(cat => {
      mockFeed.push(...MOCK_ARTICLES[cat]);
    });
    
    const sorted = mockFeed
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
      
    const articlesWithInsights = await generateInsights(sorted);
    return {
      articles: articlesWithInsights,
      totalResults: articlesWithInsights.length
    };
  }
};

// Search news
export const searchNews = async (query, page = 1, limit = 20) => {
  try {
    const cacheKey = `search_${query}_page_${page}_limit_${limit}`;
    const cached = getCachedArticles(cacheKey);
    if (cached) {
      return {
        articles: cached,
        totalResults: cached.length
      };
    }

    // Fetch up to 4 pages (up to 40 articles) and slice to 36
    const { articles, totalArticles } = await fetchGNewsPages('search', {
      token: GNEWS_API_KEY,
      q: query,
      country: 'in',
      lang: 'en'
    }, 4);
    
    const mapped = articles.slice(0, 36).map(article => ({
      id: article.url,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: article.source.name,
      author: null
    }));
    
    if (mapped.length === 0) {
      throw new Error('No articles found matching search query');
    }
    
    const articlesWithInsights = await generateInsights(mapped);
    setCachedArticles(cacheKey, articlesWithInsights);
    
    return {
      articles: articlesWithInsights,
      totalResults: Math.min(totalArticles, 36)
    };
  } catch (error) {
    console.warn(`GNews API search failed, returning mock search fallback:`, error.message);
    const mockFeed = [];
    Object.keys(MOCK_ARTICLES).forEach(cat => {
      mockFeed.push(...MOCK_ARTICLES[cat]);
    });
    const matched = mockFeed.filter(a => 
      a.title.toLowerCase().includes(query.toLowerCase()) || 
      a.description.toLowerCase().includes(query.toLowerCase())
    );
    
    const finalMatches = matched.length > 0 ? matched : mockFeed.slice(0, 5);
    const articlesWithInsights = await generateInsights(finalMatches);
    return {
      articles: articlesWithInsights,
      totalResults: articlesWithInsights.length
    };
  }
};

// Get news by category
export const getNewsByCategory = async (category, page = 1, limit = 50) => {
  try {
    const cacheKey = `category_${category}_page_${page}_limit_${limit}`;
    const cached = getCachedArticles(cacheKey);
    if (cached) {
      return {
        articles: cached,
        totalResults: cached.length
      };
    }

    // Fetch up to 4 pages (up to 40 articles) and slice to 36
    const { articles, totalArticles } = await fetchGNewsPages('top-headlines', {
      token: GNEWS_API_KEY,
      category: category,
      country: 'in',
      lang: 'en'
    }, 4);
    
    const mapped = articles.slice(0, 36).map(article => ({
      id: article.url,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: article.source.name,
      author: null,
      category: category
    }));
    
    if (mapped.length === 0) {
      throw new Error('Category returned empty results');
    }
    
    const articlesWithInsights = await generateInsights(mapped);
    setCachedArticles(cacheKey, articlesWithInsights);
    
    return {
      articles: articlesWithInsights,
      totalResults: Math.min(totalArticles, 36)
    };
  } catch (error) {
    console.warn(`GNews API category ${category} failed, returning mock category fallback:`, error.message);
    const mockCat = MOCK_ARTICLES[category] || MOCK_ARTICLES['technology'];
    const articlesWithInsights = await generateInsights(mockCat);
    return {
      articles: articlesWithInsights,
      totalResults: articlesWithInsights.length
    };
  }
};

// Local context-aware rule-based chat engine when Gemini API key quota is exhausted
const generateFallbackChatResponse = (article, message) => {
  const msg = message.toLowerCase().trim();
  
  if (msg.includes('simple') || msg.includes('simplify') || msg.includes('explain')) {
    return `Based on the article context, here is a simplified summary: the news discusses "${article.title}". The key point is: "${article.description || 'a major development'}". This highlights ongoing changes involving stakeholders of ${article.source || 'this topic'}.`;
  }
  if (msg.includes('before') || msg.includes('happened') || msg.includes('context') || msg.includes('history')) {
    return `Prior to this, ${article.source || 'reporters'} documented the background context surrounding this issue. The situation evolved around: "${article.description || 'relevant ongoing events'}". These developments have directly culminated in the current state where ${article.title}.`;
  }
  if (msg.includes('benefit') || msg.includes('gain') || msg.includes('win')) {
    return `Based on the article content, the primary beneficiaries appear to be parties aligned with: "${article.title}". Those representing or associated with ${article.author || article.source || 'the main entities'} stand to gain momentum or positive outcomes.`;
  }
  if (msg.includes('lose') || msg.includes('hurt') || msg.includes('bad for')) {
    return `Conversely, stakeholders, competing interests, or entities negatively impacted by: "${article.description || article.title}" appear to bear the costs or face challenges as a result of these developments.`;
  }
  if (msg.includes('good or bad') || msg.includes('positive or negative') || msg.includes('assessment')) {
    return `This development has mixed implications. It is positive for supporters of: "${article.title}" due to the progress made. However, it presents concerns or negative impacts for those affected by: "${article.description || 'the challenges mentioned'}".`;
  }
  if (msg.includes('compare') || msg.includes('last year') || msg.includes('past')) {
    return `Comparing this to previous occurrences, the scale and impact of: "${article.title}" shows updated progress. While past events laid the foundation, the current situation represents a new phase of activity reported by ${article.source}.`;
  }
  
  return `Based on the article details: ${article.description || article.title}. (Note: The AI Co-Pilot is currently running in local fallback mode to prevent service interruptions.)`;
};

// Ask Gemini about a specific article's context
export const askGeminiAboutArticle = async (article, message) => {
  try {
    const prompt = `You are a helpful and intelligent news reading assistant. You are helping a user understand a news article.
    
Article Title: ${article.title}
Source: ${article.source}
Author: ${article.author || 'Unknown'}
Description: ${article.description || ''}
Content: ${article.content || ''}

The user asks: "${message}"

Please answer the user's question concisely, clearly, and directly based on the article's details and any necessary context. Limit your answer to 150 words. Use simple formatting (like bold text or bullet points) if helpful to make it highly readable.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    return reply;
  } catch (error) {
    console.warn('Gemini chat API failed, returning fallback response:', error.message);
    return generateFallbackChatResponse(article, message);
  }
};
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_API_BASE = 'https://gnews.io/api/v4';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
const generateFallbackInsights = (article, fullContent = '') => {
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
  const cleanFull = cleanHTML(fullContent);

  // If fullContent is provided and of meaningful length, prioritize it to utilize the entire article
  const textToSummarize = cleanFull.length > 200 ? cleanFull : `${cleanDesc}. ${cleanCont}`;
  
  // Split using lookbehind to retain sentence-ending punctuation (.!?)
  const parts = textToSummarize.split(/(?<=[.!?])/);
  // Remove the last chunk if the source text was truncated (didn't end with sentence-ending punctuation)
  const trimmedText = textToSummarize.trim();
  const endsWithPunctuation = /[.!?]['"]?$/.test(trimmedText);
  if (!endsWithPunctuation && parts.length > 0) {
    parts.pop();
  }

  const rawSentences = parts
    .map(s => {
      let cleaned = s.trim();
      // Remove any leading non-alphabetic/numeric characters (like commas, dashes, quotes)
      cleaned = cleaned.replace(/^[^a-zA-Z0-9'"]+/, '').trim();
      return cleaned;
    })
    // Filter out sentences that are too short, too long, or contain boilerplate noise
    .filter(s => {
      if (s.length <= 40 || s.length >= 150) return false;
      const lower = s.toLowerCase();
      
      // Filter out questions
      if (s.endsWith('?') || lower.includes('?')) return false;

      // Filter out first person references to keep insights objective
      if (
        lower.startsWith('i ') || 
        lower.startsWith('we ') || 
        lower.startsWith('my ') || 
        lower.startsWith('our ') ||
        /\b(i|we|my|our|us|me)\b/.test(lower)
      ) return false;

      // Filter out boilerplate, social media, cookie, author credits, and metadata lines
      if (
        lower.includes('cookie') || 
        lower.includes('subscribe') || 
        lower.includes('sign in') || 
        lower.includes('log in') || 
        lower.includes('privacy policy') || 
        lower.includes('all rights reserved') ||
        lower.includes('terms of service') ||
        lower.includes('share this') ||
        lower.includes('follow us') ||
        lower.includes('journalists') ||
        lower.includes('our dedicated team') ||
        lower.includes('browsing experience') ||
        lower.includes('feedback') ||
        lower.includes('newsletter') ||
        lower.includes('published') ||
        lower.includes('written by') ||
        lower.includes('translated by') ||
        lower.includes('photo by') ||
        lower.includes('copyright') ||
        lower.includes('click here') ||
        lower.includes('read more') ||
        lower.includes('&#x') || // HTML entities
        lower.includes('&amp;') ||
        lower.includes(';')
      ) return false;
      
      return true;
    });
  
  // Score the remaining sentences to find the most informative factual key insights
  const scoredSentences = rawSentences.map(s => {
    let score = 0;
    // Length sweet spot (60 - 120 chars)
    if (s.length >= 60 && s.length <= 120) score += 5;
    
    // Contains numbers (statistics, dates, data points)
    if (/\d+/.test(s)) score += 8;
    
    // Contains uppercase proper nouns (entities, locations, names)
    const upperWords = s.split(' ').filter(w => w[0] && w[0] === w[0].toUpperCase() && !/^[A-Z\d\W]+$/.test(w));
    score += upperWords.length * 2;
    
    return { sentence: s, score };
  });

  // Sort by score descending to get best sentences first
  scoredSentences.sort((a, b) => b.score - a.score);

  // Deduplicate and select top 5
  scoredSentences.forEach(item => {
    const s = item.sentence;
    const normalized = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isDuplicate = insights.some(existing => {
      const existingNormalized = existing.toLowerCase().replace(/[^a-z0-9]/g, '');
      return existingNormalized.includes(normalized) || normalized.includes(existingNormalized);
    });
    
    if (insights.length < 5 && !isDuplicate) {
      // Ensure the sentence ends with a period if it doesn't end with punctuation
      const formatted = /[.!?]$/.test(s) ? s : `${s}.`;
      insights.push(formatted);
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
    let prompt = '';
    try {
      prompt = `For each of the following news articles, provide:
1. Exactly 5 high-quality key insight bullet points (each bullet point must be a complete, informative sentence of 12 to 20 words).
2. A chronological timeline of exactly 4 key steps/events leading up to this news article (each step should have a 'date' like a month name 'March' or 'Today' and a short 'event' summary of max 12 words).
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
        },
        { timeout: 15000 }
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
    } catch (geminiError) {
      console.warn('Gemini batch API failed, trying Groq:', geminiError.message);
      let success = false;
      if (GROQ_API_KEY) {
        try {
          const response = await axios.post(
            GROQ_API_URL,
            {
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1,
              response_format: { type: 'json_object' }
            },
            {
              headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 15000
            }
          );
          const text = response.data.choices[0].message.content;
          const jsonMatch = text.match(/\{.*\}/s);
          if (jsonMatch) {
            const resultMap = JSON.parse(jsonMatch[0]);
            missingArticles.forEach((article, i) => {
              const entry = resultMap[String(i)] || {};
              const insights = entry.insights || generateFallbackInsights(article);
              const timeline = entry.timeline || generateFallbackTimeline(article);
              const sentiment = entry.sentiment || calculateFallbackSentiment(article);
              insightsCache.set(article.url, { insights, timeline, sentiment });
            });
            success = true;
          }
        } catch (groqError) {
          console.error('Groq batch fallback failed too:', groqError.message);
        }
      }
      
      if (!success) {
        // Fallback for missing articles on total error
        missingArticles.forEach(article => {
          insightsCache.set(article.url, {
            insights: generateFallbackInsights(article),
            timeline: generateFallbackTimeline(article),
            sentiment: calculateFallbackSentiment(article)
          });
        });
      }
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
        params: { ...params, max: 10, page },
        timeout: 5000
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

// Helper to fetch multiple pages sequentially from NewsAPI
const fetchNewsAPIPages = async (endpoint, params, maxPages = 4) => {
  const articles = [];
  let totalArticles = 0;
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await axios.get(`${NEWS_API_BASE}/${endpoint}`, {
        params: { ...params, apiKey: NEWS_API_KEY, pageSize: 10, page },
        timeout: 5000
      });
      
      const pageArticles = response.data.articles || [];
      articles.push(...pageArticles);
      totalArticles = response.data.totalResults || articles.length;
      
      if (pageArticles.length < 10) {
        break;
      }
      
      if (page < maxPages) {
        await sleep(500);
      }
    } catch (error) {
      console.error(`Error fetching page ${page} from NewsAPI:`, error.message);
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

// Fallback logic when GNews API fails
const fallbackToNewsAPI = async (type, categoryOrQuery = null, page = 1, limit = 50) => {
  if (!NEWS_API_KEY) {
    throw new Error('NewsAPI key is missing in environment variables');
  }

  console.log(`[Fallback] GNews failed. Trying NewsAPI for type: ${type}...`);
  let endpoint = 'top-headlines';
  const params = {
    country: 'us'
  };

  if (type === 'search') {
    endpoint = 'everything';
    params.q = categoryOrQuery;
    delete params.country;
  } else if (type === 'category') {
    params.category = categoryOrQuery;
  }

  const maxPages = type === 'search' ? 4 : 6;
  const { articles, totalArticles } = await fetchNewsAPIPages(endpoint, params, maxPages);

  const mapped = articles.map(article => ({
    id: article.url,
    title: article.title,
    description: article.description || '',
    content: article.content || '',
    url: article.url,
    urlToImage: article.urlToImage || '',
    publishedAt: article.publishedAt,
    source: article.source?.name || 'News Source',
    author: article.author || null,
    category: type === 'category' ? categoryOrQuery : 'general'
  }));

  return {
    mapped,
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

    let mapped = [];
    let totalResults = 0;

    try {
      // Fetch up to 6 pages (up to 60 articles) and slice to 51 from GNews
      const { articles, totalArticles } = await fetchGNewsPages('top-headlines', {
        token: GNEWS_API_KEY,
        country: 'in',
        lang: 'en'
      }, 6);
      
      mapped = articles.slice(0, 51).map(article => ({
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
      totalResults = Math.min(totalArticles, 51);
      
      if (mapped.length === 0) {
        throw new Error('GNews returned empty results');
      }
    } catch (gnewsError) {
      console.warn('GNews API fetchNews failed, falling back to NewsAPI:', gnewsError.message);
      try {
        const fallbackResult = await fallbackToNewsAPI('feed', null, page, limit);
        mapped = fallbackResult.mapped.slice(0, 51);
        totalResults = Math.min(fallbackResult.totalArticles, 51);
        if (mapped.length === 0) {
          throw new Error('NewsAPI returned empty results');
        }
      } catch (fallbackError) {
        console.warn('NewsAPI fallback failed, using mock news:', fallbackError.message);
        const mockFeed = [];
        Object.keys(MOCK_ARTICLES).forEach(cat => {
          mockFeed.push(...MOCK_ARTICLES[cat]);
        });
        
        mapped = mockFeed
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, limit);
        totalResults = mapped.length;
      }
    }
    
    const articlesWithInsights = await generateInsights(mapped);
    setCachedArticles(cacheKey, articlesWithInsights);
    
    return {
      articles: articlesWithInsights,
      totalResults
    };
  } catch (error) {
    console.error('Fatal error in fetchNews:', error.message);
    return { articles: [], totalResults: 0 };
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

    let mapped = [];
    let totalResults = 0;

    try {
      // Fetch up to 4 pages (up to 40 articles) and slice to 36 from GNews
      const { articles, totalArticles } = await fetchGNewsPages('search', {
        token: GNEWS_API_KEY,
        q: query,
        country: 'in',
        lang: 'en'
      }, 4);
      
      mapped = articles.slice(0, 36).map(article => ({
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
      totalResults = Math.min(totalArticles, 36);
      
      if (mapped.length === 0) {
        throw new Error('No articles found matching search query');
      }
    } catch (gnewsError) {
      console.warn(`GNews API search failed, falling back to NewsAPI:`, gnewsError.message);
      try {
        const fallbackResult = await fallbackToNewsAPI('search', query, page, limit);
        mapped = fallbackResult.mapped.slice(0, 36);
        totalResults = Math.min(fallbackResult.totalArticles, 36);
        if (mapped.length === 0) {
          throw new Error('NewsAPI search returned empty results');
        }
      } catch (fallbackError) {
        console.warn('NewsAPI search fallback failed, using mock search:', fallbackError.message);
        const mockFeed = [];
        Object.keys(MOCK_ARTICLES).forEach(cat => {
          mockFeed.push(...MOCK_ARTICLES[cat]);
        });
        const matched = mockFeed.filter(a => 
          a.title.toLowerCase().includes(query.toLowerCase()) || 
          a.description.toLowerCase().includes(query.toLowerCase())
        );
        
        mapped = matched.length > 0 ? matched : mockFeed.slice(0, 5);
        totalResults = mapped.length;
      }
    }
    
    const articlesWithInsights = await generateInsights(mapped);
    setCachedArticles(cacheKey, articlesWithInsights);
    
    return {
      articles: articlesWithInsights,
      totalResults
    };
  } catch (error) {
    console.error('Fatal error in searchNews:', error.message);
    return { articles: [], totalResults: 0 };
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

    let mapped = [];
    let totalResults = 0;

    try {
      // Fetch up to 4 pages (up to 40 articles) and slice to 36 from GNews
      const { articles, totalArticles } = await fetchGNewsPages('top-headlines', {
        token: GNEWS_API_KEY,
        category: category,
        country: 'in',
        lang: 'en'
      }, 4);
      
      mapped = articles.slice(0, 36).map(article => ({
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
      totalResults = Math.min(totalArticles, 36);
      
      if (mapped.length === 0) {
        throw new Error('Category returned empty results');
      }
    } catch (gnewsError) {
      console.warn(`GNews API category ${category} failed, falling back to NewsAPI:`, gnewsError.message);
      try {
        const fallbackResult = await fallbackToNewsAPI('category', category, page, limit);
        mapped = fallbackResult.mapped.slice(0, 36);
        totalResults = Math.min(fallbackResult.totalArticles, 36);
        if (mapped.length === 0) {
          throw new Error('NewsAPI category returned empty results');
        }
      } catch (fallbackError) {
        console.warn('NewsAPI category fallback failed, using mock category:', fallbackError.message);
        const mockCat = MOCK_ARTICLES[category] || MOCK_ARTICLES['technology'];
        mapped = mockCat;
        totalResults = mapped.length;
      }
    }
    
    const articlesWithInsights = await generateInsights(mapped);
    setCachedArticles(cacheKey, articlesWithInsights);
    
    return {
      articles: articlesWithInsights,
      totalResults
    };
  } catch (error) {
    console.error('Fatal error in getNewsByCategory:', error.message);
    return { articles: [], totalResults: 0 };
  }
};

// Local context-aware rule-based chat engine when Gemini API key quota is exhausted
const generateFallbackChatResponse = (article, message, fullContent = '') => {
  const msg = message.toLowerCase().trim();
  
  // Clean HTML
  const cleanHTML = (text) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\[\+\d+ chars\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const titleClean = cleanHTML(article.title.split(' - ')[0]);
  const descClean = cleanHTML(article.description);
  const contentClean = cleanHTML(article.content);
  
  // Prioritize full content if available and longer than description
  const cleanFull = cleanHTML(fullContent);
  const textToAnalyze = cleanFull.length > 200 ? cleanFull : `${descClean}. ${contentClean}`;

  // Split text into sentences and clean them
  const sentences = textToAnalyze
    .split(/[.!?]+/)
    .map(s => {
      let cleaned = s.trim();
      // Remove any leading non-alphabetic/numeric characters (like commas, dashes, quotes)
      cleaned = cleaned.replace(/^[^a-zA-Z0-9'"]+/, '').trim();
      return cleaned;
    })
    .filter(s => s.length > 25 && s.length < 200);

  // Helper to find sentences matching keywords
  const findMatchingSentences = (keywords, limit = 2) => {
    const matches = [];
    sentences.forEach(s => {
      const lowerS = s.toLowerCase();
      let matchCount = 0;
      keywords.forEach(kw => {
        if (lowerS.includes(kw)) matchCount++;
      });
      if (matchCount > 0) {
        matches.push({ sentence: s, count: matchCount });
      }
    });
    // Sort matches by number of matching keywords descending
    matches.sort((a, b) => b.count - a.count);
    return matches.slice(0, limit).map(m => m.sentence);
  };

  // Helper to construct fallback complete paragraph
  const getCleanSummary = () => {
    if (descClean && descClean.length > 30) {
      return descClean.endsWith('.') ? descClean : `${descClean}.`;
    }
    return `Updates surrounding "${titleClean}".`;
  };

  // 1. Simplify / Explain
  if (msg.includes('simple') || msg.includes('simplify') || msg.includes('explain')) {
    const matches = findMatchingSentences(['announce', 'decide', 'report', 'reveal', 'key', 'main', 'first', 'primary', 'official', 'statement', 'disclose'], 2);
    if (matches.length > 0) {
      return `Here is a simplified explanation based on the article details:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Summary compiled by AI Assistant)`;
    }
    return `In simple terms: the news details "${titleClean}". The main report indicates: "${getCleanSummary()}"`;
  }

  // 2. Before / Happened / Context / History
  if (msg.includes('before') || msg.includes('happened') || msg.includes('context') || msg.includes('history')) {
    const matches = findMatchingSentences(['previously', 'earlier', 'before', 'history', 'past', 'background', 'preceding', 'already', 'initial', 'last year', 'decade'], 2);
    if (matches.length > 0) {
      return `Based on the historical context mentioned in the article:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Context compiled by AI Assistant)`;
    }
    return `Prior to this, ${article.source || 'reporters'} documented background context surrounding this issue. The situation previously evolved around: "${getCleanSummary()}"`;
  }

  // 3. Benefit / Gain / Win
  if (msg.includes('benefit') || msg.includes('gain') || msg.includes('win')) {
    const matches = findMatchingSentences(['benefit', 'gain', 'advantage', 'win', 'profit', 'receive', 'positive', 'helpful', 'improve', 'growth', 'opportunity'], 2);
    if (matches.length > 0) {
      return `Based on the article body, the key beneficiaries or positive impacts identified are:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Analysis compiled by AI Assistant)`;
    }
    return `Based on the article details, the primary beneficiaries appear to be parties aligned with the developments in: "${titleClean}". Stakeholders associated with ${article.source || 'the main entities'} stand to gain momentum or positive outcomes.`;
  }

  // 4. Lose / Hurt / Bad for / Challenges
  if (msg.includes('lose') || msg.includes('hurt') || msg.includes('bad for') || msg.includes('challenge')) {
    const matches = findMatchingSentences(['loss', 'hurt', 'damage', 'fail', 'lose', 'decline', 'drop', 'impacted', 'negative', 'suffer', 'challenge', 'risk', 'fear', 'worry'], 2);
    if (matches.length > 0) {
      return `The article details the following concerns, challenges, or negative impacts:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Analysis compiled by AI Assistant)`;
    }
    return `Conversely, stakeholders, competing interests, or entities negatively impacted by these updates face challenges or costs as a result of the developments reported in "${titleClean}".`;
  }

  // 5. Good or bad / Positive or negative / Assessment
  if (msg.includes('good or bad') || msg.includes('positive or negative') || msg.includes('assessment') || msg.includes('opinion')) {
    const matches = findMatchingSentences(['good', 'bad', 'mixed', 'reaction', 'assess', 'evaluate', 'opinion', 'support', 'critic', 'praise', 'oppose'], 2);
    if (matches.length > 0) {
      return `Here is an assessment from the article details:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Assessment compiled by AI Assistant)`;
    }
    return `This development has mixed implications. It is positive for supporters of: "${titleClean}" due to the progress made. However, it presents challenges for those affected by: "${getCleanSummary()}"`;
  }

  // 6. Compare / Last year / Past / Comparison
  if (msg.includes('compare') || msg.includes('last year') || msg.includes('past') || msg.includes('comparison') || msg.includes('different')) {
    const matches = findMatchingSentences(['compare', 'than', 'contrast', 'similar', 'different', 'increase', 'decrease', 'change', 'previous', 'former'], 2);
    if (matches.length > 0) {
      return `Comparing this to context in the article:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Comparison compiled by AI Assistant)`;
    }
    return `Comparing this to previous occurrences, the scale and impact of: "${titleClean}" shows updated progress. While past events laid the foundation, the current situation represents a new phase of activity reported by ${article.source}.`;
  }
  
  // Custom user message (extractive fallback)
  // Try to match keywords from the user's custom question to find matching sentences in the article
  const questionWords = msg.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  if (questionWords.length > 0) {
    const matches = findMatchingSentences(questionWords, 3);
    if (matches.length > 0) {
      return `Here are relevant details found in the article text matching your question:\n\n${matches.map(s => `• ${s}.`).join('\n')}\n\n(Extracted by AI Assistant)`;
    }
  }

  return `Based on the article details: ${getCleanSummary()} (Note: The AI Co-Pilot is currently running in local fallback mode to prevent service interruptions.)`;
};

// Helper to fetch the full text content of an article from its URL
export const fetchFullArticleText = async (url, article = null) => {
  if (!url || url.includes('example.com')) return null;
  try {
    const response = await axios.get(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const html = response.data;
    if (!html || typeof html !== 'string') return null;
    
    // Extract paragraph tags text to avoid headers, navigations, sidebars, and footers
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let paragraphs = [];
    let match;
    while ((match = pRegex.exec(html)) !== null) {
      const pText = match[1]
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (pText.length > 20) {
        paragraphs.push(pText);
      }
    }
    
    let text = paragraphs.join(' ');
    
    // If <p> tags yielded very little content (less than 200 chars), fall back to general HTML text cleaning
    if (text.length < 200) {
      text = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<head[^>]*>([\s\S]*?)<\/head>/gi, '')
        .replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, '')
        .replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, '')
        .replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, '')
        .replace(/<aside[^>]*>([\s\S]*?)<\/aside>/gi, '')
        .replace(/<noscript[^>]*>([\s\S]*?)<\/noscript>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Check if the scraped text is likely just a paywall, subscription wall, or login page
    const paywallKeywords = ['subscribe', 'subscription', 'logged in', 'login', 'sign in', 'cookie policy', 'paywall', 'create an account', 'member benefits'];
    let paywallMatches = 0;
    const lowerText = text.toLowerCase();
    paywallKeywords.forEach(word => {
      if (lowerText.includes(word)) paywallMatches++;
    });

    if (text.length < 300 || paywallMatches >= 3) {
      return null; // Reject paywalls and very short/junk pages
    }
    
    // If article metadata is passed, ensure the text contains at least one keyword from the title
    if (article && article.title) {
      const stopWords = new Set(['the', 'and', 'for', 'with', 'amid', 'will', 'till', 'this', 'that', 'from', 'have', 'more', 'about', 'after', 'under', 'their', 'there']);
      const titleWords = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));
      
      const hasTitleKeywords = titleWords.length === 0 || titleWords.some(word => lowerText.includes(word));
      if (!hasTitleKeywords) {
        return null; // Reject text that is completely unrelated to the article title
      }
    }
    
    // Limit to first 4500 characters to keep prompt size reasonable
    return text.substring(0, 4500);
  } catch (error) {
    console.warn(`Failed to fetch full article text from ${url}:`, error.message);
    return null;
  }
};

// Ask Gemini about a specific article's context
export const askGeminiAboutArticle = async (article, message) => {
  let fullContent = article.content || '';
  let prompt = '';
  try {
    if (article.url) {
      const fetchedText = await fetchFullArticleText(article.url, article);
      if (fetchedText) {
        fullContent = fetchedText;
      }
    }

    prompt = `You are a helpful and intelligent news reading assistant. You are helping a user understand a news article.
    
Article Title: ${article.title}
Source: ${article.source}
Author: ${article.author || 'Unknown'}
Description: ${article.description || ''}
URL: ${article.url || ''}
Full Article Text Content:
${fullContent}

The user asks: "${message}"

Please answer the user's question concisely, clearly, and directly based on the full article details provided above. Limit your answer to 150 words. Use simple formatting (like bold text or bullet points) if helpful to make it highly readable.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      { timeout: 15000 }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    return reply;
  } catch (error) {
    console.warn('Gemini chat API failed, trying Groq:', error.message);
    if (GROQ_API_KEY) {
      try {
        const response = await axios.post(
          GROQ_API_URL,
          {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        const reply = response.data.choices[0].message.content;
        return reply;
      } catch (groqError) {
        console.error('Groq chat fallback failed too, returning local fallback:', groqError.message);
      }
    }
    return generateFallbackChatResponse(article, message, fullContent);
  }
};

// Generate exactly 5 insights from the full text content of an article
export const generateSingleArticleInsights = async (article, fullContent) => {
  let prompt = '';
  try {
    prompt = `You are an expert news analyst. Analyze the full article text provided below and generate exactly 5 distinct, high-quality key insights. Do not base the insights solely on the title or description; you must extract valuable facts, events, key figures, or contexts described in the body of the article.
    
Each insight must be a complete, grammatically correct, detailed sentence of 12 to 20 words. Do not return short phrases, incomplete sentences, or truncated lines under any circumstances. Ensure every insight is a fully formed, self-contained statement.

Article Title: ${article.title}
Source: ${article.source}
Full Article Text:
${fullContent}

Return a JSON array containing exactly 5 string elements (e.g., ["Insight 1", "Insight 2", "Insight 3", "Insight 4", "Insight 5"]). Return ONLY the raw JSON array, no markdown.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      { timeout: 15000 }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('Failed to parse JSON response');
    const array = JSON.parse(jsonMatch[0]);
    if (Array.isArray(array) && array.length > 0) {
      return array.slice(0, 5);
    }
    throw new Error('Response is not a valid array');
  } catch (error) {
    console.warn('Gemini insights API failed, trying Groq:', error.message);
    if (GROQ_API_KEY) {
      try {
        const response = await axios.post(
          GROQ_API_URL,
          {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        const text = response.data.choices[0].message.content;
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
          const array = JSON.parse(jsonMatch[0]);
          if (Array.isArray(array) && array.length > 0) {
            return array.slice(0, 5);
          }
        }
      } catch (groqError) {
        console.error('Groq insights fallback failed too, returning local fallback:', groqError.message);
      }
    }
    return generateFallbackInsights(article, fullContent);
  }
};
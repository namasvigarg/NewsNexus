import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Calculate similarity between user interests and article
const calculateRelevanceScore = (article, userPreferences) => {
  let score = 0;
  const articleText = `${article.title} ${article.description}`.toLowerCase();
  
  // Check for category match
  if (userPreferences.categories && userPreferences.categories.length > 0) {
    if (article.category && userPreferences.categories.includes(article.category)) {
      score += 3;
    }
  }
  
  // Check for keyword matches
  if (userPreferences.interests && userPreferences.interests.length > 0) {
    userPreferences.interests.forEach(interest => {
      if (articleText.includes(interest.toLowerCase())) {
        score += 2;
      }
    });
  }
  
  // Check for source preference
  if (userPreferences.sources && userPreferences.sources.length > 0) {
    if (userPreferences.sources.includes(article.source)) {
      score += 1;
    }
  }
  
  return score;
};

// Get personalized recommendations
export const getRecommendations = async (articles, userPreferences) => {
  try {
    // Score all articles
    const scoredArticles = articles.map(article => ({
      ...article,
      relevanceScore: calculateRelevanceScore(article, userPreferences)
    }));
    
    // Sort by relevance score and recency
    const recommendations = scoredArticles.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    throw new Error('Failed to generate recommendations');
  }
};

// Use AI to generate semantic recommendations
export const getAIRecommendations = async (articles, userQuery) => {
  try {
    const prompt = `Given these news articles and user interest "${userQuery}", rank them by relevance and return the top 10 most relevant article indices (0-based).
    
Articles:
${articles.map((a, i) => `${i}. ${a.title} - ${a.description}`).join('\n')}

Return only a JSON array of indices, e.g., [2, 5, 0, 8, 1, 3, 7, 4, 9, 6]`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    );
    
    const text = response.data.candidates[0].content.parts[0].text;
    const indices = JSON.parse(text.match(/\[[\d,\s]+\]/)[0]);
    
    return indices.map(i => articles[i]).filter(Boolean);
  } catch (error) {
    console.error('Error getting AI recommendations:', error.message);
    // Fallback to basic scoring
    return articles.slice(0, 10);
  }
};

// Extract topics from articles using NLP
export const extractTopics = async (articles) => {
  try {
    const texts = articles.map(a => `${a.title}. ${a.description}`).join(' ');
    
    const prompt = `Extract the top 10 main topics/themes from these news articles. Return only a JSON array of topic strings.
    
Articles: ${texts.substring(0, 2000)}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    );
    
    const text = response.data.candidates[0].content.parts[0].text;
    const topics = JSON.parse(text.match(/\[.*\]/s)[0]);
    
    return topics;
  } catch (error) {
    console.error('Error extracting topics:', error.message);
    return [];
  }
};
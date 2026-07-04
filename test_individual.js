import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('GNEWS_API_KEY:', GNEWS_API_KEY ? 'Present' : 'Missing');
console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? 'Present' : 'Missing');

async function testGNews() {
  console.log('[GNews] Starting fetch...');
  const start = Date.now();
  try {
    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        token: GNEWS_API_KEY,
        country: 'in',
        lang: 'en',
        max: 10,
        page: 1
      },
      timeout: 5000 // 5 seconds timeout
    });
    console.log(`[GNews] Success in ${Date.now() - start}ms. Articles found:`, response.data.articles?.length);
    return response.data.articles || [];
  } catch (err) {
    console.log(`[GNews] Failed in ${Date.now() - start}ms:`, err.message);
    return [];
  }
}

async function testGemini(articles) {
  if (articles.length === 0) {
    console.log('[Gemini] No articles to process.');
    return;
  }
  console.log('[Gemini] Starting content generation for first article...');
  const start = Date.now();
  const prompt = `Provide 5 insights for this article: Title: ${articles[0].title}. Description: ${articles[0].description}. Return JSON.`;
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { timeout: 5000 }
    );
    console.log(`[Gemini] Success in ${Date.now() - start}ms. Response:`, response.data.candidates[0].content.parts[0].text.substring(0, 100));
  } catch (err) {
    console.log(`[Gemini] Failed in ${Date.now() - start}ms:`, err.message);
  }
}

async function run() {
  const articles = await testGNews();
  await testGemini(articles);
}

run();

import { fetchNews } from './server/services/newsService.js';

async function run() {
  try {
    console.log('Calling fetchNews...');
    const result = await fetchNews(1, 20);
    console.log('Result count:', result.articles.length);
    console.log('Is mock?', result.articles.some(a => a.url.includes('example.com')));
    console.log('First article title:', result.articles[0]?.title);
    console.log('First article URL:', result.articles[0]?.url);
  } catch (err) {
    console.error('Captured error in test:', err);
  }
}

run();

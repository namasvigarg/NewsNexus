export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: string;
  author: string;
  category?: string;
  relevanceScore?: number;
}

export interface UserPreferences {
  categories: string[];
  interests: string[];
  sources: string[];
  readArticles: string[];
}

export interface NewsState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  totalResults: number;
}

export interface RecommendationState {
  recommendations: Article[];
  loading: boolean;
  error: string | null;
}

export const CATEGORIES = [
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology'
] as const;

export type Category = typeof CATEGORIES[number];
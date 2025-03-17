import type { ArticleWithCategory } from './ArticleWithCategory';

export interface ArticlesResponse {
  articles: ArticleWithCategory[];
  page: number;
  pageSize: number;
  allArticlesCount: number;
  categoryId?: number;
}

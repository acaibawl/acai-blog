import type { Article, Category } from '@prisma/client';

export interface ArticleWithCategory extends Article {
  category?: Category | null;
}
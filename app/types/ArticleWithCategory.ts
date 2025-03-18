import type { Article } from '@prisma/client';

export interface ArticleWithCategory extends Article {
  category: {
    id: number;
    name: string;
  };
}

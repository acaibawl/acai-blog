import { PrismaClient } from '@prisma/client';
import type { ArticlesResponse } from '~/types/ArticlesResponse';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // クエリパラメータを取得
  const query = getQuery(event);
  const pageNumber = parseInt(query.page as string) || 1;
  const categoryId = query.category_id ? Number(query.category_id) : undefined;

  // 1ページあたりの記事件数
  const pageSize = 20;
  // スキップする件数 = (ページ番号 - 1) * 1ページあたりの件数
  const skip = (pageNumber - 1) * pageSize;

  // カテゴリーでフィルタリングするための条件
  const where = categoryId ? { category_id: categoryId } : {};

  try {
    // Prisma の findMany でページ指定して記事を取得
    const articles = await prisma.article.findMany({
      skip: skip,
      take: pageSize,
      where,
      orderBy: { created_at: 'desc' },
      include: {
        category: true, // カテゴリー情報も含める
      },
    });

    // 総記事数を取得（フィルター条件も適用）
    const allArticlesCount = await prisma.article.count({ where });

    return {
      articles,
      page: pageNumber,
      pageSize,
      allArticlesCount,
      categoryId,
    } as ArticlesResponse;
  } catch (error) {
    console.error(error);
    return { error: '記事の取得に失敗しました。', details: error };
  }
});

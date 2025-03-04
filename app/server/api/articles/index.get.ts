import { PrismaClient } from '@prisma/client'
import type { ArticlesResponse } from '~/types/ArticlesResponse';

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // クエリパラメータを取得。page が指定されていなければ 1 とする
  const { page } = getQuery(event)
  const pageNumber = parseInt(page as string) || 1

  // 1ページあたりの記事件数
  const pageSize = 20
  // スキップする件数 = (ページ番号 - 1) * 1ページあたりの件数
  const skip = (pageNumber - 1) * pageSize

  try {
    // Prisma の findMany でページ指定して記事を取得
    const articles = await prisma.article.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { created_at: 'desc' }
    })
    
    return {
      articles,
      page: pageNumber,
      pageSize,
      allArticlesCount: await prisma.article.count()
    } as ArticlesResponse;
  } catch (error) {
    console.error(error);
    return { error: '記事の取得に失敗しました。', details: error }
  }
});

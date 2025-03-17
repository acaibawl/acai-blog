import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const includeCount = query.include_count === 'true';

  if (includeCount) {
    // カテゴリーと記事数を取得
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  } else {
    // カテゴリーのみ取得
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  }
});
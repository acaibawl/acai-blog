import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 認証チェック（既存の認証システムに合わせて実装）
  // この例では簡易的に実装
  if (!event.context.user?.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized',
    });
  }

  const id = Number(event.context.params?.id);
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category ID',
    });
  }

  // カテゴリーの存在確認
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  if (!existingCategory) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    });
  }

  // カテゴリーに紐づく記事があるか確認
  if (existingCategory._count.articles > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot delete category with associated articles',
    });
  }

  // カテゴリー削除
  await prisma.category.delete({
    where: { id },
  });

  return { success: true };
}); 
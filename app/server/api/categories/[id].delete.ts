import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '~/server/utils/auth';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 認証チェック
  await verifyAuth(event);

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
      statusMessage: 'カテゴリーが見つかりません',
    });
  }

  // カテゴリーに紐づく記事があるか確認
  if (existingCategory._count.articles > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'このカテゴリーに紐づく記事があるため削除できません',
    });
  }

  // カテゴリー削除
  await prisma.category.delete({
    where: { id },
  });

  return { success: true };
});

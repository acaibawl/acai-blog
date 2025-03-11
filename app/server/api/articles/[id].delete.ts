import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '~/server/utils/auth';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    await verifyAuth(event);
    // URLからIDを取得
    const id = getRouterParam(event, 'id');
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: '無効な記事IDです',
      });
    }

    // 記事が存在するか確認
    const existingArticle = await prisma.article.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingArticle) {
      throw createError({
        statusCode: 404,
        statusMessage: '記事が見つかりません',
      });
    }

    // 記事を削除
    await prisma.article.delete({
      where: {
        id: Number(id),
      },
    });

    return { success: true, message: '記事が削除されました' };
  } catch (error: any) {
    console.error('記事削除エラー:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'サーバーエラーが発生しました',
    });
  } finally {
    await prisma.$disconnect();
  }
});

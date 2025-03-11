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
    // リクエストボディを取得
    const body = await readBody(event);

    // バリデーション
    if (!body.title || !body.body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'タイトルと本文は必須です',
      });
    }

    // 記事を更新
    const updatedArticle = await prisma.article.update({
      where: {
        id: Number(id),
      },
      data: {
        title: body.title,
        body: body.body,
        thumbnail_url: body.thumbnail_url,
        main_image_url: body.main_image_url,
        updated_at: new Date(),
      },
    });

    return updatedArticle;
  } catch (error: any) {
    console.error('記事更新エラー:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'サーバーエラーが発生しました',
    });
  } finally {
    await prisma.$disconnect();
  }
});

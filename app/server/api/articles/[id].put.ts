import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '~/server/utils/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// 更新用のスキーマを定義
const updateArticleSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }),
  body: z.string().min(1, { message: '内容は必須です' }),
  thumbnail_url: z.string().nullable().optional(),
  main_image_url: z.string().nullable().optional(),
  category_id: z.number({ required_error: 'カテゴリーIDは必須です' }),
});

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
    const requestBody = await readBody(event);

    // バリデーション
    const validationResult = updateArticleSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      throw createError({
        statusCode: 400,
        statusMessage: errorMessages,
      });
    }

    const { title, body, thumbnail_url, main_image_url, category_id } = validationResult.data;

    // カテゴリーの存在確認
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      throw createError({
        statusCode: 400,
        statusMessage: '指定されたカテゴリーが存在しません',
      });
    }

    // 記事を更新
    const updatedArticle = await prisma.article.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        body,
        thumbnail_url,
        main_image_url,
        category_id,
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

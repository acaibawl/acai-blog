import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '~/server/utils/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// カテゴリー作成のスキーマ定義
const categorySchema = z.object({
  name: z.string()
    .min(1, { message: 'カテゴリー名は必須です' })
    .trim()
    .refine(val => val !== '', { message: 'カテゴリー名は空にできません' }),
});

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    await verifyAuth(event);

    // リクエストボディの取得と検証
    const body = await readBody(event);
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success) {
      // バリデーションエラーの場合
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      throw createError({
        statusCode: 400,
        statusMessage: errorMessages,
      });
    }

    const { name } = validationResult.data;

    // カテゴリー作成
    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return category;
  } catch (error: any) {
    // 一意性制約違反のエラー
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw createError({
        statusCode: 400,
        statusMessage: '同じ名前のカテゴリーが既に存在します',
      });
    }

    // 既にステータスコードが設定されているエラーはそのまま再スロー
    if (error.statusCode) {
      throw error;
    }

    // その他のエラー
    console.error('カテゴリー作成エラー:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'カテゴリーの作成に失敗しました',
    });
  } finally {
    await prisma.$disconnect();
  }
});

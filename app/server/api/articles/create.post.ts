import { defineEventHandler, readBody, createError } from 'h3';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAuth } from '~/server/utils/auth';

// 入力値のスキーマを定義
const articleSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }),
  body: z.string().min(1, { message: '内容は必須です' }),
  thumbnail_url: z.string().nullable().optional(), // サムネイル画像URL（任意）
  main_image_url: z.string().nullable().optional(), // メイン画像URL（任意）
});

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    await verifyAuth(event);

    // リクエストボディの取得と検証
    const validationResult = articleSchema.safeParse(await readBody(event));

    if (!validationResult.success) {
      // バリデーションエラーの場合
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      throw createError({
        statusCode: 400,
        statusMessage: errorMessages,
      });
    }

    const { title, body: content, thumbnail_url, main_image_url } = validationResult.data;

    // 記事の登録
    const prisma = new PrismaClient();

    // データオブジェクトを作成
    const articleData = {
      title,
      body: content,
      thumbnail_url: thumbnail_url || null,
      main_image_url: main_image_url || null,
    };

    const article = await prisma.article.create({
      data: articleData,
    });

    await prisma.$disconnect();

    return {
      id: article.id,
      message: '記事が投稿されました',
    };
  } catch (error: any) {
    console.error('記事の投稿に失敗しました:', error);

    // 認証エラーはverifyAuth内で処理されるため、それ以外のエラーを処理
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage: 'サーバーエラーが発生しました',
      });
    }

    // 既に適切なエラーが生成されている場合はそのまま再スロー
    throw error;
  }
});

import { defineEventHandler, readBody, createError } from 'h3';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAuth } from '~/server/utils/auth';

// 入力値のスキーマを定義
const articleSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }),
  body: z.string().min(1, { message: '内容は必須です' })
});

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    await verifyAuth(event);

    // リクエストボディの取得と検証
    const result = articleSchema.safeParse(await readBody(event));
    
    if (!result.success) {
      // バリデーションエラーの場合
      const errorMessages = result.error.errors.map(err => err.message).join(', ');
      throw createError({
        statusCode: 400,
        statusMessage: errorMessages,
      });
    }
    
    const { title, body: content } = result.data;
    
    // 記事の登録
    const prisma = new PrismaClient();
    const article = await prisma.article.create({
      data: {
        title,
        body: content,
      },
    });
    
    await prisma.$disconnect();
    
    return {
      id: article.id,
      message: "記事が投稿されました",
    };
  } catch (error: any) {
    console.error("記事の投稿に失敗しました:", error);
    
    // 認証エラーはverifyAuth内で処理されるため、それ以外のエラーを処理
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage: "サーバーエラーが発生しました",
      });
    }
    
    // 既に適切なエラーが生成されている場合はそのまま再スロー
    throw error;
  }
}); 
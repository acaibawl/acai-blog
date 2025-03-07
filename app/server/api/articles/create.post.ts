import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';

// 入力値のスキーマを定義
const articleSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }),
  body: z.string().min(1, { message: '内容は必須です' })
});

export default defineEventHandler(async (event) => {
  // 認証チェック
  const authHeaderValue = getRequestHeader(event, "authorization");
  if (!authHeaderValue) {
    throw createError({
      statusCode: 401,
      statusMessage: "認証が必要です",
    });
  }

  // トークンの検証
  try {
    const token = authHeaderValue.replace('Bearer ', '');
    const config = useRuntimeConfig(event);
    const decoded = verify(token, config.jwtSecret);

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
  } catch (error) {
    console.error("記事の投稿に失敗しました:", error);
    throw createError({
      statusCode: 401,
      statusMessage: "認証に失敗しました",
    });
  }
}); 
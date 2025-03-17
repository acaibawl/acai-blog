import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '~/server/utils/auth';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log('create category');
  // 認証チェック
  await verifyAuth(event);

  const body = await readBody(event);
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required',
    });
  }

  try {
    // カテゴリー作成
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    return category;
  } catch (error: any) {
    // 一意性制約違反のエラー
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category with this name already exists',
      });
    }

    // その他のエラー
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create category',
    });
  }
}); 
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

  const body = await readBody(event);
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required',
    });
  }

  // カテゴリーの存在確認
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    });
  }

  try {
    // カテゴリー更新
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    return updatedCategory;
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
      statusMessage: 'Failed to update category',
    });
  }
}); 
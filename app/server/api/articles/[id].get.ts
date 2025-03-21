import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  // idが有効な数値（NaNや0の場合）でなければエラーを返す
  if (isNaN(id) || id <= 0) {
    event.node.res.statusCode = 400;
    throw createError({
      message: 'Invalid article ID',
      statusCode: 400,
    });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true, // カテゴリー情報も含める
      },
    });

    // articleが見つからない場合はエラーを返す
    if (!article) {
      event.node.res.statusCode = 404;
      throw createError({
        message: 'Article not found',
        statusCode: 404,
      });
    }
    return article;
  } catch (error) {
    console.error(error);
    throw createError({
      message: '記事の取得に失敗しました。',
      statusCode: 500,
    });
  }
});

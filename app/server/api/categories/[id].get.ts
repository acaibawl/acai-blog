import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid category ID',
    });
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    });
  }

  return category;
});

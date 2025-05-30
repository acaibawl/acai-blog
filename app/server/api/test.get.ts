import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  const results = await prisma.connectionTest.findMany();
  return { results };
});

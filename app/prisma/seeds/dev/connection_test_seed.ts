import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // createMany を使って複数のユーザーを一括登録
  const result = await prisma.connectionTest.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' },
    ],
    // 既に同じ email のデータがあった場合はエラーにならないようにスキップする
    skipDuplicates: true,
  });

  // eslint-disable-next-line no-console
  console.log(`登録した件数: ${result.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

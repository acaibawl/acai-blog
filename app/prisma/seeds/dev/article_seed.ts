import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // article テーブルに複数の記事を一括登録
  const result = await prisma.article.createMany({
    data: [
      {
        title: "First Article",
        thumbnail_url: "https://picsum.photos/300/200",
        main_image_url: "https://picsum.photos/600/400",
        body: "This is the first sample article for our blog.",
      },
      {
        title: "Second Article",
        thumbnail_url: "https://picsum.photos/300/200",
        main_image_url: "https://picsum.photos/600/400",
        body: "This is the second sample article for our blog.",
      },
      {
        title: "Third Article",
        thumbnail_url: "https://picsum.photos/300/200",
        main_image_url: "https://picsum.photos/600/400",
        body: "This is the third sample article for our blog.",
      }
    ],
    // 重複するレコードがあればスキップ
    skipDuplicates: true,
  })

  console.log(`Seeded ${result.count} articles.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
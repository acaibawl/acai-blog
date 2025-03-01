import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Array.from を使って 100 件分のダミーデータを生成する
  const articlesData = Array.from({ length: 100 }, (_, i) => {
    const index = i + 1
    return {
      title: `Article ${index}`,
      thumbnail_url: `https://picsum.photos/300/200?random=${index}`,
      main_image_url: `https://picsum.photos/600/400?random=${index}`,
      body: `This is the content of article ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    }
  })

  // 生成した100件分の記事データを一括登録
  const result = await prisma.article.createMany({
    data: articlesData,
    skipDuplicates: true, // 重複するレコードがあればスキップ
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
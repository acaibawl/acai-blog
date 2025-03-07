import type { Article } from "@prisma/client"

export interface ArticlesResponse {
  articles: Article[]
  page: number
  pageSize: number
  allArticlesCount: number
}

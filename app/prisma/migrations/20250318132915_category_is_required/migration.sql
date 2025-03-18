/*
  Warnings:

  - Made the column `category_id` on table `article` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_category_id_fkey";

-- AlterTable
ALTER TABLE "article" ALTER COLUMN "category_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `brand` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `maxStockLevel` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `minStockLevel` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "brand",
DROP COLUMN "maxStockLevel",
DROP COLUMN "minStockLevel";

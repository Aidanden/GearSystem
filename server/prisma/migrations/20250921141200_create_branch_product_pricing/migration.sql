-- AlterTable (Remove branchSalePrice from products)
ALTER TABLE "products" DROP COLUMN IF EXISTS "branchSalePrice";

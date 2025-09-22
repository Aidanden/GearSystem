-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CustomerType" ADD VALUE 'RETAILER';
ALTER TYPE "CustomerType" ADD VALUE 'STORE';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "creditLimit" DECIMAL(10,2),
ADD COLUMN     "currentBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "taxNumber" TEXT;

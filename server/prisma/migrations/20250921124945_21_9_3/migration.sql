/*
  Warnings:

  - You are about to drop the column `productId` on the `sale_invoice_items` table. All the data in the column will be lost.
  - Added the required column `branchSalePrice` to the `branch_sale_invoice_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sparePartId` to the `sale_invoice_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sale_invoice_items" DROP CONSTRAINT "sale_invoice_items_productId_fkey";

-- AlterTable
ALTER TABLE "branch_sale_invoice_items" ADD COLUMN     "branchSalePrice" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "sale_invoice_items" DROP COLUMN "productId",
ADD COLUMN     "sparePartId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "branch_inventory" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "branchSalePrice" DECIMAL(10,2) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_customer_sales" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(10,2) NOT NULL,
    "paymentType" "PaymentType" NOT NULL DEFAULT 'CASH',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_customer_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_customer_sale_items" (
    "id" TEXT NOT NULL,
    "branchCustomerSaleId" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "branch_customer_sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branch_inventory_branchId_sparePartId_key" ON "branch_inventory"("branchId", "sparePartId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_customer_sales_invoiceNumber_key" ON "branch_customer_sales"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "sale_invoice_items" ADD CONSTRAINT "sale_invoice_items_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_inventory" ADD CONSTRAINT "branch_inventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_inventory" ADD CONSTRAINT "branch_inventory_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_customer_sales" ADD CONSTRAINT "branch_customer_sales_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_customer_sales" ADD CONSTRAINT "branch_customer_sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_customer_sale_items" ADD CONSTRAINT "branch_customer_sale_items_branchCustomerSaleId_fkey" FOREIGN KEY ("branchCustomerSaleId") REFERENCES "branch_customer_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_customer_sale_items" ADD CONSTRAINT "branch_customer_sale_items_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

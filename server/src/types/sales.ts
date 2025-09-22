export enum SaleType {
  REGULAR = 'REGULAR',     // بيع عادي
  BRANCH = 'BRANCH'        // بيع للمحلات التابعة
}

export enum InvoiceStatus {
  PENDING = 'PENDING',       // معلقة
  COMPLETED = 'COMPLETED',   // مكتملة
  CANCELLED = 'CANCELLED'    // ملغية
}

export enum PaymentType {
  CASH = 'CASH',      // نقدي
  CREDIT = 'CREDIT'   // آجل
}

export enum PaymentMethod {
  CASH = 'CASH',      // نقدي
  BANK = 'BANK',      // مصرفي
  CHECK = 'CHECK'     // شيك
}

// ===== فواتير البيع للعملاء =====

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  storeId?: string; // معرف المحل (للبيع لمحلات الشركة)
  userId: string;
  invoiceDate: Date;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discount: number;
  netAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleInvoiceItem {
  id: string;
  saleInvoiceId: string;
  sparePartId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice?: number;
}

export interface CreateSaleInvoiceData {
  customerId?: string;
  storeId?: string; // للبيع لمحلات الشركة
  invoiceDate: Date | string; // يمكن أن يكون Date أو string
  saleType?: SaleType;
  paymentMethod: PaymentMethod;
  discount?: number;
  notes?: string;
  items: CreateSaleInvoiceItemData[];
}

export interface CreateSaleInvoiceItemData {
  sparePartId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateSaleInvoiceData {
  customerId?: string;
  storeId?: string; // للبيع لمحلات الشركة
  invoiceDate?: Date | string; // يمكن أن يكون Date أو string
  saleType?: SaleType;
  paymentMethod?: PaymentMethod;
  discount?: number;
  notes?: string;
  items?: CreateSaleInvoiceItemData[];
}

// ===== فواتير البيع للمحلات التابعة =====

export interface BranchSaleInvoice {
  id: string;
  invoiceNumber: string;
  branchId: string;
  customerId?: string;
  userId: string;
  invoiceDate: Date;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discount: number;
  netAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchSaleInvoiceItem {
  id: string;
  branchSaleInvoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  branchSalePrice: number;
  totalPrice: number;
  transferPrice: number;
}

export interface CreateBranchSaleInvoiceData {
  branchId: string;
  invoiceDate: Date;
  paymentMethod: PaymentMethod;
  discount?: number;
  notes?: string;
  items: CreateBranchSaleInvoiceItemData[];
}

export interface CreateBranchSaleInvoiceItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  branchSalePrice: number;
  transferPrice: number;
}

export interface UpdateBranchSaleInvoiceData {
  branchId?: string;
  invoiceDate?: Date;
  paymentMethod?: PaymentMethod;
  discount?: number;
  notes?: string;
  items?: CreateBranchSaleInvoiceItemData[];
}

// ===== مخزون المحلات =====

export interface BranchInventory {
  id: string;
  branchId: string;
  sparePartId: string;
  quantity: number;
  branchSalePrice: number;
  lastUpdated: Date;
}

export interface CreateBranchInventoryData {
  branchId: string;
  sparePartId: string;
  quantity: number;
  branchSalePrice: number;
}

export interface UpdateBranchInventoryData {
  quantity?: number;
  branchSalePrice?: number;
}

// ===== فواتير بيع المحلات للعملاء =====

export interface BranchCustomerSale {
  id: string;
  invoiceNumber: string;
  branchId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  invoiceDate: Date;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: PaymentType;
  status: InvoiceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchCustomerSaleItem {
  id: string;
  branchCustomerSaleId: string;
  sparePartId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateBranchCustomerSaleData {
  branchId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  invoiceDate: Date;
  taxAmount?: number;
  discountAmount?: number;
  paidAmount?: number;
  paymentType: PaymentType;
  notes?: string;
  items: CreateBranchCustomerSaleItemData[];
}

export interface CreateBranchCustomerSaleItemData {
  sparePartId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateBranchCustomerSaleData {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  invoiceDate?: Date;
  taxAmount?: number;
  discountAmount?: number;
  paidAmount?: number;
  paymentType?: PaymentType;
  notes?: string;
  items?: CreateBranchCustomerSaleItemData[];
}

// ===== معاملات البحث =====

export interface SaleInvoiceSearchParams {
  search?: string;
  customerId?: string;
  storeId?: string;
  userId?: string;
  saleType?: SaleType;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface BranchSaleInvoiceSearchParams {
  search?: string;
  branchId?: string;
  customerId?: string;
  userId?: string;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface BranchCustomerSaleSearchParams {
  search?: string;
  branchId?: string;
  customerId?: string;
  paymentType?: PaymentType;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// ===== إحصائيات المبيعات =====

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  salesByMonth: {
    month: string;
    totalSales: number;
    totalRevenue: number;
  }[];
}

export interface BranchSalesStats {
  branchId: string;
  branchName: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  inventoryValue: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

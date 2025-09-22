import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// ===== أنواع المستخدمين =====

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: Role;
}

export enum Role {
  ADMIN = 'ADMIN',       // مدير النظام
  MANAGER = 'MANAGER',   // مدير المخزن
  EMPLOYEE = 'EMPLOYEE', // موظف
  USER = 'USER'          // مستخدم عادي
}

// ===== أنواع الطلبات =====

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

// ===== أنواع المنتجات والمخزون =====

export interface ProductRequest {
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

export interface CategoryRequest {
  code: string;
  name: string;
  description?: string;
}

export interface InventoryUpdateRequest {
  productId: string;
  quantity: number;
  operation: 'ADD' | 'SUBTRACT' | 'SET';
  reason?: string;
}

// ===== أنواع الموردين والعملاء =====

export interface SupplierRequest {
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
}

export interface CustomerRequest {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customerType: CustomerType;
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL', // فردي
  COMPANY = 'COMPANY',       // شركة
  WORKSHOP = 'WORKSHOP'      // ورشة سيارات
}

// ===== أنواع الفواتير =====

export interface PurchaseInvoiceRequest {
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: string;
  dueDate?: string;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  items: PurchaseInvoiceItemRequest[];
  notes?: string;
}

export interface PurchaseInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleInvoiceRequest {
  invoiceNumber: string;
  customerId?: string;
  invoiceDate: string;
  saleType?: SaleType;
  paymentMethod: PaymentMethod;
  discount?: number;
  items: SaleInvoiceItemRequest[];
  notes?: string;
}

export interface SaleInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export enum PaymentType {
  CASH = 'CASH',     // نقدي
  CREDIT = 'CREDIT'  // آجل
}

export enum PaymentMethod {
  CASH = 'CASH',     // نقدي
  BANK = 'BANK',     // مصرفي
  CHECK = 'CHECK'    // شيك
}

export enum InvoiceStatus {
  PENDING = 'PENDING',     // معلقة
  PARTIAL = 'PARTIAL',     // مدفوعة جزئياً
  PAID = 'PAID',           // مدفوعة بالكامل
  CANCELLED = 'CANCELLED'  // ملغية
}

export enum SaleType {
  REGULAR = 'REGULAR',     // بيع عادي B2B أو للأفراد
  BRANCH = 'BRANCH',       // بيع للمحلات التابعة للشركة
  WORKSHOP = 'WORKSHOP'    // بيع للورش
}

export enum TransferStatus {
  PENDING = 'PENDING',     // في الانتظار
  SENT = 'SENT',           // تم الإرسال
  RECEIVED = 'RECEIVED',   // تم الاستلام
  CANCELLED = 'CANCELLED'  // ملغي
}

// ===== أنواع المحلات =====

export interface BranchRequest {
  code: string;
  name: string;
  managerName?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  openingDate?: string;
}

export interface BranchProductPriceRequest {
  branchId: string;
  productId: string;
  transferPrice: number;
  retailPrice: number;
  wholesalePrice?: number;
}

export interface BranchTransferRequest {
  transferNumber: string;
  fromBranchId?: string; // null إذا من المخزن الرئيسي
  toBranchId: string;
  transferDate: string;
  items: BranchTransferItemRequest[];
  notes?: string;
}

export interface BranchTransferItemRequest {
  productId: string;
  quantity: number;
  transferPrice: number;
}

export interface BranchSaleInvoiceRequest {
  invoiceNumber: string;
  branchId: string;
  customerId?: string;
  invoiceDate: string;
  paymentMethod: PaymentMethod;
  discount?: number;
  items: BranchSaleInvoiceItemRequest[];
  notes?: string;
}

export interface BranchSaleInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number; // سعر البيع للعميل
  transferPrice: number; // سعر التحويل من المخزن الرئيسي
}

// ===== أنواع المدفوعات =====

export interface PaymentRequest {
  purchaseInvoiceId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  bankName?: string;
  checkNumber?: string;
  referenceNumber?: string;
  notes?: string;
}

// ===== أنواع الاستجابات =====

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== أنواع التقارير =====

export interface InventoryReportItem {
  productId: string;
  productCode: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastCostPrice: number;
  totalValue: number;
}

export interface SalesReportItem {
  period: string;
  totalSales: number;
  totalItems: number;
  averageOrderValue: number;
}

export interface PurchaseReportItem {
  period: string;
  totalPurchases: number;
  totalItems: number;
  pendingPayments: number;
}

// ===== أنواع JWT =====

export interface JwtUserPayload extends JwtPayload {
  userId: string;
  username: string;
  role: Role;
}

// ===== أنواع البيئة =====

export interface EnvironmentVariables {
  DATABASE_URL: string;
  PORT: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: string;
  UPLOAD_PATH: string;
}

// ===== أنواع الأخطاء =====

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

// ===== أنواع مساعدة =====

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserData = Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'role' | 'isActive'>>;
export type UserWithoutPassword = Omit<User, 'password'>;

// ===== أنواع الإحصائيات =====

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalBranches: number;
  monthlyPurchases: number;
  monthlySales: number;
  monthlyBranchSales: number;
  pendingPayments: number;
  totalInventoryValue: number;
  totalBranchInventoryValue: number;
}

export interface BranchInventoryReportItem {
  branchId: string;
  branchName: string;
  productId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  transferPrice: number;
  retailPrice: number;
  totalValue: number;
}

export interface BranchSalesReportItem {
  branchId: string;
  branchName: string;
  period: string;
  totalSales: number;
  totalItems: number;
  profit: number; // الربح (سعر البيع - سعر التحويل)
  averageOrderValue: number;
}

export interface TransferReportItem {
  transferId: string;
  transferNumber: string;
  fromBranch?: string;
  toBranch: string;
  transferDate: string;
  totalAmount: number;
  status: TransferStatus;
  itemsCount: number;
}


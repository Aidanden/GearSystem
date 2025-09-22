export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL', // فردي
  COMPANY = 'COMPANY',       // شركة
  WORKSHOP = 'WORKSHOP',     // ورشة سيارات
  RETAILER = 'RETAILER',     // تاجر تجزئة
  STORE = 'STORE'            // محل
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customerType: CustomerType;
  taxNumber?: string;
  currentBalance: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerData {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customerType?: CustomerType;
  taxNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateCustomerData {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  customerType?: CustomerType;
  taxNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerSearchParams {
  search?: string;
  customerType?: CustomerType;
  city?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  byType: { [key in CustomerType]: number };
  totalBalance: number;
}

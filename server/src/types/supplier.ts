export interface CreateSupplierData {
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

export interface UpdateSupplierData {
  code?: string;
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  isActive?: boolean;
}

export interface SupplierWithStats {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    purchaseInvoices: number;
  };
}


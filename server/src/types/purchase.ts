export interface CreatePurchaseInvoiceData {
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: Date;
  dueDate?: Date;
  paymentType: 'CASH' | 'CREDIT';
  paymentMethod?: 'CASH' | 'BANK' | 'CHECK';
  notes?: string;
  items: CreatePurchaseInvoiceItemData[];
}

export interface CreatePurchaseInvoiceItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdatePurchaseInvoiceData {
  invoiceNumber?: string;
  supplierId?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  paymentType?: 'CASH' | 'CREDIT';
  paymentMethod?: 'CASH' | 'BANK' | 'CHECK';
  notes?: string;
  status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
}

export interface PurchaseInvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  userId: string;
  invoiceDate: Date;
  dueDate?: Date;
  paymentType: string;
  paymentMethod?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  supplier: {
    id: string;
    code: string;
    name: string;
  };
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  items: PurchaseInvoiceItemWithProduct[];
}

export interface PurchaseInvoiceItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}


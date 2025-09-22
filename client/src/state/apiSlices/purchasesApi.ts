import { api } from '../api';

// Types for purchases
export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  userId: string;
  invoiceDate: string;
  dueDate?: string;
  paymentType: string;
  paymentMethod?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  items: PurchaseInvoiceItem[];
}

export interface PurchaseInvoiceItem {
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

export interface CreatePurchaseInvoiceRequest {
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: string;
  dueDate?: string;
  paymentType: 'CASH' | 'CREDIT';
  paymentMethod?: 'CASH' | 'BANK' | 'CHECK';
  notes?: string;
  items: CreatePurchaseInvoiceItemRequest[];
}

export interface CreatePurchaseInvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdatePurchaseInvoiceRequest extends Partial<CreatePurchaseInvoiceRequest> {
  id: string;
  status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
}

export interface PurchaseInvoicePrintData extends PurchaseInvoice {
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
  };
  printDate: string;
  totalInWords: string;
}

export const purchasesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all purchase invoices
    getPurchaseInvoices: builder.query<PurchaseInvoice[], { status?: string; supplierId?: string }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.supplierId) searchParams.append('supplierId', params.supplierId);
        return `/api/purchases?${searchParams.toString()}`;
      },
      providesTags: ['Purchase'],
    }),

    // Get purchase invoice by ID
    getPurchaseInvoice: builder.query<PurchaseInvoice, string>({
      query: (id) => `/api/purchases/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }],
    }),

    // Get pending purchase invoices
    getPendingPurchaseInvoices: builder.query<PurchaseInvoice[], void>({
      query: () => '/api/purchases/pending',
      providesTags: ['Purchase'],
    }),

    // Create new purchase invoice
    createPurchaseInvoice: builder.mutation<PurchaseInvoice, CreatePurchaseInvoiceRequest>({
      query: (invoice) => ({
        url: '/api/purchases',
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['PurchaseInvoice'],
    }),

    // Update purchase invoice
    updatePurchaseInvoice: builder.mutation<PurchaseInvoice, UpdatePurchaseInvoiceRequest>({
      query: ({ id, ...invoice }) => ({
        url: `/api/purchases/${id}`,
        method: 'PUT',
        body: invoice,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Purchase', id }],
    }),

    // Delete purchase invoice
    deletePurchaseInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/purchases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseInvoice'],
    }),

    // Search purchase invoices
    searchPurchaseInvoices: builder.query<PurchaseInvoice[], string>({
      query: (searchTerm) => `/api/purchases/search/${encodeURIComponent(searchTerm)}`,
      providesTags: ['Purchase'],
    }),

    // Get purchase invoices by supplier
    getPurchaseInvoicesBySupplier: builder.query<PurchaseInvoice[], string>({
      query: (supplierId) => `/api/purchases/supplier/${supplierId}`,
      providesTags: ['Purchase'],
    }),

    // Get purchase invoice print data
    getPurchaseInvoicePrintData: builder.query<PurchaseInvoicePrintData, string>({
      query: (id) => `/api/purchases/${id}/print`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }],
    }),

    // Generate new invoice number
    generateInvoiceNumber: builder.query<{ invoiceNumber: string }, void>({
      query: () => '/api/purchases/generate-invoice-number',
    }),
  }),
});

export const {
  useGetPurchaseInvoicesQuery,
  useGetPurchaseInvoiceQuery,
  useGetPendingPurchaseInvoicesQuery,
  useCreatePurchaseInvoiceMutation,
  useUpdatePurchaseInvoiceMutation,
  useDeletePurchaseInvoiceMutation,
  useSearchPurchaseInvoicesQuery,
  useGetPurchaseInvoicesBySupplierQuery,
  useGetPurchaseInvoicePrintDataQuery,
  useGenerateInvoiceNumberQuery,
} = purchasesApi;

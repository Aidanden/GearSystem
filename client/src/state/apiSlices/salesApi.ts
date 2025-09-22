import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export enum SaleType {
  REGULAR = 'REGULAR',     // بيع عادي
  BRANCH = 'BRANCH'        // بيع للمحلات التابعة
}

export enum PaymentMethod {
  CASH = 'CASH',      // نقدي
  BANK = 'BANK',      // مصرفي
  CHECK = 'CHECK'     // شيك
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  storeId?: string; // معرف المحل للبيع للمحلات
  userId: string;
  invoiceDate: string;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discount: number;
  netAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    code: string;
    phone?: string;
  };
  store?: {
    id: string;
    name: string;
    code: string;
    manager?: string;
  };
  user?: {
    id: string;
    name: string;
  };
  items: SaleInvoiceItem[];
}

export interface SaleInvoiceItem {
  id: string;
  saleInvoiceId: string;
  sparePartId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice?: number;
  sparePart: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
}

export interface CreateSaleInvoiceData {
  customerId?: string;
  storeId?: string; // معرف المحل للبيع للمحلات
  invoiceDate: string;
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
  storeId?: string; // معرف المحل للبيع للمحلات
  invoiceDate?: string;
  saleType?: SaleType;
  paymentMethod?: PaymentMethod;
  discount?: number;
  notes?: string;
  items?: CreateSaleInvoiceItemData[];
}

export interface SaleInvoiceSearchParams {
  search?: string;
  customerId?: string;
  storeId?: string; // للبحث بالمحلات
  userId?: string;
  saleType?: SaleType;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SaleInvoiceSearchResult {
  invoices: SaleInvoice[];
  total: number;
  page: number;
  totalPages: number;
}

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

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/sales`,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['SaleInvoice'],
  endpoints: (builder) => ({
    // جلب جميع فواتير البيع
    getSaleInvoices: builder.query<{ success: boolean; data: SaleInvoice[]; message: string }, void>({
      query: () => '/',
      providesTags: ['SaleInvoice'],
    }),

    // جلب فاتورة بيع بالمعرف
    getSaleInvoiceById: builder.query<{ success: boolean; data: SaleInvoice; message: string }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'SaleInvoice', id }],
    }),

    // إنشاء فاتورة بيع جديدة
    createSaleInvoice: builder.mutation<{ success: boolean; data: SaleInvoice; message: string }, CreateSaleInvoiceData>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SaleInvoice'],
    }),

    // تحديث فاتورة بيع
    updateSaleInvoice: builder.mutation<{ success: boolean; data: SaleInvoice; message: string }, { id: string; data: UpdateSaleInvoiceData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SaleInvoice', id }, 'SaleInvoice'],
    }),

    // حذف فاتورة بيع
    deleteSaleInvoice: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SaleInvoice'],
    }),

    // البحث في فواتير البيع
    searchSaleInvoices: builder.query<{ success: boolean; data: SaleInvoiceSearchResult; message: string }, SaleInvoiceSearchParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.customerId) searchParams.append('customerId', params.customerId);
        if (params.storeId) searchParams.append('storeId', params.storeId);
        if (params.userId) searchParams.append('userId', params.userId);
        if (params.saleType) searchParams.append('saleType', params.saleType);
        if (params.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        
        return `/search?${searchParams.toString()}`;
      },
      providesTags: ['SaleInvoice'],
    }),

    // جلب إحصائيات المبيعات
    getSalesStats: builder.query<{ success: boolean; data: SalesStats; message: string }, void>({
      query: () => '/stats',
      providesTags: ['SaleInvoice'],
    }),
  }),
});

export const {
  useGetSaleInvoicesQuery,
  useGetSaleInvoiceByIdQuery,
  useCreateSaleInvoiceMutation,
  useUpdateSaleInvoiceMutation,
  useDeleteSaleInvoiceMutation,
  useSearchSaleInvoicesQuery,
  useGetSalesStatsQuery,
} = salesApi;

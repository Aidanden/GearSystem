import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

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
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  customerType?: CustomerType;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateCustomerData {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  customerType?: CustomerType;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerSearchParams {
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CustomerSearchResult {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  byType: {
    [key in CustomerType]: number;
  };
  totalBalance: number;
  totalCreditLimit: number;
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/customers`,
  }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    // Get all customers
    getCustomers: builder.query<{ success: boolean; data: Customer[]; message: string }, void>({
      query: () => '/',
      providesTags: ['Customer'],
    }),

    // Get active customers only
    getActiveCustomers: builder.query<{ success: boolean; data: Customer[]; message: string }, void>({
      query: () => '/active',
      providesTags: ['Customer'],
    }),

    // Get customer stats
    getCustomerStats: builder.query<{ success: boolean; data: CustomerStats; message: string }, void>({
      query: () => '/stats',
      providesTags: ['Customer'],
    }),

    // Search customers
    searchCustomers: builder.query<{ success: boolean; data: CustomerSearchResult; message: string }, CustomerSearchParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.customerType) searchParams.append('customerType', params.customerType);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        
        return `/search?${searchParams.toString()}`;
      },
      providesTags: ['Customer'],
    }),

    // Get customers by type
    getCustomersByType: builder.query<{ success: boolean; data: Customer[]; message: string }, CustomerType>({
      query: (type) => `/type/${type}`,
      providesTags: ['Customer'],
    }),

    // Get customers with debt
    getCustomersWithDebt: builder.query<{ success: boolean; data: Customer[]; message: string }, void>({
      query: () => '/debt',
      providesTags: ['Customer'],
    }),

    // Get customer by ID
    getCustomer: builder.query<{ success: boolean; data: Customer; message: string }, string>({
      query: (id) => `/${id}`,
      providesTags: ['Customer'],
    }),

    // Create new customer
    createCustomer: builder.mutation<{ success: boolean; data: Customer; message: string }, CreateCustomerData>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Customer'],
    }),

    // Update customer
    updateCustomer: builder.mutation<{ success: boolean; data: Customer; message: string }, { id: string; data: UpdateCustomerData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Customer'],
    }),

    // Delete customer
    deleteCustomer: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),

    // Toggle customer status
    toggleCustomerStatus: builder.mutation<{ success: boolean; data: Customer; message: string }, string>({
      query: (id) => ({
        url: `/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Customer'],
    }),

    // Update customer balance
    updateCustomerBalance: builder.mutation<{ success: boolean; data: Customer; message: string }, { id: string; amount: number }>({
      query: ({ id, amount }) => ({
        url: `/${id}/balance`,
        method: 'PATCH',
        body: { amount },
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetActiveCustomersQuery,
  useGetCustomerStatsQuery,
  useSearchCustomersQuery,
  useGetCustomersByTypeQuery,
  useGetCustomersWithDebtQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useToggleCustomerStatusMutation,
  useUpdateCustomerBalanceMutation,
} = customersApi;

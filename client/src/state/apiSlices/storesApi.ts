import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface Store {
  id: string;
  code: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  code?: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive?: boolean;
}

export interface UpdateStoreData {
  code?: string;
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive?: boolean;
}

export interface StoreSearchParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface StoreSearchResult {
  stores: Store[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StoreStats {
  total: number;
  active: number;
  inactive: number;
}

export const storesApi = createApi({
  reducerPath: 'storesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/stores`,
  }),
  tagTypes: ['Store'],
  endpoints: (builder) => ({
    // Get all stores
    getStores: builder.query<{ success: boolean; data: Store[]; message: string }, void>({
      query: () => '/',
      providesTags: ['Store'],
    }),

    // Get active stores only
    getActiveStores: builder.query<{ success: boolean; data: Store[]; message: string }, void>({
      query: () => '/active',
      providesTags: ['Store'],
    }),

    // Get store stats
    getStoreStats: builder.query<{ success: boolean; data: StoreStats; message: string }, void>({
      query: () => '/stats',
      providesTags: ['Store'],
    }),

    // Search stores
    searchStores: builder.query<{ success: boolean; data: StoreSearchResult; message: string }, StoreSearchParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        
        return `/search?${searchParams.toString()}`;
      },
      providesTags: ['Store'],
    }),

    // Get store by ID
    getStore: builder.query<{ success: boolean; data: Store; message: string }, string>({
      query: (id) => `/${id}`,
      providesTags: ['Store'],
    }),

    // Create new store
    createStore: builder.mutation<{ success: boolean; data: Store; message: string }, CreateStoreData>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Store'],
    }),

    // Update store
    updateStore: builder.mutation<{ success: boolean; data: Store; message: string }, { id: string; data: UpdateStoreData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Store'],
    }),

    // Delete store
    deleteStore: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Store'],
    }),

    // Toggle store status
    toggleStoreStatus: builder.mutation<{ success: boolean; data: Store; message: string }, string>({
      query: (id) => ({
        url: `/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Store'],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetActiveStoresQuery,
  useGetStoreStatsQuery,
  useSearchStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useToggleStoreStatusMutation,
} = storesApi;

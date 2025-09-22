import { api } from '../api';

// Types for suppliers
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    purchases: number;
  };
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: string;
}

export const suppliersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all suppliers
    getSuppliers: builder.query<Supplier[], void>({
      query: () => '/api/suppliers',
      providesTags: ['Supplier'],
    }),

    // Get supplier by ID
    getSupplier: builder.query<Supplier, string>({
      query: (id) => `/api/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),

    // Create new supplier
    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (supplier) => ({
        url: '/api/suppliers',
        method: 'POST',
        body: supplier,
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Update supplier
    updateSupplier: builder.mutation<Supplier, UpdateSupplierRequest>({
      query: ({ id, ...supplier }) => ({
        url: `/api/suppliers/${id}`,
        method: 'PUT',
        body: supplier,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Supplier', id }],
    }),

    // Delete supplier
    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier'],
    }),

    // Search suppliers
    searchSuppliers: builder.query<Supplier[], string>({
      query: (searchTerm) => `/api/suppliers/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Supplier'],
    }),

    // Get active suppliers only
    getActiveSuppliers: builder.query<Supplier[], void>({
      query: () => '/api/suppliers?active=true',
      providesTags: ['Supplier'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useSearchSuppliersQuery,
  useGetActiveSuppliersQuery,
} = suppliersApi;

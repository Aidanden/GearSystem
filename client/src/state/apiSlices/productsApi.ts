import { api } from '../api';

// Types for products
export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  carModel: string;
  carYear?: string;
  originalPartNumber?: string;
  unitPrice?: number; // سعر الوحدة الأساسي
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    code: string;
    name: string;
  };
  inventoryItems: Array<{
    id: string;
    quantity: number;
    reservedQty: number;
    lastCostPrice: number;
    averageCost: number;
    lastUpdated: string;
  }>;
}

export interface CreateProductRequest {
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  carModel: string;
  carYear?: string;
  originalPartNumber?: string;
  unitPrice?: number; // سعر الوحدة الأساسي
  initialQuantity?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query<Product[], void>({
      query: () => '/api/products',
      providesTags: ['Product'],
    }),

    // Get product by ID
    getProduct: builder.query<Product, string>({
      query: (id) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Create new product
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (product) => ({
        url: '/api/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),

    // Update product
    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...product }) => ({
        url: `/api/products/${id}`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    // Delete product
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Search products
    searchProducts: builder.query<Product[], string>({
      query: (searchTerm) => `/api/products/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSearchProductsQuery,
} = productsApi;

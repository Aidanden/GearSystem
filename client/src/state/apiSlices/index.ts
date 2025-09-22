// Re-export hooks from API slices
// Note: The actual API slices are imported in redux.tsx to avoid circular dependencies

export { 
  useLoginMutation,
  useRegisterMutation,
  useVerifyTokenQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
} from './authApi';

export {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSearchProductsQuery,
} from './productsApi';

export {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
} from './categoriesApi';

export {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useSearchSuppliersQuery,
  useGetActiveSuppliersQuery,
} from './suppliersApi';

// Re-export types
export type { LoginRequest, LoginResponse, RegisterRequest, VerifyTokenResponse } from './authApi';
export type { Product, CreateProductRequest, UpdateProductRequest } from './productsApi';
export type { Category, CreateCategoryRequest, UpdateCategoryRequest } from './categoriesApi';
export type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from './suppliersApi';

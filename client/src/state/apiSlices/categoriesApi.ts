import { api } from '../api';

// Types for categories
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<Category[], void>({
      query: () => '/api/categories',
      providesTags: ['Category'],
    }),

    // Get category by ID
    getCategory: builder.query<Category, string>({
      query: (id) => `/api/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Create new category
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (category) => ({
        url: '/api/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),

    // Update category
    updateCategory: builder.mutation<Category, UpdateCategoryRequest>({
      query: ({ id, ...category }) => ({
        url: `/api/categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),

    // Delete category
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Get category tree (hierarchical structure)
    getCategoryTree: builder.query<Category[], void>({
      query: () => '/api/categories/tree',
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
} = categoriesApi;

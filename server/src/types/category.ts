export interface CreateCategoryData {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryWithStats {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}


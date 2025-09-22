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
  createdAt: Date;
  updatedAt: Date;
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

// Pagination
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

// Generic API response
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

// Example domain type - replace with your own
export type Item = {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateItemDto = {
  name: string;
  description?: string;
};

export type UpdateItemDto = Partial<CreateItemDto>;

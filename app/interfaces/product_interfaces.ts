export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  category?: string
  isActive?: boolean
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  category?: string
  isActive?: boolean
}

export interface ProductResponse {
  id: number
  name: string
  description: string | null
  price: number
  category: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductsListResponse {
  data: ProductResponse[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
}

export interface ProductSearchQuery {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  page?: number
  limit?: number
}

export interface DeleteProductResponse {
  message: string
}

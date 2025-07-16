export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  role?: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'
}

export interface UserResponse {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'
  createdAt: string
  updatedAt: string
}

export interface UsersListResponse {
  data: UserResponse[]
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

export interface DeleteUserResponse {
  message: string
}

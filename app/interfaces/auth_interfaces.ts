export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  type: 'bearer'
  token: string
  user: {
    id: number
    name: string
    email: string
    role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'
    createdAt: string
    updatedAt: string
  }
}

export interface LogoutResponse {
  message: string
}

export interface MeResponse {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'
  createdAt: string
  updatedAt: string
}

export interface ErrorResponse {
  message: string
  errors?: any[]
}

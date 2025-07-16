export interface CreateGatewayRequest {
  name: string
  type: 'STRIPE' | 'PAYPAL' | 'MERCADOPAGO' | 'PAGSEGURO'
  config: {
    apiKey?: string
    secretKey?: string
    webhookUrl?: string
    [key: string]: any
  }
  isActive?: boolean
  priority?: number
}

export interface UpdateGatewayStatusRequest {
  isActive: boolean
}

export interface UpdateGatewayPriorityRequest {
  priority: number
}

export interface GatewayResponse {
  id: number
  name: string
  type: 'STRIPE' | 'PAYPAL' | 'MERCADOPAGO' | 'PAGSEGURO'
  config: {
    [key: string]: any
  }
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface GatewaysListResponse {
  data: GatewayResponse[]
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

export interface GatewayStatusUpdateResponse {
  message: string
  gateway: GatewayResponse
}

export interface GatewayPriorityUpdateResponse {
  message: string
  gateway: GatewayResponse
}

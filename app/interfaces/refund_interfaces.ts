export interface CreateRefundRequest {
  transactionId: number
  amount?: number
  reason: string
  type: 'FULL' | 'PARTIAL'
}

export interface UpdateRefundStatusRequest {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
}

export interface RefundResponse {
  id: number
  transactionId: number
  amount: number
  reason: string
  type: 'FULL' | 'PARTIAL'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  gatewayResponse: {
    [key: string]: any
  }
  transaction: {
    id: number
    transactionId: string
    originalAmount: number
    client: {
      id: number
      name: string
      email: string
    }
  }
  createdAt: string
  updatedAt: string
  processedAt: string | null
}

export interface RefundsListResponse {
  data: RefundResponse[]
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

export interface RefundCreatedResponse {
  message: string
  refund: RefundResponse
}

export interface RefundStatusUpdateResponse {
  message: string
  refund: RefundResponse
}

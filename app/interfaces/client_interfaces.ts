export interface ClientResponse {
  id: number
  name: string
  email: string
  document: string
  createdAt: string
  updatedAt: string
}

export interface ClientsListResponse {
  data: ClientResponse[]
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

export interface ClientWithPurchasesResponse {
  id: number
  name: string
  email: string
  document: string
  createdAt: string
  updatedAt: string
  purchases: {
    id: number
    transactionId: string
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
    amount: number
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO'
    createdAt: string
    updatedAt: string
  }[]
}

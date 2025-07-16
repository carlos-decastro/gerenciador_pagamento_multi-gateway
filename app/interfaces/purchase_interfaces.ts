export interface CreatePurchaseRequest {
  clientName: string
  clientEmail: string
  clientDocument: string
  products: {
    productId: number
    quantity: number
    unitPrice: number
  }[]
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO'
  paymentData: {
    cardNumber?: string
    cardHolderName?: string
    expiryMonth?: string
    expiryYear?: string
    cvv?: string
    pixKey?: string
    [key: string]: any
  }
  gatewayId?: number
}

export interface PurchaseResponse {
  id: number
  transactionId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  amount: number
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO'
  gatewayResponse: {
    [key: string]: any
  }
  client: {
    id: number
    name: string
    email: string
    document: string
  }
  gateway: {
    id: number
    name: string
    type: string
  }
  items: {
    id: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  createdAt: string
  updatedAt: string
}

export interface PurchasesListResponse {
  data: PurchaseResponse[]
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

export interface PurchaseCreatedResponse {
  message: string
  transaction: PurchaseResponse
  paymentUrl?: string
  qrCode?: string
  barCode?: string
}

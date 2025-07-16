export interface PaymentData {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface PaymentResult {
  success: boolean
  externalId?: string
  error?: string
}

export interface RefundData {
  transactionExternalId: string
  amount: number
}

export interface RefundResult {
  success: boolean
  externalRefundId?: string
  response?: string
  error?: string
}

/**
 * Interface comum para todos os processadores de gateway
 */
export interface GatewayProcessorInterface {
  /**
   * Processa um pagamento
   */
  processPayment(paymentData: PaymentData): Promise<PaymentResult>

  /**
   * Processa um reembolso
   */
  refund(refundData: RefundData): Promise<RefundResult>

  /**
   * Nome do gateway
   */
  getName(): string
}

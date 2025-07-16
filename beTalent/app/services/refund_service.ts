import Gateway from '#models/gateway'
import Refund from '#models/refund'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'

interface RefundRequest {
  transactionId: string
  amount: number
  refundType: 'total' | 'partial'
  reason?: string
  userEmail: string
}

interface RefundResponse {
  success: boolean
  refundId?: string
  externalRefundId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
  gatewayResponse?: string
  gatewayUsed?: string
}

export default class RefundService {
  /**
   * Processar reembolso através dos gateways
   */
  static async processRefund(data: RefundRequest): Promise<RefundResponse> {
    try {
      const transaction = await Transaction.query()
        .where('id', data.transactionId)
        .preload('gateway')
        .preload('refunds')
        .first()

      if (!transaction) {
        return {
          success: false,
          status: 'failed',
          error: 'Transação não encontrada',
        }
      }

      if (transaction.status !== 'completed') {
        return {
          success: false,
          status: 'failed',
          error: 'Apenas transações completadas podem ser reembolsadas',
        }
      }

      const totalRefunded = transaction.refunds
        .filter((refund) => refund.status === 'completed')
        .reduce((sum, refund) => sum + Number.parseFloat(refund.amount.toString()), 0)

      const availableAmount = Number.parseFloat(transaction.amount.toString()) - totalRefunded

      if (data.refundType === 'total' && totalRefunded > 0) {
        return {
          success: false,
          status: 'failed',
          error:
            'Transação já possui reembolsos parciais. Use reembolso parcial para o valor restante.',
        }
      }

      const refundAmount = data.refundType === 'total' ? availableAmount : data.amount

      if (refundAmount > availableAmount) {
        return {
          success: false,
          status: 'failed',
          error: `Valor do reembolso (${refundAmount}) excede o valor disponível (${availableAmount})`,
        }
      }

      if (refundAmount <= 0) {
        return {
          success: false,
          status: 'failed',
          error: 'Valor do reembolso deve ser maior que zero',
        }
      }

      const refund = await Refund.create({
        transactionId: transaction.id,
        gatewayId: transaction.gateway.id,
        userEmail: data.userEmail,
        amount: refundAmount,
        originalAmount: Number.parseFloat(transaction.amount.toString()),
        refundType: data.refundType,
        reason: data.reason,
        status: 'pending',
        requestedAt: DateTime.now(),
      })

      const gatewayResult = await this.callGatewayRefund(
        transaction.gateway,
        transaction.externalId,
        refundAmount
      )

      refund.status = gatewayResult.success ? 'completed' : 'failed'
      refund.externalRefundId = gatewayResult.externalRefundId || null
      refund.gatewayResponse = gatewayResult.response || null
      refund.processedAt = DateTime.now()
      await refund.save()

      return {
        success: gatewayResult.success,
        refundId: refund.id,
        externalRefundId: gatewayResult.externalRefundId,
        status: refund.status,
        error: gatewayResult.error,
        gatewayResponse: gatewayResult.response,
        gatewayUsed: transaction.gateway.name,
      }
    } catch (error) {
      console.error('Erro ao processar reembolso:', error)
      return {
        success: false,
        status: 'failed',
        error: 'Erro interno ao processar reembolso',
      }
    }
  }

  /**
   * Chamar gateway para processar reembolso
   */
  private static async callGatewayRefund(
    gateway: Gateway,
    transactionExternalId: string,
    amount: number
  ): Promise<{
    success: boolean
    externalRefundId?: string
    response?: string
    error?: string
  }> {
    try {
      if (gateway.name === 'Gateway 1') {
        return await this.callGateway1Refund(transactionExternalId, amount)
      } else if (gateway.name === 'Gateway 2') {
        return await this.callGateway2Refund(transactionExternalId, amount)
      } else {
        return {
          success: false,
          error: `Gateway ${gateway.name} não suportado para reembolsos`,
        }
      }
    } catch (error) {
      console.error(`Erro ao chamar gateway ${gateway.name}:`, error)
      return {
        success: false,
        error: `Erro de comunicação com ${gateway.name}`,
      }
    }
  }

  /**
   * Processar reembolso no Gateway 1
   */
  private static async callGateway1Refund(
    transactionExternalId: string,
    amount: number
  ): Promise<{
    success: boolean
    externalRefundId?: string
    response?: string
    error?: string
  }> {
    try {
      const loginResponse = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'gateway1_user',
          password: 'gateway1_pass',
        }),
      })

      if (!loginResponse.ok) {
        return {
          success: false,
          error: 'Falha na autenticação com Gateway 1',
        }
      }

      const loginData = await loginResponse.json()
      const token = loginData.token

      const refundResponse = await fetch('http://localhost:3001/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transaction_id: transactionExternalId,
          amount: amount,
        }),
      })

      const refundData = await refundResponse.json()

      if (refundResponse.ok && refundData.success) {
        return {
          success: true,
          externalRefundId: refundData.refund_id,
          response: JSON.stringify(refundData),
        }
      } else {
        return {
          success: false,
          error: refundData.message || 'Erro no Gateway 1',
          response: JSON.stringify(refundData),
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Erro de conexão com Gateway 1: ${error.message}`,
      }
    }
  }

  /**
   * Processar reembolso no Gateway 2
   */
  private static async callGateway2Refund(
    transactionExternalId: string,
    amount: number
  ): Promise<{
    success: boolean
    externalRefundId?: string
    response?: string
    error?: string
  }> {
    try {
      const response = await fetch('http://localhost:3002/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'gateway2-secret-key',
          'X-Client-ID': 'gateway2-client',
        },
        body: JSON.stringify({
          transaction_id: transactionExternalId,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          externalRefundId: data.refund_id,
          response: JSON.stringify(data),
        }
      } else {
        return {
          success: false,
          error: data.message || 'Erro no Gateway 2',
          response: JSON.stringify(data),
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Erro de conexão com Gateway 2: ${error.message}`,
      }
    }
  }

  /**
   * Buscar reembolso por ID
   */
  static async getRefundById(refundId: string): Promise<Refund | null> {
    return await Refund.query()
      .where('id', refundId)
      .preload('transaction', (query) => {
        query.preload('client')
        query.preload('gateway')
        query.preload('products')
      })
      .preload('gateway')
      .first()
  }

  /**
   * Listar reembolsos com filtros
   */
  static async listRefunds(filters: {
    page?: number
    limit?: number
    status?: string
    refundType?: string
    transactionId?: string
  }) {
    const query = Refund.query()
      .preload('transaction', (query) => {
        query.preload('client')
        query.preload('gateway')
      })
      .preload('gateway')
      .orderBy('requestedAt', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.refundType) {
      query.where('refundType', filters.refundType)
    }

    if (filters.transactionId) {
      query.where('transactionId', filters.transactionId)
    }

    return await query.paginate(filters.page || 1, filters.limit || 10)
  }
}

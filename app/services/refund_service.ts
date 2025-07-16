import Refund from '#models/refund'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'
import GatewayService from './gateway_service.js'

interface RefundRequest {
  transactionId: string
  amount?: number
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

      // Calcula o valor do reembolso
      let refundAmount: number

      if (data.refundType === 'total') {
        // Para reembolso total, usa o valor disponível (total da transação menos reembolsos já processados)
        refundAmount = availableAmount
      } else {
        // Para reembolso parcial, usa o valor informado
        if (!data.amount) {
          return {
            success: false,
            status: 'failed',
            error: 'Valor é obrigatório para reembolso parcial',
          }
        }
        refundAmount = data.amount
      }

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

      const gatewayResult = await GatewayService.processRefund(transaction.gateway.id, {
        transactionExternalId: transaction.externalId,
        amount: refundAmount,
      })

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
   * Buscar reembolso por ID
   */
  static async getRefundById(refundId: string): Promise<Refund | null> {
    return await Refund.query()
      .where('id', refundId)
      .preload('transaction' as any, (query) => {
        query.preload('client')
        query.preload('gateway')
        query.preload('products')
      })
      .preload('gateway' as never)
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
      .preload('transaction' as any, (transactionQuery) => {
        transactionQuery.preload('client')
        transactionQuery.preload('gateway')
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

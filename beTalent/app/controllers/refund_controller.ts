import Refund from '#models/refund'
import RefundService from '#services/refund_service'
import {
  createRefundValidator,
  refundIndexValidator,
  refundParamsValidator,
  updateRefundStatusValidator,
} from '#validators/refund_validator'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class RefundController {
  /**
   * Criar um reembolso
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  async store({ request, response, auth }: HttpContext) {
    const trx = await db.transaction()

    try {
      const data = await request.validateUsing(createRefundValidator)

      const user = auth.user!
      const userEmail = user.email

      if (data.refundType === 'partial' && !data.amount) {
        return response.status(422).json({
          error: 'Valor é obrigatório para reembolso parcial',
        })
      }

      const refundResult = await RefundService.processRefund({
        transactionId: data.transactionId,
        amount: data.amount || 0,
        refundType: data.refundType,
        reason: data.reason,
        userEmail: userEmail,
      })

      if (!refundResult.success) {
        await trx.rollback()
        return response.status(400).json({
          error: 'Falha no processamento do reembolso',
          message: refundResult.error,
        })
      }

      await trx.commit()

      const refund = await RefundService.getRefundById(refundResult.refundId!)

      return response.status(201).json({
        message: 'Reembolso processado com sucesso',
        data: {
          refund: {
            id: refund!.id,
            amount: refund!.amount,
            refundType: refund!.refundType,
            status: refund!.status,
            externalRefundId: refund!.externalRefundId,
            reason: refund!.reason,
            userEmail: refund!.userEmail,
            requestedAt: refund!.requestedAt,
            processedAt: refund!.processedAt,
            transaction: {
              id: refund!.transaction.id,
              amount: refund!.transaction.amount,
              status: refund!.transaction.status,
              client: {
                id: refund!.transaction.client.id,
                name: refund!.transaction.client.name,
                email: refund!.transaction.client.email,
              },
            },
            gateway: {
              id: refund!.gateway.id,
              name: refund!.gateway.name,
            },
          },
          gatewayUsed: refundResult.gatewayUsed,
        },
      })
    } catch (error) {
      await trx.rollback()

      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      console.error('Erro ao processar reembolso:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  }

  /**
   * Listar reembolsos
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(refundIndexValidator)

      const refunds = await RefundService.listRefunds(filters)

      return response.json({
        message: 'Reembolsos listados com sucesso',
        data: {
          refunds: refunds.map((refund) => ({
            id: refund.id,
            amount: refund.amount,
            originalAmount: refund.originalAmount,
            refundType: refund.refundType,
            status: refund.status,
            externalRefundId: refund.externalRefundId,
            reason: refund.reason,
            userEmail: refund.userEmail,
            requestedAt: refund.requestedAt,
            processedAt: refund.processedAt,
            transaction: {
              id: refund.transaction.id,
              amount: refund.transaction.amount,
              status: refund.transaction.status,
              externalId: refund.transaction.externalId,
              client: {
                id: refund.transaction.client.id,
                name: refund.transaction.client.name,
                email: refund.transaction.client.email,
              },
              gateway: {
                id: refund.transaction.gateway.id,
                name: refund.transaction.gateway.name,
              },
            },
            gateway: {
              id: refund.gateway.id,
              name: refund.gateway.name,
            },
          })),
          meta: refunds.getMeta(),
        },
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Parâmetros inválidos',
          messages: error.messages,
        })
      }

      console.error('Erro ao listar reembolsos:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar reembolso por ID
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = await refundParamsValidator.validate(params)

      const refund = await RefundService.getRefundById(id)

      if (!refund) {
        return response.status(404).json({
          error: 'Reembolso não encontrado',
        })
      }

      return response.json({
        message: 'Reembolso encontrado',
        data: {
          id: refund.id,
          amount: refund.amount,
          originalAmount: refund.originalAmount,
          refundType: refund.refundType,
          status: refund.status,
          externalRefundId: refund.externalRefundId,
          reason: refund.reason,
          notes: refund.notes,
          userEmail: refund.userEmail,
          gatewayResponse: refund.gatewayResponse,
          requestedAt: refund.requestedAt,
          processedAt: refund.processedAt,
          createdAt: refund.createdAt,
          updatedAt: refund.updatedAt,
          transaction: {
            id: refund.transaction.id,
            amount: refund.transaction.amount,
            status: refund.transaction.status,
            externalId: refund.transaction.externalId,
            cardLastNumbers: refund.transaction.cardLastNumbers,
            createdAt: refund.transaction.createdAt,
            client: {
              id: refund.transaction.client.id,
              name: refund.transaction.client.name,
              email: refund.transaction.client.email,
            },
            gateway: {
              id: refund.transaction.gateway.id,
              name: refund.transaction.gateway.name,
            },
            products: refund.transaction.products.map((product) => ({
              id: product.id,
              name: product.name,
              unitPrice: product.amount,
              quantity: product.$extras.pivot_quantity,
              totalPrice: product.amount * product.$extras.pivot_quantity,
            })),
          },
          gateway: {
            id: refund.gateway.id,
            name: refund.gateway.name,
          },
        },
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Parâmetros inválidos',
          messages: error.messages,
        })
      }

      console.error('Erro ao buscar reembolso:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar status de reembolso (para uso interno/administrativo)
   * Acesso: Apenas ADMIN
   */
  async updateStatus({ params, request, response }: HttpContext) {
    try {
      const { id } = await refundParamsValidator.validate(params)
      const data = await request.validateUsing(updateRefundStatusValidator)

      const refund = await Refund.find(id)

      if (!refund) {
        return response.status(404).json({
          error: 'Reembolso não encontrado',
        })
      }

      refund.status = data.status
      if (data.gatewayResponse) {
        refund.gatewayResponse = data.gatewayResponse
      }
      if (data.externalRefundId) {
        refund.externalRefundId = data.externalRefundId
      }
      if (data.notes) {
        refund.notes = data.notes
      }

      if (['completed', 'failed'].includes(data.status) && !refund.processedAt) {
        refund.processedAt = new Date()
      }

      await refund.save()

      return response.json({
        message: 'Status do reembolso atualizado com sucesso',
        data: {
          id: refund.id,
          status: refund.status,
          externalRefundId: refund.externalRefundId,
          processedAt: refund.processedAt,
          updatedAt: refund.updatedAt,
        },
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      console.error('Erro ao atualizar status do reembolso:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Listar reembolsos de uma transação específica
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  async getByTransaction({ params, response }: HttpContext) {
    try {
      const { transactionId } = params

      const refunds = await Refund.query()
        .where('transactionId', transactionId)
        .preload('gateway')
        .orderBy('requestedAt', 'desc')

      return response.json({
        message: 'Reembolsos da transação listados com sucesso',
        data: refunds.map((refund) => ({
          id: refund.id,
          amount: refund.amount,
          refundType: refund.refundType,
          status: refund.status,
          externalRefundId: refund.externalRefundId,
          reason: refund.reason,
          userEmail: refund.userEmail,
          requestedAt: refund.requestedAt,
          processedAt: refund.processedAt,
          gateway: {
            id: refund.gateway.id,
            name: refund.gateway.name,
          },
        })),
      })
    } catch (error) {
      console.error('Erro ao buscar reembolsos da transação:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }
}

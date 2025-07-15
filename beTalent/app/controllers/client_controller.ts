import Client from '#models/client'
import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import { clientParamsValidator } from '../validators/client_validator.js'

export default class ClientController {
  /**
   * Buscar detalhes do cliente e todas suas compras
   * Acesso: Todos os usuários autenticados
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = await clientParamsValidator.validate(params)

      // Buscar cliente
      const client = await Client.find(id)

      if (!client) {
        return response.status(404).json({
          error: 'Cliente não encontrado',
        })
      }

      // Buscar todas as transações do cliente
      const transactions = await Transaction.query()
        .where('clientId', client.id)
        .preload('gateway')
        .preload('products')
        .orderBy('createdAt', 'desc')

      // Calcular estatísticas do cliente
      const totalPurchases = transactions.length
      const totalAmount = transactions.reduce((sum, transaction) => {
        return sum + Number.parseFloat(transaction.amount.toString())
      }, 0)

      const completedPurchases = transactions.filter((t) => t.status === 'completed').length
      const successRate = totalPurchases > 0 ? (completedPurchases / totalPurchases) * 100 : 0

      return response.json({
        message: 'Detalhes do cliente encontrados',
        data: {
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
          },
          statistics: {
            totalPurchases,
            totalAmount: totalAmount.toFixed(2),
            completedPurchases,
            successRate: successRate.toFixed(2) + '%',
          },
          purchases: transactions.map((transaction) => ({
            id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            externalId: transaction.externalId,
            cardLastNumbers: transaction.cardLastNumbers,
            createdAt: transaction.createdAt,
            gateway: {
              id: transaction.gateway.id,
              name: transaction.gateway.name,
            },
            products: transaction.products.map((product) => ({
              id: product.id,
              name: product.name,
              unitPrice: product.amount,
              quantity: product.$extras.pivot_quantity,
              totalPrice: product.amount * product.$extras.pivot_quantity,
            })),
          })),
        },
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Parâmetros inválidos',
          messages: error.messages,
        })
      }

      console.error('Erro ao buscar detalhes do cliente:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Listar todos os clientes
   * Acesso: ADMIN, MANAGER
   */
  async index({ response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const clients = await Client.query()
        .select('id', 'name', 'email', 'createdAt', 'updatedAt')
        .paginate(page, limit)

      // Para cada cliente, buscar estatísticas básicas
      const clientsWithStats = await Promise.all(
        clients.map(async (client) => {
          const transactionCount = await Transaction.query()
            .where('clientId', client.id)
            .count('* as total')

          const totalAmount = await Transaction.query()
            .where('clientId', client.id)
            .where('status', 'completed')
            .sum('amount as total')

          return {
            id: client.id,
            name: client.name,
            email: client.email,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            statistics: {
              totalPurchases: transactionCount[0].$extras.total,
              totalAmount: totalAmount[0].$extras.total || 0,
            },
          }
        })
      )

      return response.json({
        message: 'Clientes listados com sucesso',
        data: {
          clients: clientsWithStats,
          meta: clients.getMeta(),
        },
      })
    } catch (error) {
      console.error('Erro ao listar clientes:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }
}

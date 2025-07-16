import Client from '#models/client'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'
import TransactionProduct from '#models/transaction_product'
import GatewayService from '#services/gateway_service'
import PurchaseCalculationService from '#services/purchase_calculation_service'
import { createPurchaseValidator, purchaseParamsValidator } from '#validators/purchase_validator'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PurchaseController {
  async store({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const data = await request.validateUsing(createPurchaseValidator)

      const purchaseItems = PurchaseCalculationService.validatePurchaseItems(data.items)
      const calculation = await PurchaseCalculationService.calculatePurchase(purchaseItems)

      let client = await Client.findBy('email', data.client.email)
      if (!client) {
        client = await Client.create(
          {
            name: data.client.name,
            email: data.client.email,
          },
          { client: trx }
        )
      }

      const paymentResult = await GatewayService.processPayment({
        amount: calculation.totalAmount,
        name: data.client.name,
        email: data.client.email,
        cardNumber: data.payment.cardNumber,
        cvv: data.payment.cvv,
      })

      if (!paymentResult.success) {
        await trx.rollback()
        return response.status(400).json({
          error: 'Falha no processamento do pagamento',
          message: paymentResult.error,
          attempts: paymentResult.attempts,
        })
      }

      const gateway = await Gateway.find(paymentResult.gatewayId)
      if (!gateway) {
        await trx.rollback()
        return response.status(500).json({
          error: 'Gateway não encontrado',
        })
      }

      const transaction = await Transaction.create(
        {
          clientId: client.id,
          gatewayId: gateway.id,
          externalId: paymentResult.externalId || '',
          status: 'completed',
          amount: calculation.totalAmount,
          cardLastNumbers: data.payment.cardNumber.slice(-4),
        },
        { client: trx }
      )

      for (const item of calculation.items) {
        await TransactionProduct.create(
          {
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
          },
          { client: trx }
        )
      }

      await trx.commit()

      await transaction.load('client')
      await transaction.load('gateway')
      await transaction.load('products')

      return response.status(201).json({
        message: 'Compra realizada com sucesso',
        data: {
          transaction: {
            id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            externalId: transaction.externalId,
            cardLastNumbers: transaction.cardLastNumbers,
            createdAt: transaction.createdAt,
            client: {
              name: transaction.client.name,
              email: transaction.client.email,
            },
            gateway: {
              name: transaction.gateway.name,
            },
            products: transaction.products.map((product) => ({
              id: product.id,
              name: product.name,
              unitPrice: product.amount.toString(),
              quantity: product.$extras.pivot_quantity,
              totalPrice: product.amount * product.$extras.pivot_quantity,
            })),
          },
          calculation: {
            items: calculation.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              unitPrice: item.unitPrice.toString(),
              quantity: item.quantity,
              totalPrice: item.totalPrice,
            })),
            totalAmount: calculation.totalAmount,
          },
          paymentAttempts: paymentResult.attempts.map((attempt) => ({
            gatewayName: attempt.gatewayName,
            success: attempt.success,
          })),
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

      console.error('Erro ao processar compra:', error)

      return response.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const { id } = await purchaseParamsValidator.validate(params)

      const transaction = await Transaction.query()
        .where('id', id)
        .preload('client')
        .preload('gateway')
        .preload('products')
        .first()

      if (!transaction) {
        return response.status(404).json({
          error: 'Transação não encontrada',
        })
      }

      return response.json({
        message: 'Transação encontrada',
        data: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          externalId: transaction.externalId,
          cardLastNumbers: transaction.cardLastNumbers,
          createdAt: transaction.createdAt,
          client: {
            id: transaction.client.id,
            name: transaction.client.name,
            email: transaction.client.email,
          },
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
        },
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Parâmetros inválidos',
          messages: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  async index({ response }: HttpContext) {
    try {
      const transactions = await Transaction.query()
        .preload('client')
        .preload('gateway')
        .preload('products')
        .orderBy('createdAt', 'desc')

      return response.json({
        message: 'Transações listadas com sucesso',
        data: transactions.map((transaction) => ({
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          externalId: transaction.externalId,
          cardLastNumbers: transaction.cardLastNumbers,
          createdAt: transaction.createdAt,
          client: {
            id: transaction.client.id,
            name: transaction.client.name,
            email: transaction.client.email,
          },
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
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }
}

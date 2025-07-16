import Gateway from '#models/gateway'
import GatewayFactory from './gateways/gateway_factory.js'

export interface PaymentData {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
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

export interface PaymentResult {
  success: boolean
  gatewayId: string
  gatewayName: string
  externalId?: string
  error?: string
  attempts: Array<{
    gatewayId: string
    gatewayName: string
    success: boolean
    error?: string
  }>
}

export default class GatewayService {
  static async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    if (gateways.length === 0) {
      throw new Error('Nenhum gateway de pagamento ativo encontrado')
    }

    const attempts: PaymentResult['attempts'] = []

    for (const gateway of gateways) {
      try {
        if (!GatewayFactory.isGatewayRegistered(gateway.name)) {
          attempts.push({
            gatewayId: gateway.id,
            gatewayName: gateway.name,
            success: false,
            error: `Gateway '${gateway.name}' não está implementado`,
          })
          continue
        }

        const processor = GatewayFactory.createProcessor(gateway.name)
        const result = await processor.processPayment(paymentData)

        if (result.success) {
          attempts.push({
            gatewayId: gateway.id,
            gatewayName: gateway.name,
            success: true,
          })

          return {
            success: true,
            gatewayId: gateway.id,
            gatewayName: gateway.name,
            externalId: result.externalId,
            attempts,
          }
        } else {
          attempts.push({
            gatewayId: gateway.id,
            gatewayName: gateway.name,
            success: false,
            error: result.error,
          })
        }
      } catch (error) {
        attempts.push({
          gatewayId: gateway.id,
          gatewayName: gateway.name,
          success: false,
          error: error.message,
        })
      }
    }

    return {
      success: false,
      gatewayId: '',
      gatewayName: '',
      error: 'Todos os gateways de pagamento falharam',
      attempts,
    }
  }

  static async processRefund(gatewayId: string, refundData: RefundData): Promise<RefundResult> {
    try {
      const gateway = await Gateway.find(gatewayId)

      if (!gateway) {
        return {
          success: false,
          error: 'Gateway não encontrado',
        }
      }

      if (!gateway.isActive) {
        return {
          success: false,
          error: 'Gateway não está ativo',
        }
      }

      if (!GatewayFactory.isGatewayRegistered(gateway.name)) {
        return {
          success: false,
          error: `Gateway '${gateway.name}' não está implementado`,
        }
      }

      const processor = GatewayFactory.createProcessor(gateway.name)
      return await processor.refund(refundData)
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  static registerGatewayProcessor(gatewayName: string, processorFactory: () => any): void {
    GatewayFactory.registerProcessor(gatewayName, processorFactory)
  }

  static getImplementedGateways(): string[] {
    return GatewayFactory.getRegisteredGateways()
  }
}

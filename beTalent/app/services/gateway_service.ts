import Gateway from '#models/gateway'
import axios from 'axios'

export interface PaymentData {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
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
  /**
   * Processa um pagamento tentando os gateways em ordem de prioridade
   */
  static async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // Buscar gateways ativos ordenados por prioridade (menor prioridade = maior precedência)
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    if (gateways.length === 0) {
      throw new Error('Nenhum gateway de pagamento ativo encontrado')
    }

    const attempts: PaymentResult['attempts'] = []

    // Tentar cada gateway em ordem de prioridade
    for (const gateway of gateways) {
      try {
        console.log(`Tentando pagamento no ${gateway.name} (prioridade ${gateway.priority})...`)

        const result = await this.callGateway(gateway, paymentData)

        attempts.push({
          gatewayId: gateway.id,
          gatewayName: gateway.name,
          success: true,
        })

        // Se o pagamento foi bem-sucedido, retornar imediatamente
        return {
          success: true,
          gatewayId: gateway.id,
          gatewayName: gateway.name,
          externalId: result.externalId,
          attempts,
        }
      } catch (error) {
        console.log(`Erro no ${gateway.name}:`, error.message)

        attempts.push({
          gatewayId: gateway.id,
          gatewayName: gateway.name,
          success: false,
          error: error.message,
        })

        // Continuar para o próximo gateway
        continue
      }
    }

    // Se chegou aqui, todos os gateways falharam
    return {
      success: false,
      gatewayId: '',
      gatewayName: '',
      error: 'Todos os gateways de pagamento falharam',
      attempts,
    }
  }

  /**
   * Chama um gateway específico para processar o pagamento
   */
  private static async callGateway(
    gateway: Gateway,
    paymentData: PaymentData
  ): Promise<{ externalId: string }> {
    if (gateway.name === 'Gateway 1') {
      return this.callGateway1(paymentData)
    } else if (gateway.name === 'Gateway 2') {
      return this.callGateway2(paymentData)
    } else {
      throw new Error(`Gateway ${gateway.name} não implementado`)
    }
  }

  /**
   * Integração com Gateway 1 (localhost:3001)
   */
  private static async callGateway1(paymentData: PaymentData): Promise<{ externalId: string }> {
    try {
      // Primeiro fazer login para obter o token
      const loginResponse = await axios.post('http://localhost:3001/login', {
        email: 'dev@betalent.tech',
        token: 'FEC9BB078BF338F464F96B48089EB498',
      })

      const token = loginResponse.data.token

      // Criar a transação
      const transactionResponse = await axios.post(
        'http://localhost:3001/transactions',
        {
          amount: Math.round(paymentData.amount * 100), // Converter para centavos
          name: paymentData.name,
          email: paymentData.email,
          cardNumber: paymentData.cardNumber,
          cvv: paymentData.cvv,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        externalId: transactionResponse.data.id || transactionResponse.data.transaction_id,
      }
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Gateway 1 Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        )
      }
      throw new Error(`Gateway 1 Connection Error: ${error.message}`)
    }
  }

  /**
   * Integração com Gateway 2 (localhost:3002)
   */
  private static async callGateway2(paymentData: PaymentData): Promise<{ externalId: string }> {
    try {
      const response = await axios.post(
        'http://localhost:3002/transacoes',
        {
          valor: Math.round(paymentData.amount * 100), // Converter para centavos
          nome: paymentData.name,
          email: paymentData.email,
          numeroCartao: paymentData.cardNumber,
          cvv: paymentData.cvv,
        },
        {
          headers: {
            'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
            'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        externalId: response.data.id || response.data.transacao_id,
      }
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Gateway 2 Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        )
      }
      throw new Error(`Gateway 2 Connection Error: ${error.message}`)
    }
  }

  /**
   * Adiciona um novo gateway de forma modular
   */
  static registerGateway(
    gatewayName: string,
    handler: (paymentData: PaymentData) => Promise<{ externalId: string }>
  ) {
    // Esta função permite adicionar novos gateways de forma modular
    // Por enquanto é um placeholder para demonstrar a extensibilidade
    console.log(`Gateway ${gatewayName} registrado`)
  }
}

import {
  GatewayProcessorInterface,
  PaymentData,
  PaymentResult,
  RefundData,
  RefundResult,
} from '#interfaces/gateway_processor_interface'
import env from '#start/env'
import axios from 'axios'

export default class Gateway1Processor implements GatewayProcessorInterface {
  private readonly baseUrl = env.get('GATEWAY1_URL')
  private readonly credentials = {
    email: env.get('GATEWAY1_EMAIL'),
    token: env.get('GATEWAY1_TOKEN'),
  }

  getName(): string {
    return 'Gateway 1'
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const token = await this.authenticate()

      const transactionResponse = await axios.post(
        `${this.baseUrl}/transactions`,
        {
          amount: Math.round(paymentData.amount * 100),
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
        success: true,
        externalId: transactionResponse.data.id || transactionResponse.data.transaction_id,
      }
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      }
    }
  }

  async refund(refundData: RefundData): Promise<RefundResult> {
    try {
      const token = await this.authenticate()

      const refundResponse = await axios.post(
        `${this.baseUrl}/transactions/${refundData.transactionExternalId}/charge_back`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const refundResponseData = refundResponse.data

      if (refundResponse.status === 201) {
        return {
          success: true,
          externalRefundId: refundResponseData.id,
          response: JSON.stringify(refundResponseData),
        }
      } else {
        return {
          success: false,
          error: refundResponseData.message || 'Erro no Gateway 1',
          response: JSON.stringify(refundResponseData),
        }
      }
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      }
    }
  }

  private async authenticate(): Promise<string> {
    try {
      const loginResponse = await axios.post(`${this.baseUrl}/login`, this.credentials)

      if (!loginResponse.data.token) {
        throw new Error('Token não retornado na autenticação')
      }

      return loginResponse.data.token
    } catch (error) {
      throw new Error(`Falha na autenticação com Gateway 1: ${this.formatError(error)}`)
    }
  }

  private formatError(error: any): string {
    if (error.response) {
      return `${error.response.status} - ${JSON.stringify(error.response.data)}`
    }
    return error.message || 'Erro desconhecido'
  }
}

import {
  GatewayProcessorInterface,
  PaymentData,
  PaymentResult,
  RefundData,
  RefundResult,
} from '#interfaces/gateway_processor_interface'
import axios from 'axios'

export default class Gateway2Processor implements GatewayProcessorInterface {
  private readonly baseUrl = 'http://localhost:3002'
  private readonly headers = {
    'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
    'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
    'Content-Type': 'application/json',
  }

  getName(): string {
    return 'Gateway 2'
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transacoes`,
        {
          valor: Math.round(paymentData.amount * 100),
          nome: paymentData.name,
          email: paymentData.email,
          numeroCartao: paymentData.cardNumber,
          cvv: paymentData.cvv,
        },
        {
          headers: {
            ...this.headers,
          },
        }
      )

      return {
        success: true,
        externalId: response.data.id || response.data.transacao_id,
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
      const response = await axios.post(
        `${this.baseUrl}/transacoes/reembolso`,
        {
          transaction_id: refundData.transactionExternalId,
        },
        {
          headers: this.headers,
        }
      )

      const responseData = response.data

      if (response.status === 200) {
        return {
          success: true,
          externalRefundId: responseData?.refund_id || new Date(),
          response: JSON.stringify(responseData),
        }
      } else {
        return {
          success: false,
          error: responseData.message || 'Erro no Gateway 2',
          response: JSON.stringify(responseData),
        }
      }
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
      }
    }
  }

  private formatError(error: any): string {
    if (error.response) {
      return `${error.response.status} - ${JSON.stringify(error.response.data)}`
    }
    return error.message || 'Erro desconhecido'
  }
}

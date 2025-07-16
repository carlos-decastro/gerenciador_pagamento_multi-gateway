import { GatewayProcessorInterface } from '#interfaces/gateway_processor_interface'
import Gateway1Processor from './gateway1_processor.js'
import Gateway2Processor from './gateway2_processor.js'

export default class GatewayFactory {
  private static processors = new Map<string, () => GatewayProcessorInterface>([
    ['Gateway 1', () => new Gateway1Processor()],
    ['Gateway 2', () => new Gateway2Processor()],
  ])

  /**
   * Cria uma instância do processador do gateway pelo nome
   */
  static createProcessor(gatewayName: string): GatewayProcessorInterface {
    const processorFactory = this.processors.get(gatewayName)

    if (!processorFactory) {
      throw new Error(`Gateway '${gatewayName}' não está implementado`)
    }

    return processorFactory()
  }

  static registerProcessor(
    gatewayName: string,
    processorFactory: () => GatewayProcessorInterface
  ): void {
    this.processors.set(gatewayName, processorFactory)
  }

  static getRegisteredGateways(): string[] {
    return Array.from(this.processors.keys())
  }

  static isGatewayRegistered(gatewayName: string): boolean {
    return this.processors.has(gatewayName)
  }
}

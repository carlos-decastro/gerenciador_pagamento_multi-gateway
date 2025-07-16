import GatewayService from './gateway_service.js'
import Gateway1Processor from './gateways/gateway1_processor.js'
import Gateway2Processor from './gateways/gateway2_processor.js'

/**
 * Inicializa e registra todos os processadores de gateway disponíveis
 */
export default class GatewayInitializer {
  /**
   * Registra todos os processadores de gateway
   */
  static initialize(): void {
    // Registra o Gateway 1
    GatewayService.registerGatewayProcessor('Gateway 1', () => new Gateway1Processor())

    // Registra o Gateway 2
    GatewayService.registerGatewayProcessor('Gateway 2', () => new Gateway2Processor())

    console.info(new Date(), 'Gateways registrados:', GatewayService.getImplementedGateways())
  }

  /**
   * Verifica se todos os gateways necessários estão registrados
   */
  static validateGateways(): boolean {
    const requiredGateways = ['Gateway 1', 'Gateway 2']
    const implementedGateways = GatewayService.getImplementedGateways()

    for (const gateway of requiredGateways) {
      if (!implementedGateways.includes(gateway)) {
        console.error(`Gateway '${gateway}' não está registrado`)
        return false
      }
    }

    return true
  }
}

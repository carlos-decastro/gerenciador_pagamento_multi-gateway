import Gateway from '#models/gateway'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Limpar gateways existentes
    await Gateway.query().delete()

    // Criar apenas os dois gateways necessários
    await Gateway.createMany([
      {
        name: 'Gateway 1',
        isActive: true,
        priority: 1,
      },
      {
        name: 'Gateway 2',
        isActive: true,
        priority: 2,
      },
    ])
  }
}

import Gateway from '#models/gateway'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Gateway.query().delete()

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

import Gateway from './app/models/gateway.js'
import { Database } from '@adonisjs/lucid/database'

// Limpar todos os gateways existentes
await Gateway.query().delete()

// Criar os dois gateways principais
const gateway1 = await Gateway.create({
  name: 'Gateway 1',
  isActive: true,
  priority: 1
})

const gateway2 = await Gateway.create({
  name: 'Gateway 2', 
  isActive: true,
  priority: 2
})

console.log('Gateways criados:')
console.log('Gateway 1:', gateway1.toJSON())
console.log('Gateway 2:', gateway2.toJSON())

process.exit(0)
import { BaseModel, beforeSave, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Client from './client.js'
import Gateway from './gateway.js'
import Product from './product.js'

export default class Transaction extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare clientId: string

  @column()
  declare gatewayId: string

  @column()
  declare externalId: string

  @column()
  declare status: string

  @column()
  declare amount: number

  @column()
  declare cardLastNumbers: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
  })
  declare products: ManyToMany<typeof Product>

  @beforeSave()
  public static async assignUuid(transaction: Transaction) {
    if (!transaction.id) {
      transaction.id = randomUUID().toString()
    }
  }
}

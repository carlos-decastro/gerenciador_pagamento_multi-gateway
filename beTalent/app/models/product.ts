import { BaseModel, beforeSave, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Transaction from './transaction.js'

export default class Product extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare amount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
  })
  declare transactions: ManyToMany<typeof Transaction>

  @beforeSave()
  public static async assignUuid(product: Product) {
    if (!product.id) {
      product.id = randomUUID().toString()
    }
  }
}

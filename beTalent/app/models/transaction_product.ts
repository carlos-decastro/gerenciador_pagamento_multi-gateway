import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Product from './product.js'
import Transaction from './transaction.js'

export default class TransactionProduct extends BaseModel {
  public static table = 'transaction_products'

  @column({ isPrimary: true })
  declare transactionId: string

  @column({ isPrimary: true })
  declare productId: string

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}

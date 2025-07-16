import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Gateway from './gateway.js'
import Transaction from './transaction.js'

export default class Refund extends BaseModel {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare transactionId: string

  @column()
  declare gatewayId: string

  @column()
  declare userEmail: string

  @column()
  declare amount: number

  @column()
  declare originalAmount: number

  @column()
  declare refundType: 'total' | 'partial'

  @column()
  declare externalRefundId: string | null

  @column()
  declare status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

  @column()
  declare reason: string | null

  @column()
  declare gatewayResponse: string | null

  @column()
  declare notes: string | null

  @column.dateTime()
  declare requestedAt: DateTime

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>

  @beforeSave()
  public static async assignUuid(refund: Refund) {
    if (!refund.id) {
      refund.id = randomUUID().toString()
    }
  }
}

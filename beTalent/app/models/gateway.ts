import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Transaction from './transaction.js'

export default class Gateway extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column()
  declare priority: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @beforeSave()
  public static async assignUuid(gateway: Gateway) {
    if (!gateway.id) {
      gateway.id = randomUUID().toString()
    }
  }
}

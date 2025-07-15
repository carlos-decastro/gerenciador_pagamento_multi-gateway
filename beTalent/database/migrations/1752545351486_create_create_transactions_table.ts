import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('client_id').references('id').inTable('clients').onDelete('RESTRICT')

      table.uuid('gateway_id').references('id').inTable('gateways').onDelete('RESTRICT')

      table.string('external_id', 255).notNullable().unique()
      table.string('status', 255).notNullable().index()
      table.decimal('amount', 10, 2).notNullable()
      table.string('card_last_numbers', 4).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

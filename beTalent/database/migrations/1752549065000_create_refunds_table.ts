import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refunds'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('transaction_id').references('id').inTable('transactions').onDelete('RESTRICT')
      table.uuid('gateway_id').references('id').inTable('gateways').onDelete('RESTRICT')
      table.string('user_email').notNullable().comment('Email do usuário que realizou o estorno')
      table.decimal('amount', 10, 2).notNullable().comment('Valor do reembolso')
      table.decimal('original_amount', 10, 2).notNullable().comment('Valor original da transação')
      table.enum('refund_type', ['total', 'partial']).notNullable().comment('Tipo de reembolso: total ou parcial')
      table.string('external_refund_id').nullable().comment('ID do reembolso no gateway externo')
      table.enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled']).defaultTo('pending').comment('Status do reembolso')
      table.text('reason').nullable().comment('Motivo do reembolso')
      table.text('gateway_response').nullable().comment('Resposta do gateway')
      table.text('notes').nullable().comment('Observações adicionais')
      table.timestamp('requested_at').defaultTo(this.now()).comment('Data e hora da solicitação')
      table.timestamp('processed_at').nullable().comment('Data e hora do processamento')
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Índices
      table.index(['transaction_id'])
      table.index(['gateway_id'])
      table.index(['user_email'])
      table.index(['status'])
      table.index(['refund_type'])
      table.index(['requested_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
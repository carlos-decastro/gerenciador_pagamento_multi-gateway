import hash from '@adonisjs/core/services/hash'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Inserir usuário admin padrão
    const hashedPassword = await hash.make('admin123')

    await this.db.table(this.tableName).insert({
      full_name: 'Administrador',
      email: 'admin@betalent.com',
      password: hashedPassword,
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date(),
    })
  }

  async down() {
    // Remover usuário admin
    await this.db.from(this.tableName).where('email', 'admin@betalent.com').delete()
  }
}

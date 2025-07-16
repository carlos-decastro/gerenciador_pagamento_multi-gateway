import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await db.from('users').whereNot('email', 'admin@betalent.com').delete()

    const users = [
      {
        full_name: 'Manager Teste',
        email: 'manager@betalent.com',
        password: await hash.make('manager123'),
        role: 'MANAGER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        full_name: 'Finance Teste',
        email: 'finance@betalent.com',
        password: await hash.make('finance123'),
        role: 'FINANCE',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        full_name: 'User Teste',
        email: 'user@betalent.com',
        password: await hash.make('user123'),
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.table('users').insert(users)
  }
}

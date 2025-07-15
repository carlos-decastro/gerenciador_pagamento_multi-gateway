import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class ProductSeeder extends BaseSeeder {
  async run() {
    // Limpar produtos existentes
    await Product.query().delete()

    // Criar novos produtos
    await Product.createMany([
      {
        name: 'Produto 1',
        amount: 100.5,
      },
      {
        name: 'Produto 2',
        amount: 50.25,
      },
      {
        name: 'Produto 3',
        amount: 75.0,
      },
    ])

    console.log('Produtos criados com sucesso!')
  }
}

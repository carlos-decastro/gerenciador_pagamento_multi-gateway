import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class ProductSeeder extends BaseSeeder {
  async run() {
    await Product.query().delete()

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
  }
}

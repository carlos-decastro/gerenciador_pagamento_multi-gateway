import Product from '#models/product'
import {
  createProductValidator,
  productParamsValidator,
  productQueryValidator,
  updateProductValidator,
} from '#validators/product_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductController {
  /**
   * Listar todos os produtos
   * Acesso: Todos os usuários autenticados
   */
  async index({ request, response }: HttpContext) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = await request.validateUsing(productQueryValidator)

      const query = Product.query()

      if (search) {
        query.where('name', 'LIKE', `%${search}%`)
      }

      query.orderBy(sortBy, sortOrder)

      const products = await query.paginate(page, limit)

      return response.json({
        message: 'Produtos listados com sucesso',
        data: products,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar produto por ID
   * Acesso: Todos os usuários autenticados
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = await productParamsValidator.validate(params)

      const product = await Product.find(id)

      if (!product) {
        return response.status(404).json({
          error: 'Produto não encontrado',
        })
      }

      return response.json({
        message: 'Produto encontrado',
        data: product,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Criar novo produto
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createProductValidator)

      const product = await Product.create({
        name: data.name,
        amount: data.amount,
      })

      return response.status(201).json({
        message: 'Produto criado com sucesso',
        data: product,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      if (error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return response.status(409).json({
          error: 'Já existe um produto com este nome',
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar produto
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const { id } = await productParamsValidator.validate(params)
      const data = await request.validateUsing(updateProductValidator)

      const product = await Product.find(id)
      if (!product) {
        return response.status(404).json({
          error: 'Produto não encontrado',
        })
      }

      if (data.name !== undefined) product.name = data.name
      if (data.amount !== undefined) product.amount = data.amount

      await product.save()

      return response.json({
        message: 'Produto atualizado com sucesso',
        data: product,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      if (error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return response.status(409).json({
          error: 'Já existe um produto com este nome',
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Deletar produto
   * Acesso: ADMIN, MANAGER
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const { id } = await productParamsValidator.validate(params)

      const product = await Product.find(id)
      if (!product) {
        return response.status(404).json({
          error: 'Produto não encontrado',
        })
      }

      await product.load('transactions')
      if (product.transactions.length > 0) {
        return response.status(400).json({
          error: 'Não é possível deletar produto que possui transações associadas',
          details: `Este produto possui ${product.transactions.length} transação(ões) associada(s)`,
        })
      }

      await product.delete()

      return response.json({
        message: 'Produto deletado com sucesso',
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          error: 'Dados inválidos',
          messages: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar produtos por nome (busca avançada)
   * Acesso: Todos os usuários autenticados
   */
  async search({ request, response }: HttpContext) {
    try {
      const { search } = request.only(['search'])

      if (!search || search.trim().length < 2) {
        return response.status(400).json({
          error: 'Termo de busca deve ter pelo menos 2 caracteres',
        })
      }

      const products = await Product.query()
        .where('name', 'LIKE', `%${search.trim()}%`)
        .orderBy('name', 'asc')
        .limit(20)

      return response.json({
        message: 'Busca realizada com sucesso',
        data: products,
        total: products.length,
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Debug middleware para rastrear todas as requisições
 */
export default class DebugMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    console.log('🚀 DebugMiddleware - Nova requisição:', {
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      timestamp: new Date().toISOString(),
    })

    try {
      console.log('🔄 DebugMiddleware - Chamando próximo middleware...')
      const result = await next()
      console.log('✅ DebugMiddleware - Requisição processada com sucesso')
      console.log('📤 DebugMiddleware - Response status:', response.getStatus())
      console.log('📤 DebugMiddleware - Response headers:', response.getHeaders())
      return result
    } catch (error) {
      console.log('❌ DebugMiddleware - Erro durante processamento:', error)
      throw error
    }
  }
}

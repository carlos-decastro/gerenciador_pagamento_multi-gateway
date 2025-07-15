import { UserRole } from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware para validar roles específicas para operações de produtos
 */
export default class ProductRoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles?: UserRole[]
      action?: 'read' | 'write' | 'delete'
    } = {}
  ) {
    // Verificar se o usuário está autenticado
    if (!ctx.auth.user) {
      return ctx.response.status(401).json({
        error: 'Usuário não autenticado',
      })
    }

    const user = ctx.auth.user
    const { roles, action = 'read' } = options

    // Se não foram especificadas roles, permitir acesso (apenas autenticado)
    if (!roles || roles.length === 0) {
      return next()
    }

    // Verificar se o usuário tem uma das roles permitidas
    if (!roles.includes(user.role)) {
      return ctx.response.status(403).json({
        error: 'Acesso negado',
        message: `Operação '${action}' requer uma das seguintes permissões: ${roles.join(', ')}`,
        userRole: user.role,
      })
    }

    return next()
  }

  /**
   * Middleware para operações de leitura (index, show, search)
   * Acesso: Todos os usuários autenticados
   */
  static read() {
    return new ProductRoleMiddleware().handle.bind(
      new ProductRoleMiddleware(),
      {} as HttpContext,
      {} as NextFn,
      { action: 'read' }
    )
  }

  /**
   * Middleware para operações de escrita (store, update)
   * Acesso: ADMIN, MANAGER, FINANCE
   */
  static write() {
    return new ProductRoleMiddleware().handle.bind(
      new ProductRoleMiddleware(),
      {} as HttpContext,
      {} as NextFn,
      {
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE],
        action: 'write',
      }
    )
  }

  /**
   * Middleware para operações de exclusão (destroy)
   * Acesso: ADMIN, MANAGER
   */
  static delete() {
    return new ProductRoleMiddleware().handle.bind(
      new ProductRoleMiddleware(),
      {} as HttpContext,
      {} as NextFn,
      {
        roles: [UserRole.ADMIN, UserRole.MANAGER],
        action: 'delete',
      }
    )
  }
}

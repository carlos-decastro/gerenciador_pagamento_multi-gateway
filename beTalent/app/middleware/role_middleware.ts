import { UserRole } from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware para verificar roles de usuário
 */
export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles?: UserRole[]
    } = {}
  ) {
    const { auth, response } = ctx

    try {
      const user = auth.getUserOrFail()

      if (!options.roles || options.roles.length === 0) {
        return next()
      }

      if (!options.roles.includes(user.role)) {
        return response.status(403).json({
          error: 'Acesso negado. Você não tem permissão para acessar este recurso.',
          required_roles: options.roles,
          your_role: user.role,
        })
      }

      return next()
    } catch (error) {
      return response.status(401).json({
        error: 'Token de autenticação inválido ou expirado',
      })
    }
  }
}

/**
 * Funções auxiliares para facilitar o uso do middleware
 */
export const roleMiddleware = {
  /**
   * Permite apenas ADMIN
   */
  admin: () => ({
    roles: [UserRole.ADMIN],
  }),

  /**
   * Permite ADMIN e MANAGER
   */
  adminOrManager: () => ({
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  }),

  /**
   * Permite ADMIN, MANAGER e FINANCE
   */
  adminManagerOrFinance: () => ({
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE],
  }),

  /**
   * Permite qualquer usuário autenticado
   */
  authenticated: () => ({
    roles: Object.values(UserRole),
  }),

  /**
   * Permite roles customizadas
   */
  custom: (roles: UserRole[]) => ({
    roles,
  }),
}

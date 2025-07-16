import User from '#models/user'
import env from '#start/env'
import { loginValidator } from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Login do usuário - Rota pública
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.findBy('email', email)

      if (!user) {
        return response.status(401).json({
          error: 'Credenciais inválidas',
        })
      }

      const isPasswordValid = await hash.verify(user.password, password)

      if (!isPasswordValid) {
        return response.status(401).json({
          error: 'Credenciais inválidas',
        })
      }

      const token = await User.accessTokens.create(user, ['*'], {
        name: `${user.email} - Login Session`,
        expiresIn: env.get('TOKEN_EXPIRATION_TIME'),
      })

      return response.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token: {
          type: 'Bearer',
          value: token.value!.release(),
        },
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
   * Logout do usuário - Rota protegida
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const token = auth.user?.currentAccessToken

      if (token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.json({
        message: 'Logout realizado com sucesso',
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter informações do usuário autenticado - Rota protegida
   */
  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      return response.status(401).json({
        error: 'Usuário não autenticado',
      })
    }
  }
}

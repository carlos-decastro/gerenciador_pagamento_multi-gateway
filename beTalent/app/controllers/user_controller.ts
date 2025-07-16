import User, { UserRole } from '#models/user'
import {
  createUserValidator,
  updateUserValidator,
  userParamsValidator,
} from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class UserController {
  /**
   * Listar todos os usuários
   * Acesso: ADMIN, MANAGER
   */
  async index({ response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = Math.min(request.input('limit', 10), 100)

      const users = await User.query()
        .select('id', 'fullName', 'email', 'role', 'createdAt', 'updatedAt')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      const responseData = {
        message: 'Usuários listados com sucesso',
        data: users,
      }

      return response.json(responseData)
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message,
      })
    }
  }

  /**
   * Buscar usuário por ID
   * Acesso: ADMIN, MANAGER, próprio usuário
   */
  async show({ params, response, auth }: HttpContext) {
    try {
      const { id } = await userParamsValidator.validate(params)
      const currentUser = auth.getUserOrFail()

      if (currentUser.id !== id && !['ADMIN', 'MANAGER'].includes(currentUser.role)) {
        return response.status(403).json({
          error: 'Acesso negado',
        })
      }

      const user = await User.query()
        .select('id', 'fullName', 'email', 'role', 'createdAt', 'updatedAt')
        .where('id', id)
        .first()

      if (!user) {
        return response.status(404).json({
          error: 'Usuário não encontrado',
        })
      }

      return response.json({
        message: 'Usuário encontrado',
        data: user,
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
   * Criar novo usuário
   * Acesso: ADMIN, MANAGER
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const currentUser = auth.getUserOrFail()
      const data = await request.validateUsing(createUserValidator)

      const role = data.role || UserRole.USER

      if (currentUser.role === 'MANAGER' && ['ADMIN', 'MANAGER'].includes(role)) {
        return response.status(403).json({
          error: 'Managers não podem criar usuários ADMIN ou MANAGER',
        })
      }

      const hashedPassword = await hash.make(data.password)

      const user = await User.create({
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: role,
      })

      return response.status(201).json({
        message: 'Usuário criado com sucesso',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
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
   * Atualizar usuário
   * Acesso: ADMIN, MANAGER, próprio usuário (limitado)
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const { id } = await userParamsValidator.validate(params)
      const currentUser = auth.getUserOrFail()
      const data = await request.validateUsing(updateUserValidator)

      const user = await User.find(id)
      if (!user) {
        return response.status(404).json({
          error: 'Usuário não encontrado',
        })
      }

      const isOwnProfile = currentUser.id === user.id
      const canManageUsers = ['ADMIN', 'MANAGER'].includes(currentUser.role)

      if (!isOwnProfile && !canManageUsers) {
        return response.status(403).json({
          error: 'Acesso negado',
        })
      }

      if (isOwnProfile && !canManageUsers) {
        if (data.role) {
          return response.status(403).json({
            error: 'Você não pode alterar sua própria role',
          })
        }
      }

      if (currentUser.role === 'MANAGER' && data.role && ['ADMIN', 'MANAGER'].includes(data.role)) {
        return response.status(403).json({
          error: 'Managers não podem definir roles ADMIN ou MANAGER',
        })
      }

      if (data.fullName) user.fullName = data.fullName
      if (data.email) user.email = data.email
      if (data.password) user.password = await hash.make(data.password)
      if (data.role && canManageUsers) user.role = data.role

      await user.save()

      return response.json({
        message: 'Usuário atualizado com sucesso',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt,
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
   * Deletar usuário
   * Acesso: ADMIN apenas
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const { id } = await userParamsValidator.validate(params)
      const currentUser = auth.getUserOrFail()

      if (currentUser.role !== 'ADMIN') {
        return response.status(403).json({
          error: 'Apenas administradores podem deletar usuários',
        })
      }

      const user = await User.find(id)
      if (!user) {
        return response.status(404).json({
          error: 'Usuário não encontrado',
        })
      }

      if (currentUser.id === user.id) {
        return response.status(400).json({
          error: 'Você não pode deletar sua própria conta',
        })
      }

      await user.delete()

      return response.json({
        message: 'Usuário deletado com sucesso',
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
}

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
      const limit = request.input('limit', 10)

      const users = await User.query()
        .select('id', 'fullName', 'email', 'role', 'createdAt', 'updatedAt')
        .paginate(page, limit)

      return response.json({
        message: 'Usuários listados com sucesso',
        data: users,
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
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

      // Verificar se é o próprio usuário ou tem permissão
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

      // Definir role padrão se não fornecida
      const role = data.role || UserRole.USER

      // Verificar se pode criar usuário com a role especificada
      if (currentUser.role === 'MANAGER' && ['ADMIN', 'MANAGER'].includes(role)) {
        return response.status(403).json({
          error: 'Managers não podem criar usuários ADMIN ou MANAGER',
        })
      }

      // Hash da senha
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

      // Verificar permissões
      const isOwnProfile = currentUser.id === user.id
      const canManageUsers = ['ADMIN', 'MANAGER'].includes(currentUser.role)

      if (!isOwnProfile && !canManageUsers) {
        return response.status(403).json({
          error: 'Acesso negado',
        })
      }

      // Usuários comuns só podem alterar seus próprios dados básicos
      if (isOwnProfile && !canManageUsers) {
        if (data.role) {
          return response.status(403).json({
            error: 'Você não pode alterar sua própria role',
          })
        }
      }

      // Managers não podem alterar roles para ADMIN ou MANAGER
      if (currentUser.role === 'MANAGER' && data.role && ['ADMIN', 'MANAGER'].includes(data.role)) {
        return response.status(403).json({
          error: 'Managers não podem definir roles ADMIN ou MANAGER',
        })
      }

      // Atualizar dados
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

      // Apenas ADMIN pode deletar usuários
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

      // Não permitir que o admin delete a si mesmo
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

import Gateway from '#models/gateway'
import type { HttpContext } from '@adonisjs/core/http'
import {
  createGatewayValidator,
  gatewayParamsValidator,
  updateGatewayPriorityValidator,
  updateGatewayStatusValidator,
} from '../validators/gateway.js'

export default class GatewayController {
  async index({ response }: HttpContext) {
    try {
      const gateways = await Gateway.query().orderBy('priority', 'desc')

      return response.json({
        message: 'Gateways listados com sucesso',
        data: gateways,
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createGatewayValidator)

      const existingGateway = await Gateway.findBy('name', data.name)
      if (existingGateway) {
        return response.status(409).json({
          error: 'Já existe um gateway com este nome',
          existing_gateway: {
            id: existingGateway.id,
            name: existingGateway.name,
          },
        })
      }

      if (data.priority !== undefined) {
        const existingPriority = await Gateway.findBy('priority', data.priority)
        if (existingPriority) {
          return response.status(409).json({
            error: 'Já existe um gateway com esta prioridade',
            conflicting_gateway: {
              id: existingPriority.id,
              name: existingPriority.name,
              priority: existingPriority.priority,
            },
          })
        }
      }

      const gateway = await Gateway.create({
        name: data.name,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
      })

      return response.status(201).json({
        message: 'Gateway criado com sucesso',
        data: gateway,
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          error: 'Dados inválidos',
          details: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const { id } = await gatewayParamsValidator.validate(params)

      const gateway = await Gateway.find(id)

      if (!gateway) {
        return response.status(404).json({
          error: 'Gateway não encontrado',
        })
      }

      return response.json({
        message: 'Gateway encontrado com sucesso',
        data: gateway,
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  async updateStatus({ params, request, response }: HttpContext) {
    try {
      const { id } = await gatewayParamsValidator.validate(params)
      const { isActive } = await request.validateUsing(updateGatewayStatusValidator)

      const gateway = await Gateway.find(id)
      if (!gateway) {
        return response.status(404).json({
          error: 'Gateway não encontrado',
        })
      }

      gateway.isActive = isActive
      await gateway.save()

      return response.json({
        message: `Gateway ${isActive ? 'ativado' : 'desativado'} com sucesso`,
        data: gateway,
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          error: 'Dados inválidos',
          details: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }

  async updatePriority({ params, request, response }: HttpContext) {
    try {
      const { id } = await gatewayParamsValidator.validate(params)
      const { priority } = await request.validateUsing(updateGatewayPriorityValidator)

      const gateway = await Gateway.find(id)
      if (!gateway) {
        return response.status(404).json({
          error: 'Gateway não encontrado',
        })
      }

      const existingGateway = await Gateway.query()
        .where('priority', priority)
        .whereNot('id', id)
        .first()

      if (existingGateway) {
        return response.status(409).json({
          error: 'Já existe um gateway com esta prioridade',
          conflicting_gateway: {
            id: existingGateway.id,
            name: existingGateway.name,
            priority: existingGateway.priority,
          },
        })
      }

      gateway.priority = priority
      await gateway.save()

      return response.json({
        message: 'Prioridade do gateway alterada com sucesso',
        data: gateway,
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          error: 'Dados inválidos',
          details: error.messages,
        })
      }

      return response.status(500).json({
        error: 'Erro interno do servidor',
      })
    }
  }
}

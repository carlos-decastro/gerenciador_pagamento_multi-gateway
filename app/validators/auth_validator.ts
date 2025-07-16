import { UserRole } from '#models/user'
import vine from '@vinejs/vine'

/**
 * Validator para login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail().trim().minLength(5).maxLength(254),
    password: vine.string().minLength(6).maxLength(255),
  })
)

/**
 * Validator para criação de usuário
 */
export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .trim()
      .minLength(5)
      .maxLength(254)
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8).maxLength(255),
    role: vine.enum(Object.values(UserRole)).optional(),
  })
)

/**
 * Validator para atualização de usuário
 */
export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().email().normalizeEmail().trim().minLength(5).maxLength(254).optional(),
    password: vine.string().minLength(8).maxLength(255).optional(),
    role: vine.enum(Object.values(UserRole)).optional(),
  })
)

/**
 * Validator para parâmetros de ID
 */
export const userParamsValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)

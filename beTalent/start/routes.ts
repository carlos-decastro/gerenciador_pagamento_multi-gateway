/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { roleMiddleware } from '#middleware/role_middleware'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('../app/controllers/auth_controller.js')
const UserController = () => import('#controllers/user_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Rotas públicas de autenticação
router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('/api/auth')

// Rotas protegidas de autenticação
router
  .group(() => {
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
  })
  .prefix('/api/auth')
  .use(middleware.auth())

// Rotas do CRUD de usuários
router
  .group(() => {
    // Listar usuários - ADMIN e MANAGER
    router
      .get('/users', [UserController, 'index'])
      .use(middleware.role(roleMiddleware.adminOrManager()))

    // Buscar usuário por ID - ADMIN, MANAGER ou próprio usuário
    router.get('/users/:id', [UserController, 'show']).use(middleware.auth())

    // Criar usuário - ADMIN e MANAGER
    router
      .post('/users', [UserController, 'store'])
      .use(middleware.role(roleMiddleware.adminOrManager()))

    // Atualizar usuário - ADMIN, MANAGER ou próprio usuário
    router.put('/users/:id', [UserController, 'update']).use(middleware.auth())

    // Deletar usuário - Apenas ADMIN
    router
      .delete('/users/:id', [UserController, 'destroy'])
      .use(middleware.role(roleMiddleware.admin()))
  })
  .prefix('/api')

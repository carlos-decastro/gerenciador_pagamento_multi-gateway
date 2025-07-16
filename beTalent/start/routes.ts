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
const UserController = () => import('../app/controllers/user_controller.js')
const ProductController = () => import('#controllers/product_controller')
const GatewayController = () => import('#controllers/gateway_controller')
const PurchaseController = () => import('#controllers/purchase_controller')
const ClientController = () => import('#controllers/client_controller')
const RefundController = () => import('#controllers/refund_controller')

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
    router.get('/users/:id', [UserController, 'show'])

    // Criar usuário - ADMIN e MANAGER
    router
      .post('/users', [UserController, 'store'])
      .use(middleware.role(roleMiddleware.adminOrManager()))

    // Atualizar usuário - ADMIN, MANAGER ou próprio usuário
    router.put('/users/:id', [UserController, 'update'])

    // Deletar usuário - Apenas ADMIN
    router
      .delete('/users/:id', [UserController, 'destroy'])
      .use(middleware.role(roleMiddleware.admin()))
  })
  .prefix('/api')
  .use(middleware.auth())

// Rotas de compras
router
  .group(() => {
    // Realizar compra - Público (não requer autenticação)
    router.post('/purchases', [PurchaseController, 'store'])
  })
  .prefix('/api')

// Rotas protegidas de compras
router
  .group(() => {
    // Listar transações - Todos os usuários autenticados
    router.get('/purchases', [PurchaseController, 'index'])

    // Buscar transação por ID - Todos os usuários autenticados
    router.get('/purchases/:id', [PurchaseController, 'show'])
  })
  .prefix('/api')
  .use(middleware.auth())

// Rotas do CRUD de gateways
router
  .group(() => {
    // Listar gateways - Todos os usuários autenticados
    router.get('/gateways', [GatewayController, 'index'])

    // Buscar gateway por ID - Todos os usuários autenticados
    router.get('/gateways/:id', [GatewayController, 'show'])

    // Criar gateway - ADMIN e MANAGER
    router
      .post('/gateways', [GatewayController, 'store'])
      .use(middleware.role(roleMiddleware.adminOrManager()))

    // Ativar/desativar gateway - ADMIN e MANAGER
    router
      .patch('/gateways/:id/status', [GatewayController, 'updateStatus'])
      .use(middleware.role(roleMiddleware.adminOrManager()))

    // Alterar prioridade do gateway - ADMIN e MANAGER
    router
      .patch('/gateways/:id/priority', [GatewayController, 'updatePriority'])
      .use(middleware.role(roleMiddleware.adminOrManager()))
  })
  .prefix('/api')
  .use(middleware.auth())

// Rotas do CRUD de produtos
router
  .group(() => {
    // Listar produtos - Todos os usuários autenticados
    router.get('/products', [ProductController, 'index'])

    // Buscar produtos (search) - Todos os usuários autenticados
    router.get('/products/search', [ProductController, 'search'])

    // Buscar produto por ID - Todos os usuários autenticados
    router.get('/products/:id', [ProductController, 'show'])

    // Criar produto - ADMIN, MANAGER, FINANCE
    router
      .post('/products', [ProductController, 'store'])
      .use(middleware.role(roleMiddleware.adminManagerOrFinance()))

    // Atualizar produto - ADMIN, MANAGER, FINANCE
    router
      .put('/products/:id', [ProductController, 'update'])
      .use(middleware.role(roleMiddleware.adminManagerOrFinance()))

    // Deletar produto - ADMIN, MANAGER
    router
      .delete('/products/:id', [ProductController, 'destroy'])
      .use(middleware.role(roleMiddleware.adminOrManager()))
  })
  .prefix('/api')
  .use(middleware.auth())

// Rotas de clientes
router
  .group(() => {
    // Listar clientes - ADMIN e MANAGER
    router
      .get('/clients', [ClientController, 'index'])
      .use(middleware.role(roleMiddleware.adminOrManager()))

    // Buscar cliente por ID e suas compras - Todos os usuários autenticados
    router.get('/clients/:id', [ClientController, 'show'])
  })
  .prefix('/api')
  .use(middleware.auth())

// Rotas de reembolsos
router
  .group(() => {
    // Listar reembolsos - ADMIN, MANAGER, FINANCE
    router
      .get('/refunds', [RefundController, 'index'])
      .use(middleware.role(roleMiddleware.adminManagerOrFinance()))

    // Buscar reembolso por ID - ADMIN, MANAGER, FINANCE
    router
      .get('/refunds/:id', [RefundController, 'show'])
      .use(middleware.role(roleMiddleware.adminManagerOrFinance()))

    // Criar reembolso - ADMIN, MANAGER, FINANCE
    router
      .post('/refunds', [RefundController, 'store'])
      .use(middleware.role(roleMiddleware.adminManagerOrFinance()))

    // Atualizar status de reembolso - Apenas ADMIN
    router
      .patch('/refunds/:id/status', [RefundController, 'updateStatus'])
      .use(middleware.role(roleMiddleware.admin()))

    // Listar reembolsos de uma transação específica - ADMIN, MANAGER, FINANCE
    router
      .get('/transactions/:transactionId/refunds', [RefundController, 'getByTransaction'])
      .use(middleware.role(roleMiddleware.adminManagerOrFinance()))
  })
  .prefix('/api')
  .use(middleware.auth())

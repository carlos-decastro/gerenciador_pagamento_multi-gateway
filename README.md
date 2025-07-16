# 💳 Gerenciador de Pagamentos Multi-Gateway

> **Desafio Técnico BeTalent** - Sistema completo de gerenciamento de pagamentos com múltiplos gateways

## 📋 Sobre o Projeto

Este projeto é uma **API REST** desenvolvida em **AdonisJS v6** que implementa um sistema completo de gerenciamento de pagamentos com suporte a múltiplos gateways. O sistema permite processar transações, gerenciar produtos, clientes e realizar estornos.

### 🎯 Principais Funcionalidades

- ✅ **Autenticação JWT** com controle de acesso baseado em roles
- ✅ **Multi-Gateway** - Suporte a múltiplos provedores de pagamento
- ✅ **Gestão de Produtos** - CRUD completo com controle de produtos
- ✅ **Processamento de Compras** - Transações seguras com validação
- ✅ **Sistema de Estornos** - Reembolsos parciais e totais
- ✅ **Gestão de Clientes** - Cadastro e gerenciamento de usuários
- ✅ **Validação Robusta** - Middleware de validação em todas as rotas

### 🏗️ Arquitetura

```
📁 app/
├── 🎮 controllers/     # Controladores da API
├── 🔒 middleware/      # Middlewares de autenticação e validação
├── 📊 models/          # Modelos de dados (Lucid ORM)
├── 🔧 services/        # Lógica de negócio e integrações
├── ✅ validators/      # Validadores de entrada
└── 🔌 interfaces/      # Contratos e interfaces TypeScript
```

## 🚀 Instalação e Execução

### 📋 Pré-requisitos

- **Node.js** 18+ (recomendado: 18.20.8)
- **Docker** e **Docker Compose** (para execução containerizada)
- **MySQL** 8.0+ (se executar localmente)

### 🐳 Execução com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/carlos-decastro/gerenciador_pagamento_multi-gateway.git
cd gerenciador_pagamento_multi-gateway

# Execute com Docker Compose
docker-compose up -d --build

# Verifique se os serviços estão rodando
docker-compose ps
```

**Serviços disponíveis:**

- 🌐 **API Principal**: http://localhost:3333
- 🔌 **Gateway Mock 1**: http://localhost:3001
- 🔌 **Gateway Mock 2**: http://localhost:3002
- 🗄️ **MySQL**: localhost:3306

### 💻 Execução Local

```bash
# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrations
node ace migration:run

# Execute os seeders
node ace db:seed

# Inicie o servidor
node ace serve --watch
```

## 🔧 Configuração

### 📮 Collection do Postman

Importe o arquivo `App.postman_collection.json` no Postman para ter acesso a todos os endpoints da API com exemplos pré-configurados.

### 🔍 Endpoints de Teste

```bash
# Health Check
curl http://localhost:3333/
# Resposta: {"hello":"world"}
```

## 👥 Usuários Padrão

O sistema vem com usuários pré-cadastrados:

| Email                  | Senha        | Role      | Descrição                          |
| ---------------------- | ------------ | --------- | ---------------------------------- |
| `admin@betalent.com`   | `admin123`   | `admin`   | Administrador completo             |
| `manager@betalent.com` | `manager123` | `manager` | Segunda permissão de maior acesso  |
| `finance@betalent.com` | `finance123` | `finance` | Terceira permissão de maior acesso |
| `user@betalent.com`    | `user123`    | `user`    | Usuário padrão                     |

## 🗄️ Banco de Dados

### Estrutura Principal

- **users** - Usuários do sistema
- **clients** - Clientes para compras
- **products** - Catálogo de produtos
- **gateways** - Gateways de pagamento
- **transactions** - Transações realizadas
- **transaction_products** - Produtos por transação
- **refunds** - Estornos solicitados

### Migrations

Todas as migrations são executadas automaticamente no Docker. Para execução manual:

```bash
node ace migration:run
node ace db:seed
```

## 🔒 Segurança

- **JWT Authentication** - Tokens seguros com expiração
- **Role-based Access** - Controle de acesso por perfil
- **Input Validation** - Validação de dados
- **SQL Injection Protection** - ORM com prepared statements

## 🛠️ Tecnologias Utilizadas

- **[AdonisJS v6](https://adonisjs.com/)** - Framework Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem tipada
- **[MySQL](https://www.mysql.com/)** - Banco de dados
- **[Lucid ORM](https://lucid.adonisjs.com/)** - Object-Relational Mapping
- **[Docker](https://www.docker.com/)** - Containerização
- **[JWT](https://jwt.io/)** - Autenticação

## 📝 Logs

Os logs da aplicação podem ser visualizados com:

```bash
# Logs da aplicação
docker-compose logs app

# Logs em tempo real
docker-compose logs -f app
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

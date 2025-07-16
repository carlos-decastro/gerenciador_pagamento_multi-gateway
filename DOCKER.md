# Docker Setup - Gerenciador de Pagamentos Multi-Gateway

Este projeto está configurado para rodar completamente com Docker Compose, incluindo:
- MySQL 8.0
- Aplicação AdonisJS
- Mock dos Gateways de Pagamento

## 🚀 Como usar

### 1. Executar tudo com Docker Compose

```bash
docker-compose up --build
```

Este comando irá:
- Construir a imagem da aplicação
- Subir o MySQL
- Subir o mock dos gateways
- Executar as migrations automaticamente
- Executar as seeds para popular o banco
- Iniciar a aplicação

### 2. Acessar os serviços

- **Aplicação**: http://localhost:3333
- **Gateway Mock 1**: http://localhost:3001
- **Gateway Mock 2**: http://localhost:3002
- **MySQL**: localhost:3306

### 3. Parar os serviços

```bash
docker-compose down
```

### 4. Parar e remover volumes (limpar banco)

```bash
docker-compose down -v
```

## 📋 Configurações

### Banco de Dados
- **Host**: mysql (interno) / localhost:3306 (externo)
- **Database**: gerenciador_pagamentos
- **User**: gerenciador_pagamentos
- **Password**: 123456@@
- **Root Password**: root

### Variáveis de Ambiente

As variáveis de ambiente estão configuradas diretamente no `docker-compose.yaml`. Para personalizar, você pode:

1. Criar um arquivo `.env` na raiz do projeto
2. Usar o arquivo `.env.docker` como referência
3. Modificar as variáveis no `docker-compose.yaml`

## 🔧 Desenvolvimento

### Logs da aplicação

```bash
docker-compose logs -f app
```

### Executar comandos na aplicação

```bash
# Acessar o container
docker-compose exec app sh

# Executar migrations manualmente
docker-compose exec app node ace migration:run

# Executar seeds manualmente
docker-compose exec app node ace db:seed
```

### Rebuild apenas da aplicação

```bash
docker-compose up --build app
```

## 📁 Estrutura dos Containers

- **mysql**: Banco de dados MySQL 8.0 com healthcheck
- **app**: Aplicação AdonisJS com auto-execução de migrations/seeds
- **gateways-mock**: Mock dos gateways de pagamento

## ⚠️ Notas Importantes

1. **APP_KEY**: Altere a `APP_KEY` em produção para uma chave segura
2. **Passwords**: Altere as senhas padrão em produção
3. **Healthcheck**: O MySQL possui healthcheck para garantir que esteja pronto antes da aplicação iniciar
4. **Volumes**: Os dados do MySQL são persistidos no volume `mysql_data`
5. **Ordem de inicialização**: A aplicação aguarda o MySQL estar saudável antes de iniciar
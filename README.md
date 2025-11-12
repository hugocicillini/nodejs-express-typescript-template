# 🚀 Node.js Express TypeScript - Clean Architecture Template

> 🏗️ **Production-ready** Node.js boilerplate com **Clean Architecture**, **SOLID principles**, **test coverage** e **CI/CD automatizado**.

🎯 **Template ideal** para iniciar projetos backend escaláveis, manuteníveis e profissionais.

---

## 📋 Índice

- [✨ O que está implementado](#-o-que-está-implementado)
- [🏛️ Arquitetura](#️-arquitetura)
- [📋 Requisitos](#-requisitos)
- [🚀 Instalação & Setup](#-instalação--setup)
- [💻 Uso](#-uso)
- [🧪 Testes](#-testes)
- [🔄 CI/CD](#-cicd)
- [📚 API Documentation](#-api-documentation)
- [🔐 Variáveis de Ambiente](#-variáveis-de-ambiente)
- [🐳 Docker & Deploy](#-docker--deploy)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)

---

## ✨ O que está implementado

### 🏗️ **Arquitetura & Design Patterns**

✅ **Clean Architecture** (4 camadas: Domain, Application, Infrastructure, Presentation)  
✅ **SOLID Principles** aplicados em toda a base de código  
✅ **Dependency Injection** com container customizado  
✅ **Repository Pattern** para abstração de dados  
✅ **Use Cases Pattern** para lógica de negócio  
✅ **Domain-Driven Design (DDD)** com entidades e value objects

### 🔐 **Autenticação & Autorização**

✅ **JWT Authentication** com Access + Refresh Tokens  
✅ **Role-Based Access Control (RBAC)** completo  
✅ **Password Hashing** com bcrypt  
✅ **Token Refresh** automático  
✅ **Logout** com invalidação de refresh tokens  
✅ **Auth Middleware** para proteção de rotas  
✅ **Super Admin** seed para primeiro acesso

### 👥 **Gestão de Usuários & Roles**

✅ **CRUD completo** de usuários  
✅ **CRUD completo** de roles  
✅ **Sistema de permissões** por role  
✅ **Atribuição múltipla** de roles por usuário  
✅ **Filtros e paginação** em listagens  
✅ **Busca avançada** por campos  
✅ **Soft delete** com campos de auditoria

### 🛡️ **Segurança**

✅ **Helmet.js** - Security headers (CSP, HSTS, etc)  
✅ **CORS** configurável por ambiente  
✅ **Rate Limiting** - Proteção contra DDoS/brute force  
✅ **Input Validation** com Zod schemas  
✅ **SQL Injection Protection** via Prisma ORM  
✅ **XSS Protection** via sanitização  
✅ **Error Handling** centralizado sem vazamento de dados

### 📝 **Logging & Monitoring**

✅ **Pino Logger** (high-performance structured logging)  
✅ **Request/Response logging** automático  
✅ **Persistência de logs** no banco de dados  
✅ **Error tracking** com stack traces  
✅ **Health Check** endpoint para monitoring

### 📚 **Documentação**

✅ **Swagger/OpenAPI 3.0** automático  
✅ **Zod → OpenAPI** schema generation  
✅ **Swagger UI** interativo (/api-docs)  
✅ **Request/Response examples** em todos os endpoints  
✅ **Authentication** documentada

### 🔧 **Developer Experience**

✅ **TypeScript Strict Mode** habilitado  
✅ **ESLint** configurado com regras TypeScript  
✅ **Prettier** para formatação consistente  
✅ **Husky** - Git hooks automáticos  
✅ **lint-staged** - Lint apenas arquivos modificados  
✅ **Pre-commit hooks** - Lint + format antes de commit  
✅ **Hot Reload** em desenvolvimento (tsx watch)  
✅ **Build otimizado** com tsup  
✅ **Path aliases** configurados (@/domain, @/application, etc)

### Core

- **Node.js** 22.x
- **TypeScript** 5.9
- **Express** 5.1

### Database

- **Prisma** 6.16 (ORM)
- **PostgreSQL** (primary database)

### Authentication

- **jsonwebtoken** (JWT)
- **bcryptjs** (password hashing)

### Validation

- **Zod** 4.1 (schema validation)
- **@asteasolutions/zod-to-openapi** (OpenAPI integration)

### Security

- **Helmet** (security headers)
- **CORS**
- **express-rate-limit**

### Logging

- **Pino** (structured logging)
- **pino-http** (HTTP logging)

### Documentation

- **Swagger UI Express**
- **OpenAPI 3.0**

### Testing

- **Vitest** 3.2 (test runner)
- **Supertest** (HTTP assertions)

### Dev Tools

- **tsx** (TypeScript execution)
- **tsup** (build tool)
- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (Git hooks)
- **lint-staged** (pre-commit hooks)

---

## 🏛️ Arquitetura

Este projeto segue **Clean Architecture** com 4 camadas bem definidas:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (HTTP)           │  ← Controllers, Routes, Middlewares
├─────────────────────────────────────────────┤
│         Application Layer (Use Cases)       │  ← Business Logic, DTOs
├─────────────────────────────────────────────┤
│         Domain Layer (Entities)             │  ← Core Business Rules
├─────────────────────────────────────────────┤
│     Infrastructure Layer (External)         │  ← Database, Services, DI
└─────────────────────────────────────────────┘
```

### 📂 Camadas

#### 1️⃣ Domain Layer (`src/domain/`)

- **Entidades de negócio** (User, Role, UserRole)
- **Value Objects** (RoleName)
- **Interfaces de repositório**
- **Exceções de domínio**
- **Zero dependências externas**

#### 2️⃣ Application Layer (`src/application/`)

- **Use Cases** (regras de negócio da aplicação)
- **DTOs** (ServiceResponse)
- **Interfaces de use cases**

#### 3️⃣ Infrastructure Layer (`src/infrastructure/`)

- **Implementações de repositórios** (Prisma)
- **Serviços externos** (JWT, Bcrypt)
- **Database** (Prisma Client)
- **Dependency Injection Container**

#### 4️⃣ Presentation Layer (`src/presentation/`)

- **Controllers** (HTTP handlers)
- **Routes** (Express routers)
- **Middlewares** (auth, error, rate limit)
- **Validators** (Zod schemas)
- **Swagger** (OpenAPI)

---

## 📋 Requisitos

- **Node.js** >= 22.x
- **PostgreSQL** >= 14.x
- **npm** ou **yarn** ou **pnpm**

---

## 🚀 Instalação & Setup

### 📦 **Instalação Rápida**

```bash
# 1. Clone o repositório
git clone https://github.com/hugocicillini/nodejs-express-typescript-template.git
cd nodejs-express-typescript-template

# 2. Instale dependências + configure Prisma
npm run setup

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Rode migrations + seed
npm run setup:dev

# 5. Inicie o servidor
npm run dev
```

Pronto! 🎉 Acesse `http://localhost:3000`

---

### 🔧 **Setup Detalhado**

#### 1️⃣ Clone o repositório

```bash
git clone https://github.com/hugocicillini/nodejs-express-typescript-template.git
cd nodejs-express-typescript-template
```

#### 2️⃣ Instale as dependências

```bash
npm install
```

#### 3️⃣ Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```bash
# Server
PORT=3000
NODE_ENV=development
API_PREFIX=/api
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 4️⃣ Configure o banco de dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations
npm run prisma:migrate
```

**Ou use o script de setup:**

```bash
npm run setup:dev  # Instala deps + Prisma + migrations + seed
```

#### 5️⃣ (Recomendado) Seed inicial

Execute o seed para criar dados iniciais:

```bash
npm run prisma:seed
```

**O seed criará:**

- ✅ **3 Roles padrão:**
  - `SUPER_ADMIN` - Full system access
  - `ADMIN` - Management access
  - `USER` - Basic access

- ✅ **1 Super Admin User:**
  - 📧 **Email:** `admin@example.com`
  - 🔑 **Password:** `Admin@123`
  - 🎭 **Role:** `SUPER_ADMIN`

⚠️ **IMPORTANTE:** Altere a senha do Super Admin em produção!

---

## 💻 Uso

### 🛠️ **Desenvolvimento**

```bash
npm run dev
```

Servidor rodando em `http://localhost:3000` com **hot reload** ativo.

### 🏗️ **Build**

```bash
npm run build
```

Gera build otimizado em `/dist` usando **tsup**.

### 🚀 **Produção**

```bash
npm start
```

Inicia o servidor em modo produção.

### 🔍 **Type Check**

```bash
npm run typecheck
```

Valida tipos TypeScript sem gerar build.

### 🎨 **Code Quality**

```bash
# Lint
npm run lint          # Verifica problemas
npm run lint:fix      # Corrige automaticamente

# Format
npm run format        # Formata todos os arquivos
npm run format:check  # Verifica formatação
```

### 🗄️ **Database**

```bash
npm run prisma:studio    # Abre Prisma Studio (GUI)
npm run prisma:migrate   # Cria nova migration
npm run prisma:seed      # Executa seed
```

### 🐳 **Docker**

```bash
npm run docker:build     # Build imagem
npm run docker:up        # Sobe containers
npm run docker:down      # Para containers
npm run docker:logs      # Ver logs
```

---

## 🧪 Testes

### ✅ **Rodar todos os testes**

```bash
npm test
```

### 📊 **Resultado esperado**

```
✓ Test Files  40 passed (40)
✓ Tests  327 passed (327)
  - Unit Tests: 290
  - Integration Tests: 37
Duration  ~3-4s
```

### 🧩 **Testes por tipo**

```bash
# Unit tests (290 testes)
npm run test:unit

# Integration tests (37 testes)
npm run test:integration
```

### 👀 **Modo watch (desenvolvimento)**

```bash
npm run test:watch
```

Roda testes automaticamente ao salvar arquivos.

### 📈 **Coverage Report**

```bash
npm run test:coverage
```

Gera relatório de cobertura detalhado.

### 📝 **Estrutura de Testes**

```
src/tests/
├── unit/                           # 290 unit tests
│   ├── domain/
│   │   ├── entities/              # User, Role, UserRole, RoleName
│   │   └── value-objects/
│   ├── application/
│   │   └── use-cases/             # Auth, Users, Roles, UserRoles
│   ├── infrastructure/
│   │   ├── repositories/          # Prisma repositories
│   │   └── services/              # JWT, Bcrypt
│   └── presentation/
│       ├── controllers/           # All controllers
│       ├── middlewares/           # Auth, RateLimit, ErrorHandler
│       └── validators/            # Zod schemas
├── integration/                   # 37 integration tests
│   └── routes/                    # Auth, Users, Roles, UserRoles, Health
└── helpers/                       # Test utilities & fixtures
```

---

---

## 🔄 CI/CD

### 🤖 **GitHub Actions**

Este template inclui pipeline de CI/CD completo configurado em `.github/workflows/ci.yml`.

#### **Pipeline automático em todo push/PR:**

✅ **Code Quality Checks**

- Lint (ESLint)
- Format check (Prettier)
- Type check (TypeScript)

✅ **Testing**

- Unit tests (290 testes)
- Integration tests (37 testes)
- Matrix testing (Node.js 20.x e 22.x)

✅ **Build Verification**

- Build do projeto
- Validação de build artifacts

✅ **Performance**

- Cache de `node_modules`
- Jobs paralelos
- Execução rápida (~2-3 min)

#### **Como funciona:**

1. **Push para qualquer branch** → CI roda automaticamente
2. **Abrir Pull Request** → CI valida as mudanças
3. **Merge na main** → CI garante que está tudo OK

#### **Logs & Debug**

- Acesse **Actions** tab no GitHub
- Veja logs detalhados de cada step
- Debug failures rapidamente

### 🎯 **Pré-commit Hooks (Local)**

Configurado via **Husky + lint-staged**:

```bash
# Ao fazer git commit:
1. ESLint fix nos arquivos modificados
2. Prettier format nos arquivos modificados
3. Se passar → commit é feito
4. Se falhar → commit é bloqueado
```

**Benefícios:**

- ✅ Código sempre formatado
- ✅ Sem erros de lint no repo
- ✅ Qualidade garantida antes do push
- ✅ CI passa mais rápido

**Desabilitar (não recomendado):**

```bash
git commit --no-verify
```

---

## 📚 API Documentation

### Swagger UI

Acesse a documentação interativa em:

```
http://localhost:3000/api-docs
```

### Endpoints Principais

#### 🔐 Authentication

```http
POST   /api/auth/register     # Registrar novo usuário
POST   /api/auth/login        # Login
POST   /api/auth/refresh      # Renovar access token
POST   /api/auth/logout       # Logout
```

#### 👤 Users

```http
GET    /api/users             # Listar usuários
GET    /api/users/:id         # Buscar usuário por ID
POST   /api/users             # Criar usuário
PUT    /api/users/:id         # Atualizar usuário
DELETE /api/users/:id         # Deletar usuário
```

#### 🎭 Roles

```http
GET    /api/roles             # Listar roles
GET    /api/roles/:id         # Buscar role por ID
POST   /api/roles             # Criar role
PUT    /api/roles/:id         # Atualizar role
DELETE /api/roles/:id         # Deletar role
```

#### 🔗 User Roles

```http
GET    /api/user-roles                    # Listar todas as atribuições
GET    /api/user-roles/user/:userId       # Roles de um usuário
GET    /api/user-roles/role/:roleId       # Usuários de uma role
POST   /api/user-roles/assign             # Atribuir role
DELETE /api/user-roles/remove             # Remover role
DELETE /api/user-roles/user/:userId/all   # Remover todas as roles
```

#### 🏥 Health Check

```http
GET    /api/health            # Status da aplicação
```

### 🔐 Credenciais Padrão (Seed)

Se você rodou o seed (`npm run prisma:seed`), use estas credenciais para testar:

| Campo        | Valor               |
| ------------ | ------------------- |
| **Email**    | `admin@example.com` |
| **Password** | `Admin@123`         |
| **Role**     | `SUPER_ADMIN`       |

⚠️ **IMPORTANTE: Altere esta senha em produção!**

---

## 🔐 Variáveis de Ambiente

Todas as variáveis disponíveis:

| Variável                  | Descrição                  | Padrão                  | Obrigatória |
| ------------------------- | -------------------------- | ----------------------- | ----------- |
| `PORT`                    | Porta do servidor          | `3000`                  | Não         |
| `NODE_ENV`                | Ambiente                   | `development`           | Não         |
| `API_PREFIX`              | Prefixo das rotas          | `/api`                  | Não         |
| `API_BASE_URL`            | URL base da API            | `http://localhost:3000` | Não         |
| `CORS_ORIGIN`             | Origem CORS permitida      | `*`                     | Não         |
| `DATABASE_URL`            | URL do Banco de Dados      | -                       | **Sim**     |
| `JWT_SECRET`              | Secret do JWT              | -                       | **Sim**     |
| `JWT_REFRESH_SECRET`      | Secret do Refresh Token    | -                       | **Sim**     |
| `JWT_EXPIRATION`          | Expiração do Access Token  | `15m`                   | Não         |
| `JWT_REFRESH_EXPIRATION`  | Expiração do Refresh Token | `7d`                    | Não         |
| `RATE_LIMIT_WINDOW_MS`    | Janela do rate limit (ms)  | `900000`                | Não         |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests por janela    | `100`                   | Não         |

---

## 🐳 Docker & Deploy

### 🐳 **Docker**

#### **Build & Run**

```bash
# Build imagem
docker build -t nodejs-api .

# Run container
docker run -p 3000:3000 --env-file .env nodejs-api
```

#### **Docker Compose (com PostgreSQL)**

```bash
# Subir tudo (app + database)
npm run docker:up

# Ver logs
npm run docker:logs

# Parar containers
npm run docker:down
```

O `docker-compose.yml` já está configurado com:

- ✅ PostgreSQL 16 Alpine
- ✅ Health checks
- ✅ Volume persistence
- ✅ Network isolation
- ✅ Environment variables

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 🎉

### **Como contribuir:**

1. **Fork** o projeto
2. Crie uma **feature branch** (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### 📝 **Padrões de Commit**

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova feature
fix: corrige bug
docs: atualiza documentação
style: formatação de código (sem mudança lógica)
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
perf: melhoria de performance
ci: mudanças em CI/CD
build: mudanças no build ou dependências
```

### ✅ **Antes de submeter PR:**

- [ ] Todos os testes passando (`npm test`)
- [ ] Lint OK (`npm run lint`)
- [ ] Format OK (`npm run format:check`)
- [ ] Build OK (`npm run build`)
- [ ] Commits no padrão Conventional Commits

### 🐛 **Reportar Bugs**

Abra uma **Issue** com:

- Descrição do bug
- Steps to reproduce
- Expected vs Actual behavior
- Screenshots (se aplicável)
- Ambiente (OS, Node version, etc)

### 💡 **Sugerir Features**

Abra uma **Issue** com:

- Descrição da feature
- Por que é útil
- Exemplos de uso
- Mockups (se aplicável)

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

---

## 👨‍💻 Autor

**Hugo Cicillini**

- 📧 Email: hugo.cicillini@hotmail.com
- 💼 GitHub: [@hugocicillini](https://github.com/hugocicillini)
- 🌐 LinkedIn: [Hugo Cicillini](https://linkedin.com/in/hugocicillini)

---

## 🙏 Agradecimentos

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Uncle Bob Martin
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - Robert C. Martin
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Vitest](https://vitest.dev/) - Blazing fast unit test framework

---

## 📊 Status do Projeto

### ✅ **Production Ready!**

Este template está **pronto para produção** e pode ser usado como base para seus projetos.

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Clone
git clone https://github.com/hugocicillini/nodejs-express-typescript-template.git
cd nodejs-express-typescript-template

# 2. Setup completo (deps + DB + seed)
npm run setup:dev

# 3. Configure .env
cp .env.example .env
# Edite DATABASE_URL e JWT secrets

# 4. Run
npm run dev

# 5. Test
npm test

# 6. Build & Deploy
npm run build
npm start
```

**Credenciais de teste:**

- Email: `admin@example.com`
- Password: `Admin@123`

**Swagger:** http://localhost:3000/api-docs

---

## 📞 Suporte

Encontrou um bug ou tem uma dúvida?

- 🐛 **Bugs:** [Abra uma issue](https://github.com/hugocicillini/nodejs-express-typescript-template/issues)
- 💬 **Dúvidas:** [Discussions](https://github.com/hugocicillini/nodejs-express-typescript-template/discussions)
- 📧 **Email:** hugo.cicillini@hotmail.com

---

## ⭐ Star History

Se este projeto te ajudou, considere dar uma ⭐ no GitHub!

---

<p align="center">
  <strong>Feito com ❤️ e ☕ por <a href="https://github.com/hugocicillini">Hugo Cicillini</a></strong>
</p>

<p align="center">
  <sub>⭐ Se este projeto te ajudou, considere dar uma estrela!</sub>
</p>

<p align="center">
  <a href="#-nodejs-express-typescript---clean-architecture-template">⬆ Voltar ao topo</a>
</p>

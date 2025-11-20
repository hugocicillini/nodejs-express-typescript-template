# Arquitetura do Projeto

Este documento descreve a arquitetura em camadas do projeto, seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

## 📁 Estrutura de Camadas

```
src/
├── domain/          # Camada de Domínio
├── application/     # Camada de Aplicação
├── infrastructure/  # Camada de Infraestrutura
└── presentation/    # Camada de Apresentação
```

---

## 🎯 Domain Layer (Camada de Domínio)

**Responsabilidade:** Contém a lógica de negócio pura e as regras do domínio. É a camada mais interna e **não depende de nenhuma outra camada**.

### 📂 Estrutura

```
domain/
├── entities/           # Entidades do domínio
├── value-objects/      # Objetos de valor
├── interfaces/         # Contratos (interfaces de repositórios e serviços)
└── exceptions/         # Exceções de domínio
```

### 📄 Arquivos e Responsabilidades

#### `entities/`

Entidades representam conceitos do negócio com identidade única e ciclo de vida.

**Exemplos:**

- `User.ts` - Entidade de usuário com regras de negócio (deactivate, updateName, updatePassword)
- `Role.ts` - Entidade de papel/permissão
- `RefreshToken.ts` - Entidade de token de atualização
- `UserRole.ts` - Entidade de relacionamento usuário-papel

**Características:**

- Possuem identidade única (`id`)
- Encapsulam comportamentos de negócio
- Protegem invariantes do domínio

```typescript
// Exemplo: User.ts
export class User {
  private constructor(private props: UserProps) {}

  deactivate(): void {
    this.props.isActive = false;
    this.props.deletedAt = new Date();
  }

  updatePassword(hashedPassword: string): void {
    this.props.password = hashedPassword;
    this.props.updatedAt = new Date();
  }
}
```

#### `value-objects/`

Objetos de valor que não possuem identidade própria, definidos apenas por seus atributos.

**Exemplos:**

- `RoleName.ts` - Enum com nomes de papéis (SUPER_ADMIN, ADMIN, USER)

**Características:**

- Imutáveis
- Comparados por valor, não por identidade
- Representam conceitos do domínio

#### `interfaces/`

Contratos que definem comportamentos esperados sem implementação concreta.

**Exemplos:**

- `IUserRepository.ts` - Contrato para persistência de usuários
- `IRoleRepository.ts` - Contrato para persistência de papéis
- `IRefreshTokenRepository.ts` - Contrato para persistência de tokens
- `IUserRoleRepository.ts` - Contrato para persistência de relacionamentos
- `IPasswordHasher.ts` - Contrato para hash de senhas
- `IJwtService.ts` - Contrato para geração/validação de JWT

**Características:**

- Definem "o que" fazer, não "como" fazer
- Permitem inversão de dependência
- Facilitam testes com mocks

#### `exceptions/`

Exceções específicas do domínio que representam violações de regras de negócio.

**Exemplos:**

- `UserNotFoundException.ts` - Lançada quando usuário não é encontrado

---

## 🔧 Application Layer (Camada de Aplicação)

**Responsabilidade:** Orquestra o fluxo de dados entre as camadas, coordena casos de uso e aplica regras de aplicação (não de domínio).

### 📂 Estrutura

```
application/
├── use-cases/      # Casos de uso (regras de aplicação)
├── models/         # Modelos da aplicação (ServiceResponse)
└── interfaces/     # Contratos de casos de uso
```

### 📄 Arquivos e Responsabilidades

#### `use-cases/`

Implementam casos de uso específicos da aplicação, orquestrando entidades e serviços.

**Estrutura por módulo:**

```
use-cases/
├── user/
│   ├── CreateUserUseCase.ts
│   ├── GetAllUsersUseCase.ts
│   ├── GetUserByIdUseCase.ts
│   ├── UpdateUserUseCase.ts
│   └── DeleteUserUseCase.ts
├── auth/
│   ├── LoginUseCase.ts
│   ├── RefreshTokenUseCase.ts
│   └── LogoutUseCase.ts
├── role/
└── userRole/
```

**Características:**

- Um caso de uso = uma ação específica
- Coordenam repositórios e serviços
- Retornam `ServiceResponse` padronizado
- Implementam interface `IUseCase<Input, Output>`

```typescript
// Exemplo: CreateUserUseCase.ts
export class CreateUserUseCase implements IUseCase<CreateUserInput, CreateUserOutput> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // 1. Validar regras de aplicação
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      return ServiceResponse.failure("Email already in use", null, 409);
    }

    // 2. Criar entidade de domínio
    const user = User.create({...});

    // 3. Persistir via repositório
    const createdUser = await this.userRepository.create(user);

    // 4. Retornar resposta padronizada
    return ServiceResponse.success("User created", createdUser.toJSON(), 201);
  }
}
```

#### `models/`

Modelos específicos da camada de aplicação.

**Exemplos:**

- `serviceResponse.ts` - Classe genérica para padronizar respostas de casos de uso

**Características:**

- Encapsula resposta de sucesso/falha
- Contém status HTTP, mensagem e dados
- Usado por todos os casos de uso

```typescript
export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly responseObject: T;
  readonly statusCode: number;

  static success<T>(message: string, responseObject: T, statusCode = 200) { ... }
  static failure<T>(message: string, responseObject: T, statusCode = 400) { ... }
}
```

#### `interfaces/`

Contratos para casos de uso.

**Exemplos:**

- `IUseCase.ts` - Interface genérica para todos os casos de uso

```typescript
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
```

---

## 🏗️ Infrastructure Layer (Camada de Infraestrutura)

**Responsabilidade:** Implementa detalhes técnicos e infraestrutura externa (banco de dados, serviços externos, etc.). Depende do domínio implementando suas interfaces.

### 📂 Estrutura

```
infrastructure/
├── database/       # Configuração de banco de dados
├── repositories/   # Implementações concretas de repositórios
├── services/       # Implementações de serviços externos
└── di/            # Dependency Injection (Inversão de Controle)
```

### 📄 Arquivos e Responsabilidades

#### `database/`

Configuração e conexão com banco de dados.

**Exemplos:**

- `prisma.ts` - Cliente Prisma ORM configurado

**Características:**

- Singleton do cliente de banco
- Centraliza configuração de conexão

#### `repositories/`

Implementações concretas das interfaces de repositório definidas no domínio.

**Exemplos:**

- `PrismaUserRepository.ts` - Implementa `IUserRepository` usando Prisma
- `PrismaRoleRepository.ts` - Implementa `IRoleRepository`
- `PrismaRefreshTokenRepository.ts` - Implementa `IRefreshTokenRepository`
- `PrismaUserRoleRepository.ts` - Implementa `IUserRoleRepository`

**Características:**

- Convertem entre entidades de domínio e modelos do banco
- Implementam auditoria (criação de logs de ações)
- Tratam transações e consistência

```typescript
// Exemplo: PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  async create(user: User, auditContext?: AuditContext): Promise<User> {
    const created = await prisma.$transaction(async (tx) => {
      // Persiste usuário
      const dbUser = await tx.user.create({ data: {...} });

      // Cria log de auditoria
      await tx.audit.create({
        data: {
          entity: "User",
          action: "CREATE",
          userId: auditContext?.performedByUserId,
          // ...
        },
      });

      return dbUser;
    });

    // Converte modelo do banco para entidade de domínio
    return User.create({...});
  }
}
```

#### `services/`

Implementações de serviços externos ou técnicos.

**Exemplos:**

- `JwtService.ts` - Implementa `IJwtService` para geração/validação de JWT
- `BcryptPasswordHasher.ts` - Implementa `IPasswordHasher` para hash de senhas

**Características:**

- Encapsulam bibliotecas externas
- Implementam interfaces do domínio
- Isolam detalhes técnicos

#### `di/` (Dependency Injection)

Módulos de injeção de dependência que montam o grafo de objetos.

**Exemplos:**

- `UserModule.ts` - Monta dependências do módulo de usuário
- `AuthModule.ts` - Monta dependências do módulo de autenticação
- `RoleModule.ts` - Monta dependências do módulo de papéis
- `UserRoleModule.ts` - Monta dependências do módulo de relacionamentos
- `index.ts` - Container DI principal

**Características:**

- Factory pattern para criação de objetos
- Gerencia ciclo de vida (singletons)
- Injeta dependências nos controllers

```typescript
// Exemplo: UserModule.ts
export class UserModule {
  static getUserController(): UserController {
    const userRepository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasher();

    const createUserUseCase = new CreateUserUseCase(
      userRepository,
      passwordHasher
    );
    const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    // ... outros use cases

    return new UserController(
      createUserUseCase,
      getAllUsersUseCase
      // ... outros use cases
    );
  }
}
```

---

## 🖥️ Presentation Layer (Camada de Apresentação)

**Responsabilidade:** Interface com o mundo externo (HTTP, CLI, etc.). Traduz requisições externas para casos de uso e formata respostas.

### 📂 Estrutura

```
presentation/
├── controllers/    # Controladores HTTP
├── routes/         # Definição de rotas
├── middlewares/    # Middlewares (autenticação, validação, etc.)
├── validators/     # Schemas de validação com Zod
└── swagger/        # Documentação da API
```

### 📄 Arquivos e Responsabilidades

#### `controllers/`

Controladores que recebem requisições HTTP e delegam para casos de uso.

**Exemplos:**

- `UserController.ts` - Gerencia endpoints de usuários
- `AuthController.ts` - Gerencia endpoints de autenticação
- `RoleController.ts` - Gerencia endpoints de papéis
- `UserRoleController.ts` - Gerencia endpoints de relacionamentos
- `HealthCheckController.ts` - Endpoint de health check

**Características:**

- Recebem `Request` e `Response` do Express
- Extraem dados da requisição
- Chamam casos de uso
- Formatam e retornam resposta HTTP

```typescript
// Exemplo: UserController.ts
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase
    // ... outros use cases
  ) {}

  createUser: RequestHandler = async (req: Request, res: Response) => {
    const result = await this.createUserUseCase.execute({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      auditContext: {
        performedByUserId: req.user?.id || null,
        ip: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });
    res.status(result.statusCode).send(result);
  };
}
```

#### `routes/`

Definem rotas HTTP e associam com controllers e middlewares.

**Exemplos:**

- `user.routes.ts` - Rotas de usuários
- `auth.routes.ts` - Rotas de autenticação
- `role.routes.ts` - Rotas de papéis
- `userRole.routes.ts` - Rotas de relacionamentos
- `healthCheck.routes.ts` - Rota de health check

**Características:**

- Definem verbos HTTP e caminhos
- Aplicam middlewares (auth, validação, etc.)
- Conectam com métodos do controller

```typescript
// Exemplo: user.routes.ts
const userRouter = Router();
const userController = DIContainer.getUserController();

// GET /users - Lista usuários (apenas autenticados)
userRouter.get('/', requireAuth, userController.getUsers);

// POST /users - Cria usuário (apenas ADMIN)
userRouter.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validateRequest(CreateUserSchema),
  userController.createUser
);
```

#### `middlewares/`

Interceptam requisições para adicionar comportamentos transversais.

**Exemplos:**

- `authMiddleware.ts` - Autenticação JWT (requireAuth, requireRole, optionalAuth)
- `errorHandler.ts` - Tratamento global de erros
- `rateLimiter.ts` - Limitação de taxa de requisições
- `requestLogger.ts` - Log de requisições

**Características:**

- Executam antes/depois dos controllers
- Autenticação/autorização
- Validação de entrada
- Logging e monitoramento

```typescript
// Exemplo: authMiddleware.ts
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token not provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyAccessToken(token);

  req.user = { id: payload.sub, email: payload.email, roles: payload.roles };
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### `validators/`

Schemas de validação usando Zod para validar entrada de dados.

**Exemplos:**

- `userSchemas.ts` - Schemas para endpoints de usuários
- `authSchemas.ts` - Schemas para endpoints de autenticação
- `roleSchemas.ts` - Schemas para endpoints de papéis
- `userRoleSchemas.ts` - Schemas para endpoints de relacionamentos

**Características:**

- Validam body, params, query
- Type-safe com TypeScript
- Mensagens de erro customizadas

```typescript
// Exemplo: userSchemas.ts
export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
```

#### `swagger/`

Documentação automática da API usando OpenAPI/Swagger.

**Estrutura:**

- `schemas/` - Definições de schemas
- `registries/` - Registros de rotas e componentes
- `swaggerGenerator.ts` - Gerador de documentação
- `swaggerRouter.ts` - Rota para UI do Swagger
- `utils/` - Utilitários

---

## 🔄 Fluxo de Dados

```
┌─────────────┐
│  HTTP       │
│  Request    │
└──────┬──────┘
       │
       v
┌──────────────────────┐
│  Presentation        │  ← Middlewares (auth, validation)
│  - Routes            │  ← Controllers
│  - Validators        │
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│  Application         │  ← Use Cases
│  - ServiceResponse   │  ← Orquestração
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│  Domain              │  ← Entities
│  - Interfaces        │  ← Business Rules
│  - Exceptions        │
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│  Infrastructure      │  ← Repositories (Prisma)
│  - Database          │  ← External Services
│  - DI Container      │
└──────────────────────┘
```

### Exemplo Completo: Criar Usuário

1. **Presentation:** `POST /users` → `UserController.createUser`
   - Middleware `requireAuth` valida JWT
   - Middleware `requireRole(['ADMIN'])` verifica permissão
   - Middleware `validateRequest(CreateUserSchema)` valida body

2. **Application:** `CreateUserUseCase.execute(input)`
   - Verifica se email já existe
   - Cria entidade `User` com senha hasheada
   - Chama repositório para persistir

3. **Domain:** `User.create(props)`
   - Aplica regras de negócio
   - Valida invariantes

4. **Infrastructure:** `PrismaUserRepository.create(user)`
   - Salva no banco via Prisma
   - Cria log de auditoria
   - Retorna entidade criada

5. **Application:** Retorna `ServiceResponse.success(...)`

6. **Presentation:** Controller retorna HTTP 201 com JSON

---

## 🎯 Princípios Aplicados

### 1. **Dependency Inversion (SOLID)**

- Camadas externas dependem de abstrações (interfaces) do domínio
- Domínio não conhece infraestrutura

### 2. **Single Responsibility (SOLID)**

- Cada camada tem uma responsabilidade clara
- Cada classe/módulo tem um único motivo para mudar

### 3. **Separation of Concerns**

- Regras de negócio isoladas no domínio
- Detalhes técnicos isolados na infraestrutura
- Interface externa isolada na apresentação

### 4. **Clean Architecture**

- Dependências apontam sempre para dentro
- Domínio é independente e testável
- Fácil substituir frameworks e ferramentas

---

## 📚 Resumo das Responsabilidades

| Camada             | Responsabilidade                               | Exemplo                |
| ------------------ | ---------------------------------------------- | ---------------------- |
| **Domain**         | Regras de negócio puras                        | `User.deactivate()`    |
| **Application**    | Casos de uso e orquestração                    | `CreateUserUseCase`    |
| **Infrastructure** | Detalhes técnicos (DB, APIs externas)          | `PrismaUserRepository` |
| **Presentation**   | Interface HTTP (rotas, controllers, validação) | `UserController`       |

---

## 🔧 Tecnologias por Camada

- **Domain:** TypeScript puro, sem dependências externas
- **Application:** TypeScript + bibliotecas utilitárias (http-status-codes, zod)
- **Infrastructure:** Prisma ORM, bcrypt, jsonwebtoken
- **Presentation:** Express, Zod, Swagger/OpenAPI

---

## ✅ Vantagens desta Arquitetura

1. **Testabilidade:** Domínio e aplicação testáveis sem dependências externas
2. **Manutenibilidade:** Mudanças isoladas em suas respectivas camadas
3. **Flexibilidade:** Fácil trocar Prisma por outro ORM, Express por Fastify, etc.
4. **Escalabilidade:** Estrutura clara facilita crescimento do projeto
5. **Qualidade:** Código organizado, coeso e com baixo acoplamento

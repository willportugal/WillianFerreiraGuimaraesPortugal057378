# Artist Album Management System

Sistema Full-Stack para gerenciamento de artistas e álbuns musicais, desenvolvido como parte do Processo Seletivo Conjunto para Engenheiro da Computação Sênior.

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Decisões Técnicas](#decisões-técnicas)

## Visão Geral

O sistema permite o gerenciamento completo de artistas e álbuns musicais, com relacionamento N:N entre as entidades. Inclui funcionalidades avançadas como:

- CRUD completo de artistas e álbuns
- Upload e gerenciamento de capas de álbuns via MinIO (S3-compatible)
- Autenticação JWT com refresh token
- Notificações em tempo real via WebSocket
- Rate limiting por usuário
- Sincronização de dados de regionais via API externa

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   PostgreSQL    │
│  React + TS     │     │  Spring Boot    │     │                 │
│                 │     │                 │     └─────────────────┘
└─────────────────┘     │                 │
                        │                 │     ┌─────────────────┐
                        │                 │────▶│                 │
                        │                 │     │     MinIO       │
                        └─────────────────┘     │  (S3 Storage)   │
                                                │                 │
                                                └─────────────────┘
```

## Tecnologias

### Backend
- **Java 17** - Linguagem de programação
- **Spring Boot 3.2.x** - Framework principal
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **Flyway** - Migrations de banco de dados
- **PostgreSQL 15** - Banco de dados relacional
- **MinIO** - Object storage S3-compatible
- **JWT (JJWT)** - Tokens de autenticação
- **WebSocket (STOMP)** - Comunicação em tempo real
- **Bucket4j** - Rate limiting
- **OpenAPI/Swagger** - Documentação da API
- **JUnit 5 + Mockito** - Testes unitários

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router v6** - Roteamento
- **React Hook Form + Zod** - Formulários e validação
- **Axios** - Cliente HTTP
- **STOMP.js** - Cliente WebSocket
- **Jest + Testing Library** - Testes unitários

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web para frontend

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git

Para desenvolvimento local:
- Java 17+
- Maven 3.8+
- Node.js 20+
- pnpm 8+

## Instalação e Execução

### Via Docker (Recomendado)

```bash
# Clonar o repositório
git clone <repository-url>
cd artist-album-management

# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Visualizar logs
docker-compose logs -f
```

Após a inicialização, acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### Desenvolvimento Local

#### Backend

```bash
cd backend

# Compilar
mvn clean package -DskipTests

# Executar
mvn spring-boot:run

# Executar testes
mvn test
```

#### Frontend

```bash
cd frontend

# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Executar testes
pnpm test
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login de usuário |
| POST | `/api/v1/auth/register` | Registro de novo usuário |
| POST | `/api/v1/auth/refresh` | Renovar token de acesso |

### Artistas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/artists` | Listar artistas (paginado) |
| GET | `/api/v1/artists/{id}` | Buscar artista por ID |
| POST | `/api/v1/artists` | Criar novo artista |
| PUT | `/api/v1/artists/{id}` | Atualizar artista |
| DELETE | `/api/v1/artists/{id}` | Remover artista |
| POST | `/api/v1/artists/{id}/albums/{albumId}` | Associar álbum |
| DELETE | `/api/v1/artists/{id}/albums/{albumId}` | Desassociar álbum |

### Álbuns

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/albums` | Listar álbuns (paginado) |
| GET | `/api/v1/albums/{id}` | Buscar álbum por ID |
| POST | `/api/v1/albums` | Criar novo álbum |
| PUT | `/api/v1/albums/{id}` | Atualizar álbum |
| DELETE | `/api/v1/albums/{id}` | Remover álbum |
| POST | `/api/v1/albums/{id}/covers` | Upload de capas |
| DELETE | `/api/v1/albums/{id}/covers/{coverId}` | Remover capa |
| PUT | `/api/v1/albums/{id}/covers/{coverId}/primary` | Definir capa principal |

### Regionais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/regionais` | Listar regionais |
| POST | `/api/v1/regionais/sync` | Sincronizar com API externa |

### Health Checks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/actuator/health/liveness` | Verificar se a aplicação está viva |
| GET | `/actuator/health/readiness` | Verificar se está pronta para receber tráfego |

## Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- **Access Token**: Expira em 5 minutos
- **Refresh Token**: Expira em 24 horas

### Credenciais de Teste

| Usuário | Senha | Role |
|---------|-------|------|
| admin | admin123 | ADMIN |
| user | user123 | USER |

### Exemplo de Uso

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Usar o token retornado
curl http://localhost:8080/api/v1/artists \
  -H "Authorization: Bearer <access_token>"
```

## Funcionalidades

### Backend

- [x] CRUD de Artistas
- [x] CRUD de Álbuns
- [x] Relacionamento N:N entre Artistas e Álbuns
- [x] Upload de múltiplas capas por álbum (MinIO)
- [x] URLs presigned com expiração de 30 minutos
- [x] Autenticação JWT com refresh token
- [x] Rate limiting (10 req/min/usuário)
- [x] WebSocket para notificações em tempo real
- [x] Paginação, filtros e ordenação
- [x] Versionamento de API (/api/v1/...)
- [x] Migrations com Flyway
- [x] Documentação OpenAPI/Swagger
- [x] Health checks (liveness/readiness)
- [x] CORS configurável
- [x] Sincronização de regionais via API externa

### Frontend

- [x] Listagem de artistas com busca e paginação
- [x] Detalhamento de artista com álbuns
- [x] Formulários de cadastro/edição
- [x] Upload de capas de álbuns
- [x] Autenticação com refresh automático
- [x] Notificações em tempo real
- [x] Lazy loading de páginas
- [x] Context API para gerenciamento de estado
- [x] Design responsivo com Tailwind CSS

## Estrutura do Projeto

```
artist-album-management/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/artistalbum/
│   │   │   │   ├── config/         # Configurações
│   │   │   │   ├── controller/     # Controllers REST
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── entity/         # Entidades JPA
│   │   │   │   ├── exception/      # Exceções customizadas
│   │   │   │   ├── repository/     # Repositórios JPA
│   │   │   │   ├── security/       # Segurança e JWT
│   │   │   │   ├── service/        # Serviços de negócio
│   │   │   │   └── websocket/      # WebSocket handlers
│   │   │   └── resources/
│   │   │       ├── db/migration/   # Migrations Flyway
│   │   │       └── application.yml # Configurações
│   │   └── test/                   # Testes unitários
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/             # Componentes React
│   │   ├── context/                # Context API
│   │   ├── hooks/                  # Custom hooks
│   │   ├── pages/                  # Páginas da aplicação
│   │   ├── services/               # Serviços (API, WebSocket)
│   │   ├── types/                  # Tipos TypeScript
│   │   └── utils/                  # Utilitários
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── DECISIONS.md
├── PERSONA.md
└── README.md
```

## Testes

### Backend

```bash
cd backend
mvn test
```

Cobertura de testes:
- Testes unitários para Services
- Testes de integração para Controllers
- Mocks com Mockito

### Frontend

```bash
cd frontend
pnpm test
pnpm test:coverage
```

Cobertura de testes:
- Testes de componentes com Testing Library
- Testes de serviços
- Testes de contextos

## Decisões Técnicas

Consulte o arquivo [DECISIONS.md](./DECISIONS.md) para detalhes sobre as decisões arquiteturais e técnicas tomadas durante o desenvolvimento.

## Licença

Este projeto foi desenvolvido como parte de um processo seletivo e não possui licença de uso comercial.

---

Desenvolvido por Willian Portugal

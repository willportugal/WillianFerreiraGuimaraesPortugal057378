# Decisões Técnicas e Arquiteturais - Soundify

Este documento descreve as principais decisões técnicas tomadas durante o desenvolvimento do **Soundify**, plataforma de gerenciamento de artistas e álbuns musicais.

## Sumário

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Backend](#2-backend)
3. [Frontend](#3-frontend)
4. [Banco de Dados](#4-banco-de-dados)
5. [Armazenamento de Arquivos](#5-armazenamento-de-arquivos)
6. [Autenticação e Segurança](#6-autenticação-e-segurança)
7. [Comunicação em Tempo Real](#7-comunicação-em-tempo-real)
8. [Infraestrutura](#8-infraestrutura)
9. [Trade-offs e Alternativas](#9-trade-offs-e-alternativas)

---

## 1. Arquitetura Geral

### Decisão: Arquitetura em Camadas (Layered Architecture)

**Contexto**: O projeto requer uma estrutura clara e manutenível para um sistema CRUD com funcionalidades avançadas.

**Decisão**: Adotar arquitetura em camadas com separação clara entre:
- **Controller Layer**: Recebe requisições HTTP e delega para serviços
- **Service Layer**: Contém lógica de negócio
- **Repository Layer**: Abstrai acesso a dados
- **Entity Layer**: Representa o modelo de domínio

**Justificativa**:
- Facilita testes unitários (cada camada pode ser testada isoladamente)
- Promove separação de responsabilidades (SRP)
- Permite evolução independente de cada camada
- Padrão amplamente conhecido, facilitando onboarding de novos desenvolvedores

**Alternativas consideradas**:
- Hexagonal Architecture: Mais complexa para o escopo do projeto
- CQRS: Overhead desnecessário para operações CRUD simples

---

## 2. Backend

### 2.1 Spring Boot 3.2.x

**Decisão**: Utilizar Spring Boot 3.2.x com Java 17.

**Justificativa**:
- LTS do Java 17 garante suporte de longo prazo
- Spring Boot 3.x oferece melhor performance e suporte a GraalVM
- Ecossistema maduro com excelente documentação
- Integração nativa com Spring Security, Spring Data JPA

### 2.2 Versionamento de API

**Decisão**: Prefixar todos os endpoints com `/api/v1/`.

**Justificativa**:
- Permite evolução da API sem quebrar clientes existentes
- Facilita migração gradual para novas versões
- Padrão de mercado amplamente adotado

### 2.3 DTOs e Mapeamento

**Decisão**: Utilizar DTOs separados para Request e Response.

**Justificativa**:
- Evita exposição de detalhes internos das entidades
- Permite validação específica por operação
- Facilita versionamento de contratos da API
- Previne problemas de serialização circular (N:N relationships)

### 2.4 Tratamento de Exceções

**Decisão**: Implementar `@ControllerAdvice` global com exceções customizadas.

**Justificativa**:
- Centraliza tratamento de erros
- Padroniza formato de respostas de erro
- Facilita logging e monitoramento
- Melhora experiência do desenvolvedor frontend

---

## 3. Frontend

### 3.1 React + TypeScript

**Decisão**: Utilizar React 18 com TypeScript e Vite.

**Justificativa**:
- TypeScript adiciona segurança de tipos em tempo de compilação
- Vite oferece HMR rápido e build otimizado
- React 18 traz melhorias de performance (concurrent features)

### 3.2 Gerenciamento de Estado

**Decisão**: Utilizar Context API + hooks customizados (Facade Pattern).

**Justificativa**:
- Suficiente para a complexidade do projeto
- Evita dependência de bibliotecas externas (Redux, MobX)
- Facilita testes e manutenção
- Padrão Facade encapsula complexidade dos serviços

**Alternativas consideradas**:
- Redux: Overhead desnecessário para o escopo
- Zustand: Boa opção, mas Context API é suficiente

### 3.3 Lazy Loading

**Decisão**: Implementar code splitting com React.lazy() para todas as páginas.

**Justificativa**:
- Reduz bundle inicial
- Melhora tempo de carregamento inicial
- Carrega código sob demanda

### 3.4 Estilização

**Decisão**: Utilizar Tailwind CSS.

**Justificativa**:
- Produtividade alta com utility classes
- Bundle otimizado (purge de classes não utilizadas)
- Consistência visual sem CSS customizado
- Excelente documentação

---

## 4. Banco de Dados

### 4.1 PostgreSQL

**Decisão**: Utilizar PostgreSQL 15 como banco de dados relacional.

**Justificativa**:
- Suporte robusto a relacionamentos complexos (N:N)
- Performance excelente para queries com JOINs
- Recursos avançados (JSONB, Full-text search) para futuras expansões
- Open source e amplamente suportado

### 4.2 Flyway Migrations

**Decisão**: Utilizar Flyway para versionamento de schema.

**Justificativa**:
- Controle de versão do banco de dados
- Migrations reproduzíveis em qualquer ambiente
- Integração nativa com Spring Boot
- Facilita rollbacks e auditorias

### 4.3 Modelagem N:N

**Decisão**: Implementar relacionamento N:N entre Artist e Album via tabela de junção.

**Justificativa**:
- Modelo relacional normalizado
- Permite que um álbum tenha múltiplos artistas (colaborações)
- Permite que um artista tenha múltiplos álbuns
- Evita duplicação de dados

---

## 5. Armazenamento de Arquivos

### 5.1 MinIO

**Decisão**: Utilizar MinIO como object storage S3-compatible.

**Justificativa**:
- API compatível com Amazon S3
- Facilita migração futura para AWS S3
- Self-hosted para desenvolvimento local
- Suporte a presigned URLs

### 5.2 Presigned URLs

**Decisão**: Gerar URLs presigned com expiração de 30 minutos.

**Justificativa**:
- Segurança: URLs expiram automaticamente
- Performance: Acesso direto ao storage sem passar pelo backend
- Escalabilidade: Reduz carga no servidor de aplicação

### 5.3 Múltiplas Capas por Álbum

**Decisão**: Permitir múltiplas capas com uma marcada como principal.

**Justificativa**:
- Flexibilidade para diferentes versões de capa
- Suporte a capas alternativas (deluxe, vinil, etc.)
- Campo `isPrimary` para identificar capa principal

---

## 6. Autenticação e Segurança

### 6.1 JWT com Refresh Token

**Decisão**: Implementar JWT com access token (5 min) e refresh token (24h).

**Justificativa**:
- Access token curto reduz janela de vulnerabilidade
- Refresh token permite sessões longas sem reautenticação
- Stateless: não requer armazenamento de sessão no servidor

### 6.2 Rate Limiting

**Decisão**: Implementar rate limiting de 10 requisições/minuto por usuário.

**Justificativa**:
- Proteção contra ataques de força bruta
- Previne abuso de recursos
- Bucket4j oferece implementação eficiente em memória

### 6.3 CORS Restritivo

**Decisão**: Configurar CORS apenas para origens específicas.

**Justificativa**:
- Segurança: previne requisições de origens não autorizadas
- Configurável via variáveis de ambiente
- Permite diferentes configurações por ambiente

---

## 7. Comunicação em Tempo Real

### 7.1 WebSocket com STOMP

**Decisão**: Utilizar WebSocket com protocolo STOMP para notificações.

**Justificativa**:
- STOMP oferece abstração de pub/sub
- Suporte nativo no Spring Boot
- Facilita broadcast para múltiplos clientes
- SockJS como fallback para browsers antigos

### 7.2 Notificações de Álbuns

**Decisão**: Notificar via WebSocket quando álbuns são criados, atualizados ou removidos.

**Justificativa**:
- UX melhorada: usuários veem atualizações em tempo real
- Reduz necessidade de polling
- Demonstra capacidade de implementar features avançadas

---

## 8. Infraestrutura

### 8.1 Docker Compose

**Decisão**: Orquestrar todos os serviços via Docker Compose.

**Justificativa**:
- Ambiente reproduzível
- Facilita setup para novos desenvolvedores
- Simula ambiente de produção
- Health checks garantem ordem de inicialização

### 8.2 Nginx como Reverse Proxy

**Decisão**: Utilizar Nginx no frontend para servir arquivos estáticos e proxy reverso.

**Justificativa**:
- Performance superior para arquivos estáticos
- Gzip compression
- Proxy para API elimina problemas de CORS em produção
- Suporte a WebSocket

---

## 9. Trade-offs e Alternativas

### 9.1 Monolito vs Microserviços

**Trade-off**: Optou-se por monolito.

**Justificativa**: Para o escopo do projeto, microserviços adicionariam complexidade desnecessária. O monolito permite desenvolvimento mais rápido e deploy simplificado.

### 9.2 SQL vs NoSQL

**Trade-off**: Optou-se por SQL (PostgreSQL).

**Justificativa**: O modelo de dados é relacional por natureza (N:N entre artistas e álbuns). NoSQL seria mais adequado para dados não estruturados ou alta escala de escrita.

### 9.3 REST vs GraphQL

**Trade-off**: Optou-se por REST.

**Justificativa**: REST é mais simples de implementar e suficiente para o caso de uso. GraphQL seria vantajoso para queries complexas ou múltiplos clientes com necessidades diferentes.

### 9.4 Server-Side Rendering vs SPA

**Trade-off**: Optou-se por SPA (Single Page Application).

**Justificativa**: O sistema é uma aplicação interna/administrativa onde SEO não é prioridade. SPA oferece melhor UX para aplicações interativas.

---

## Conclusão

As decisões tomadas priorizam:
1. **Manutenibilidade**: Código limpo e bem estruturado
2. **Escalabilidade**: Arquitetura que permite crescimento
3. **Segurança**: Autenticação robusta e proteções contra ataques comuns
4. **Developer Experience**: Setup simples e documentação clara
5. **Performance**: Otimizações onde necessário sem over-engineering

Todas as decisões foram tomadas considerando o escopo do projeto, requisitos do edital e boas práticas de mercado.

# VryAuth — JWT API + Interface Web

API REST de autenticação com JWT completa, acompanhada de uma interface web para login, cadastro e gerenciamento de perfil.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

<div align="center">
  <img src=".github\screenshot-1.png" alt="Descrição" width="600">
</div>

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Servidor | Node.js + Express |
| Linguagem | TypeScript |
| ORM | Prisma + Migrations |
| Banco | PostgreSQL 15+ |
| Autenticação | JWT (jsonwebtoken) |
| Hash de senha | bcryptjs |
| Interface | HTML + CSS + JavaScript (vanilla) |

---

## Como funciona o fluxo JWT

```
1. Usuário faz login → recebe accessToken (15min) + refreshToken (7 dias)
2. Usa o accessToken no header Authorization de cada requisição protegida
3. Quando o accessToken expira → envia o refreshToken para /auth/refresh
4. Recebe um novo accessToken sem precisar fazer login novamente
5. No logout → refreshToken é deletado do banco (sessão invalidada)
```

> **Por que dois tokens?**
> O accessToken tem vida curta (15 min) por segurança — se for roubado, o dano é limitado.
> O refreshToken tem vida longa (7 dias) mas fica salvo no banco e pode ser invalidado a qualquer momento.

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 15+ instalado e rodando
- npm

---

## Instalação e configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seus dados:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/jwt_api_db"
JWT_SECRET="uma_string_longa_e_aleatoria_aqui_minimo_32_chars"
JWT_REFRESH_SECRET="outra_string_longa_e_aleatoria_aqui_minimo_32_chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
```

### 3. Criar o banco de dados

No pgAdmin ou terminal PostgreSQL:

```sql
CREATE DATABASE jwt_api_db;
```

### 4. Rodar as migrations

```bash
npm run prisma:migrate
```

> Quando pedir um nome para a migration, digite: `init`

### 5. Iniciar o servidor

```bash
npm run dev
```

Saída esperada:
```
✅ Conectado ao banco de dados PostgreSQL
🚀 Servidor rodando em http://localhost:3000
```

---

## Interface Web (index.html)

A interface web conecta-se à API e oferece uma experiência completa de autenticação sem precisar do Insomnia.

### Como usar

1. Com a API rodando (`npm run dev`), abra o arquivo `index.html` diretamente no navegador
2. O indicador no canto inferior da tela de login mostra se a API está **online** (verde) ou **offline** (vermelho)

> **Se aparecer offline mesmo com a API rodando**, é necessário adicionar o middleware de CORS:
>
> ```bash
> npm install cors @types/cors
> ```
>
> Em `src/app.ts`, adicione antes de tudo:
>
> ```typescript
> import cors from 'cors'
> app.use(cors())
> ```

### Páginas da interface

**Tela de Login**
- Digite email e senha e clique em **Entrar** (ou pressione Enter)
- Indicador de status da API em tempo real

**Tela de Cadastro**
- Preencha nome, email e senha (mínimo 6 caracteres)
- Após cadastro bem-sucedido, redireciona automaticamente para o login com os campos preenchidos

**Dashboard (após login)**
- Visualiza seus dados: nome, email, role e data de criação
- **Editar perfil** — altere nome e/ou senha sem sair da página
- **Renovar token** — simula a expiração e obtém um novo accessToken via `/auth/refresh`
- **Recarregar dados** — busca seus dados atualizados da API
- **Copiar token** — copia o accessToken para usar no Insomnia
- **Visualizar tokens** — exibe os tokens JWT ativos na tela
- **Logout** — invalida o refreshToken no banco e encerra a sessão

---

## Endpoints da API

### Autenticação (público)

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| POST | `/auth/register` | `{ name, email, password }` | Criar conta |
| POST | `/auth/login` | `{ email, password }` | Login → retorna tokens |
| POST | `/auth/refresh` | `{ refreshToken }` | Renovar access token |
| POST | `/auth/logout` | `{ refreshToken }` | Encerrar sessão |

### Usuários (protegido)

| Método | Rota | Role | Body | Descrição |
|--------|------|------|------|-----------|
| GET | `/users/me` | USER/ADMIN | — | Ver próprio perfil |
| PUT | `/users/me` | USER/ADMIN | `{ name?, password? }` | Atualizar perfil |
| GET | `/users` | ADMIN | — | Listar todos os usuários |
| GET | `/users/:id` | ADMIN | — | Ver usuário por ID |
| DELETE | `/users/:id` | ADMIN | — | Deletar usuário |
| GET | `/health` | Público | — | Status da API |

### Como usar rotas protegidas

Adicione o header em toda requisição que exige autenticação:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> No Insomnia: aba **Headers** → campo **Nome**: `Authorization` → campo **Valor**: `Bearer <token>`

---

## Exemplos de uso

### Registrar usuário
```json
POST /auth/register
{
  "name": "Victor Augusto",
  "email": "victor@email.com",
  "password": "123456"
}
```

### Login
```json
POST /auth/login
{
  "email": "victor@email.com",
  "password": "123456"
}
```

Resposta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "290ee4fb-4a48-46a4-8e87-7e2c774d7afc",
  "user": {
    "id": "662e09e9-...",
    "name": "Victor Augusto",
    "email": "victor@email.com",
    "role": "USER"
  }
}
```

### Acessar rota protegida
```
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Renovar token expirado
```json
POST /auth/refresh
{
  "refreshToken": "290ee4fb-4a48-46a4-8e87-7e2c774d7afc"
}
```

---

## Como promover um usuário para ADMIN

```bash
npm run prisma:studio
```

Abre no navegador → clique em **users** → clique no usuário → mude o campo `role` de `USER` para `ADMIN` → **Save**. Faça login novamente para obter um token com role ADMIN.

Ou diretamente via SQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

---

## Estrutura do projeto

```
jwt-api/
├── src/
│   ├── server.ts                 # Ponto de entrada
│   ├── app.ts                    # Express + middlewares + rotas
│   ├── config/
│   │   └── database.ts           # Prisma singleton
│   ├── controllers/
│   │   ├── auth.controller.ts    # register, login, refresh, logout
│   │   └── user.controller.ts    # CRUD de usuários
│   ├── middlewares/
│   │   └── auth.middleware.ts    # authenticate + authorize(role)
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   └── utils/
│       └── jwt.ts                # generateAccessToken, verifyAccessToken
├── prisma/
│   └── schema.prisma             # Models: User, RefreshToken, Role
├── index.html                    # Interface web completa
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Comandos

```bash
npm run dev              # Servidor em modo desenvolvimento (hot reload)
npm run build            # Compila TypeScript para JavaScript
npm start                # Inicia servidor compilado (produção)
npm run prisma:migrate   # Cria/atualiza tabelas no banco
npm run prisma:studio    # Interface visual do banco no navegador
```

---

## Erros comuns

| Código | Mensagem | Solução |
|--------|----------|---------|
| 400 | Campos obrigatórios ausentes | Verifique se o JSON está completo no Body |
| 401 | Token não fornecido | Adicione `Authorization: Bearer <token>` no header |
| 401 | Token inválido ou expirado | Faça login novamente ou use `/auth/refresh` |
| 403 | Acesso negado | Rota exige role ADMIN — promova o usuário |
| 409 | Email já cadastrado | Use outro email para o registro |
| 500 | Erro interno | Verifique se o PostgreSQL está rodando |

---

## Autor

**Victor Augusto Rodrigues de Oliveira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-victor--augusto-0077B5?logo=linkedin)](https://www.linkedin.com/in/victor-augusto-79a5612b6/)
[![GitHub](https://img.shields.io/badge/GitHub-VryDeveloper-181717?logo=github)](https://github.com/VryDeveloper)

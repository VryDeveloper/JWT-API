# JWT API — Node.js + Express + TypeScript + PostgreSQL

API REST com autenticação JWT completa, incluindo Access Token, Refresh Token, roles de usuário e rotas protegidas.

## Stack

- **Node.js** + **Express** — servidor HTTP
- **TypeScript** — tipagem estática
- **Prisma ORM** — comunicação com banco de dados
- **PostgreSQL** — banco de dados relacional
- **JWT (jsonwebtoken)** — autenticação stateless
- **bcryptjs** — hash de senhas

---

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o `.env` com sua senha do PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/jwt_api_db"
JWT_SECRET="uma_string_longa_e_aleatoria_aqui"
JWT_REFRESH_SECRET="outra_string_longa_e_aleatoria_aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
```

### 3. Criar o banco de dados

Abra o pgAdmin ou terminal e crie o banco:

```sql
CREATE DATABASE jwt_api_db;
```

### 4. Rodar as migrations (cria as tabelas)

```bash
npm run prisma:migrate
```

> Quando pedir um nome para a migration, digite: `init`

### 5. Iniciar o servidor em modo desenvolvimento

```bash
npm run dev
```

---

## Endpoints

### Autenticação (público)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Login → retorna tokens |
| POST | `/auth/refresh` | Renovar access token |
| POST | `/auth/logout` | Invalidar sessão |

### Usuários (protegido)

| Método | Rota | Role | Descrição |
|--------|------|------|-----------|
| GET | `/users/me` | USER/ADMIN | Ver próprio perfil |
| PUT | `/users/me` | USER/ADMIN | Atualizar perfil |
| GET | `/users` | ADMIN | Listar todos usuários |
| GET | `/users/:id` | ADMIN | Ver usuário por ID |
| DELETE | `/users/:id` | ADMIN | Deletar usuário |

---

## Exemplos de uso (com curl ou Postman/Insomnia)

### Registrar usuário
```json
POST /auth/register
{
  "name": "Victor",
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
**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "uuid-aqui",
  "user": { "id": "...", "name": "Victor", "email": "...", "role": "USER" }
}
```

### Acessar rota protegida
```
GET /users/me
Authorization: Bearer eyJhbGc...
```

### Renovar token expirado
```json
POST /auth/refresh
{
  "refreshToken": "uuid-aqui"
}
```

---

## Como funciona o fluxo JWT

```
1. Usuário faz login → recebe accessToken (15min) + refreshToken (7 dias)
2. Usa o accessToken no header de cada requisição protegida
3. Quando o accessToken expira → envia o refreshToken para /auth/refresh
4. Recebe um novo accessToken sem precisar fazer login novamente
5. No logout → refreshToken é deletado do banco (sessão invalidada)
```

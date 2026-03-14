import express from 'express'
import cors from 'cors'  
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

const app = express()

// Middleware para parsear JSON no body das requisições
app.use(cors())  
app.use(express.json())

// Rota de saúde — útil para verificar se a API está rodando
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Registra as rotas
app.use('/auth', authRoutes)   // /auth/register, /auth/login, etc.
app.use('/users', userRoutes)  // /users/me, /users/:id, etc.

// Handler de rota não encontrada
app.use((_, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

export default app

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'

// POST /auth/register
// Cria um novo usuário com senha criptografada
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' })
      return
    }

    // Verifica se email já existe
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: 'Email já cadastrado' })
      return
    }

    // bcrypt: criptografa a senha com salt de custo 10 (nunca salva senha em texto puro!)
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    res.status(201).json({ message: 'Usuário criado com sucesso', user })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// POST /auth/login
// Valida credenciais e retorna access token + refresh token
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    // Compara a senha enviada com o hash salvo no banco
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    // Gera os dois tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    const refreshToken = generateRefreshToken()

    // Salva o refresh token no banco com prazo de 7 dias
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })

    res.json({
      accessToken,   // Use este no header: Authorization: Bearer <accessToken>
      refreshToken,  // Guarde este para renovar o accessToken quando expirar
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// POST /auth/refresh
// Recebe o refreshToken e retorna um novo accessToken (sem precisar fazer login)
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token é obrigatório' })
      return
    }

    // Busca o token no banco e verifica se está válido e não expirado
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Refresh token inválido ou expirado' })
      return
    }

    // Gera novo access token
    const accessToken = generateAccessToken({
      userId: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    })

    res.json({ accessToken })
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// POST /auth/logout
// Remove o refresh token do banco (invalida a sessão)
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token é obrigatório' })
      return
    }

    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })

    res.json({ message: 'Logout realizado com sucesso' })
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

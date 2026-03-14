import 'dotenv/config'
import app from './app'
import prisma from './config/database'

const PORT = process.env.PORT || 3000

async function main() {
  try {
    // Testa a conexão com o banco antes de subir o servidor
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados PostgreSQL')

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
      console.log(`📋 Endpoints disponíveis:`)
      console.log(`   POST /auth/register`)
      console.log(`   POST /auth/login`)
      console.log(`   POST /auth/refresh`)
      console.log(`   POST /auth/logout`)
      console.log(`   GET  /users/me`)
      console.log(`   PUT  /users/me`)
      console.log(`   GET  /users        (ADMIN)`)
      console.log(`   GET  /users/:id    (ADMIN)`)
      console.log(`   DELETE /users/:id  (ADMIN)`)
    })
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error)
    process.exit(1)
  }
}

main()

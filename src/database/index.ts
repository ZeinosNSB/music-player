import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

import envConfig from '@/configs/env.config'

neonConfig.webSocketConstructor = ws

const createPrismaClient = () => {
  const connectionString = `${process.env.DATABASE_URL}`

  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prisma: ReturnType<typeof createPrismaClient> & typeof global
}

const prisma = globalThis.prisma || createPrismaClient()

if (!envConfig.PRODUCTION) globalThis.prisma = prisma

export default prisma

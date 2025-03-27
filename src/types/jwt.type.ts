import { Role } from '@prisma/client'
import { JwtVariables } from 'hono/jwt'

import { TokenTypeValue } from '@/constants/type'

export type TokenPayload = {
  userId: string
  role: Role
  tokenType: TokenTypeValue
  exp: number
  iat: number
}

export type Variables = JwtVariables<TokenPayload>

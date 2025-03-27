import { Role } from '@prisma/client'
import { Context, Next } from 'hono'

import { AuthError } from '@/utils/errors'

export const authMiddleware = (role: Role) => async (c: Context, next: Next) => {
  const payload = c.get('jwtPayload')

  if (!payload || payload.role !== role) throw new AuthError('Bạn không có quyền truy cập')

  return next()
}

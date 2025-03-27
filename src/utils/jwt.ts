import { sign, verify } from 'hono/jwt'
import ms from 'ms'

import envConfig from '@/configs/env.config'
import { TokenType } from '@/constants/type'
import { TokenPayload } from '@/types/jwt.type'

export const signAccessToken = async (payload: Pick<TokenPayload, 'userId' | 'role'> & { exp?: number }) => {
  const tokenPayload = {
    ...payload,
    tokenType: TokenType.AccessToken,
    exp: payload.exp || Math.floor((Date.now() + ms('1d')) / 1000)
  }
  return await sign(tokenPayload, envConfig.ACCESS_TOKEN_SECRET)
}

export const signRefreshToken = async (payload: Pick<TokenPayload, 'userId' | 'role'> & { exp?: number }) => {
  const tokenPayload = {
    ...payload,
    tokenType: TokenType.RefreshToken,
    exp: payload.exp || Math.floor((Date.now() + ms('7d')) / 1000)
  }
  return await sign(tokenPayload, envConfig.REFRESH_TOKEN_SECRET)
}

export const verifyAccessToken = async (token: string) => {
  return (await verify(token, envConfig.ACCESS_TOKEN_SECRET)) as TokenPayload
}

export const verifyRefreshToken = async (token: string) => {
  return (await verify(token, envConfig.REFRESH_TOKEN_SECRET)) as TokenPayload
}

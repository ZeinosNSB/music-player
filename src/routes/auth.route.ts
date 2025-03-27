import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'

import responseValidator from '@/middewares/response-validator.middleware'
import { AccountResponseSchema, CreateAccountBodySchema } from '@/schemas/account.schema'
import {
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  SignInBodySchema,
  SignInResponseSchema,
  SignOutBodySchema
} from '@/schemas/auth.schema'
import { MessageResponseSchema } from '@/schemas/common.schema'
import { createUserAccount } from '@/services/account.service'
import { refreshTokenService, signInService, signOutService } from '@/services/auth.service'

const app = new Hono()

app.post(
  '/register',
  zValidator('json', CreateAccountBodySchema),
  responseValidator(StatusCodes.CREATED, AccountResponseSchema),
  async c => {
    const account = await createUserAccount(c.req.valid('json'))

    return c.json(
      {
        message: 'Tạo tài khoản thành công',
        metadata: { account }
      },
      StatusCodes.CREATED
    )
  }
)
app.post(
  '/login',
  zValidator('json', SignInBodySchema),
  responseValidator(StatusCodes.OK, SignInResponseSchema),
  async c => {
    const { user, accessToken, refreshToken } = await signInService(c.req.valid('json'))

    return c.json(
      {
        message: 'Đăng nhập thành công',
        metadata: { account: user, accessToken, refreshToken }
      },
      StatusCodes.OK
    )
  }
)

app.post(
  '/logout',
  zValidator('json', SignOutBodySchema),
  responseValidator(StatusCodes.OK, MessageResponseSchema),
  async c => {
    const message = await signOutService(c.req.valid('json').refreshToken)

    return c.json({ message }, StatusCodes.OK)
  }
)

app.post(
  '/refresh-token',
  zValidator('json', RefreshTokenBodySchema),
  responseValidator(StatusCodes.OK, RefreshTokenResponseSchema),
  async c => {
    const { accessToken, refreshToken } = await refreshTokenService(c.req.valid('json').refreshToken)

    return c.json(
      {
        message: 'Làm mới token thành công',
        metadata: { accessToken, refreshToken }
      },
      StatusCodes.OK
    )
  }
)

export default app

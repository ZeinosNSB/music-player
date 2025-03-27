import prisma from '@/database'
import { SignInBodyType } from '@/schemas/auth.schema'
import { TokenPayload } from '@/types/jwt.type'
import { comparePassword } from '@/utils/crypto'
import { AuthError } from '@/utils/errors'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt'

export const signInService = async (body: SignInBodyType) => {
  const { email, password } = body

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })
  if (!user) throw new AuthError('Email không tồn tại')

  const isPasswordMatch = await comparePassword(password, user.password)

  if (!isPasswordMatch) throw new AuthError('Mật khẩu không chính xác')

  const accessToken = await signAccessToken({
    userId: user.id,
    role: user.role
  })

  const refreshToken = await signRefreshToken({
    userId: user.id,
    role: user.role
  })

  const { exp } = await verifyRefreshToken(refreshToken)

  const refreshTokenExpiresAt = new Date(exp * 1000)

  await prisma.$transaction(async tx => {
    const tokenCount = await tx.session.count({
      where: { userId: user.id }
    })

    if (tokenCount >= 5) {
      const oldestToken = await tx.session.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' }
      })

      if (oldestToken)
        await tx.session.delete({
          where: { token: oldestToken.token }
        })
    }

    await tx.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt
      }
    })
  })

  return {
    user,
    accessToken,
    refreshToken
  }
}

export const signOutService = async (refreshToken: string) => {
  await prisma.session.delete({
    where: { token: refreshToken }
  })
  return 'Đăng xuất thành công'
}

export const refreshTokenService = async (refreshToken: string) => {
  let decodedRefreshToken: TokenPayload
  try {
    decodedRefreshToken = await verifyRefreshToken(refreshToken)
  } catch (error) {
    throw new AuthError('Refresh token không hợp lệ')
  }

  const refreshTokenDoc = await prisma.session.findUniqueOrThrow({
    where: { token: refreshToken },
    include: { user: true }
  })

  const user = refreshTokenDoc.user

  const newAccessToken = await signAccessToken({
    userId: user.id,
    role: user.role
  })

  const newRefreshToken = await signRefreshToken({
    userId: user.id,
    role: user.role,
    exp: decodedRefreshToken.exp
  })
  await prisma.session.delete({
    where: { token: refreshToken }
  })
  await prisma.session.create({
    data: {
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshTokenDoc.expiresAt
    }
  })

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
}

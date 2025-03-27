import { Role } from '@prisma/client'
import console from 'consola'

import envConfig from '@/configs/env.config'
import { PrismaErrorCode } from '@/constants/error-reference'
import prisma from '@/database'
import { CreateAccountBodyType } from '@/schemas/account.schema'
import { hashPassword } from '@/utils/crypto'
import { EntityError, isPrismaClientKnownRequestError } from '@/utils/errors'

export const initAdminAccount = async () => {
  const countAccount = await prisma.user?.count()

  if (countAccount !== 0) return

  const email = envConfig.ADMIN_EMAIL
  const password = envConfig.ADMIN_PASSWORD

  const hashedPassword = await hashPassword(password)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      name: 'Admin:Ronaldo',
      avatar: undefined
    }
  })

  console.success(`Tạo tài khoản admin thành công: ${email} - ${password}`)
}

export const createUserAccount = async (body: CreateAccountBodyType) => {
  const { email, password, name, avatar } = body

  try {
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.USER,
        name,
        avatar: avatar || undefined
      }
    })
    return user
  } catch (errors: any) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.UniqueConstraintViolation) {
      throw new EntityError([{ field: 'email', message: 'Email đã tồn tại' }])
    }
    throw errors
  }
}

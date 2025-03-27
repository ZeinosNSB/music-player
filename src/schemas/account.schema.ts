import { Role } from '@prisma/client'
import { z } from 'zod'

import { SignInResponseSchema } from '@/schemas/auth.schema'

export const CreateAccountBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, {
      message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
    }),
    name: z.string().min(3, {
      message: 'Tên phải chứa ít nhất 3 ký tự'
    }),
    avatar: z.string().url().optional()
  })
  .strict()

export type CreateAccountBodyType = z.infer<typeof CreateAccountBodySchema>

export const AccountSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum([Role.ADMIN, Role.USER]).optional(),
  avatar: z.string().nullable()
})

export type AccountType = z.infer<typeof AccountSchema>

export const AccountResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    account: AccountSchema
  })
})

export type AccountResponseType = z.infer<typeof AccountResponseSchema>

export const AccountListResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    accounts: z.array(AccountSchema)
  })
})

export type AccountListResponseType = z.infer<typeof AccountListResponseSchema>

export const AccountIdParamSchema = z.object({
  id: z.string().cuid()
})

export type AccountIdParamType = z.infer<typeof AccountIdParamSchema>

export const UpdateAccountBodySchema = z
  .object({
    name: z.string().min(3, {
      message: 'Tên phải chứa ít nhất 3 ký tự'
    }),
    avatar: z.string().url().optional(),
    email: z.string().email(),
    role: z.enum([Role.ADMIN, Role.USER]).optional(),
    password: z
      .string()
      .min(6, {
        message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
      })
      .optional(),
    confirmPassword: z
      .string()
      .min(6, {
        message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
      })
      .optional()
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password && confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword']
      })
    }
  })

export type UpdateAccountBodyType = z.infer<typeof UpdateAccountBodySchema>

export const ChangePasswordBodySchema = z
  .object({
    oldPassword: z.string().min(6),
    password: z.string().min(6, {
      message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
    }),
    confirmPassword: z.string().min(6, {
      message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
    })
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu mới không khớp',
        path: ['confirmPassword']
      })
    }
  })

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>

export const ChangePasswordResponseSchema = SignInResponseSchema

export type ChangePasswordResponseType = z.infer<typeof ChangePasswordResponseSchema>

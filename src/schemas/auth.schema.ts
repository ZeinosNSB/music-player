import { Role } from '@prisma/client'
import { z } from 'zod'

export const SignInBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, {
      message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
    })
  })
  .strict()

export type SignInBodyType = z.infer<typeof SignInBodySchema>

export const SignInResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    account: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum([Role.ADMIN, Role.USER]),
      avatar: z.string().nullable()
    }),
    accessToken: z.string(),
    refreshToken: z.string()
  })
})

export type SignInResponseType = z.infer<typeof SignInResponseSchema>

export const SignOutBodySchema = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type SignOutBodyType = z.infer<typeof SignOutBodySchema>

export const RefreshTokenBodySchema = SignOutBodySchema

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

export const RefreshTokenResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  })
})

export type RefreshTokenResponseType = z.infer<typeof RefreshTokenResponseSchema>

export const ForgotPasswordBodySchema = SignInBodySchema.pick({ email: true })

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>

export const ResetPasswordBodySchema = z
  .object({
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

export type ResetPasswordBodyType = z.infer<typeof ResetPasswordBodySchema>

export const ResetPasswordQuerySchema = z.object({
  token: z.string()
})

export type ResetPasswordQueryType = z.infer<typeof ResetPasswordQuerySchema>

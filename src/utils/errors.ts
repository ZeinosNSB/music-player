import { Prisma } from '@prisma/client'
import { StatusCode } from 'hono/utils/http-status'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

export type PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError

export const isStatusError = (error: unknown): error is StatusError => error instanceof StatusError

export const isZodError = (error: unknown): error is ZodError => error instanceof ZodError

export const isEntityError = (error: unknown): error is EntityError => error instanceof EntityError

export const isAuthError = (error: unknown): error is AuthError => error instanceof AuthError

export const isPrismaClientKnownRequestError = (error: unknown): error is PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError

export class StatusError extends Error {
  status: StatusCode
  constructor(status: StatusCode, message: string) {
    super(message)
    this.status = status
  }
}

export class EntityError extends Error {
  fields: {
    message: string
    field: string
  }[]
  status = StatusCodes.UNPROCESSABLE_ENTITY
  constructor(fields: { message: string; field: string }[]) {
    super('Data Validation Error')
    this.fields = fields
  }
}

export class AuthError extends StatusError {
  constructor(message: string) {
    super(StatusCodes.UNAUTHORIZED, message)
  }
}

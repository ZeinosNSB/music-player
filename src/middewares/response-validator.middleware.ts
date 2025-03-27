import { Context } from 'hono'
import { z } from 'zod'

const validationErrorResponse = (reason: string) => {
  return new Response(reason, {
    status: 401
  })
}

type ResponseValidatorFnResponse<T = any> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      reason: string
    }

const createZodValidator = <T>(schema: z.ZodType<T>) => {
  return (value: any): ResponseValidatorFnResponse<T> => {
    const result = schema.safeParse(value)
    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        reason: result.error.message
      }
    }
  }
}

const responseValidator = <T>(status: number, schema: z.ZodType<T>) => {
  const validationFn = createZodValidator(schema)

  return async (c: Context, next: () => Promise<void>) => {
    await next()

    if (c.res.status >= 400) {
      return
    }

    if (!c.res.headers.get('content-type')?.startsWith('application/json')) {
      c.res = validationErrorResponse('The content is not JSON')
      return
    }

    if (c.res.status !== status) {
      c.res = validationErrorResponse(`The status is not ${status}`)
      return
    }

    const clonedRes = c.res.clone()
    const value = await clonedRes.json()

    const result = validationFn(value)
    if (!result.success) {
      c.res = validationErrorResponse(result.reason)
      return
    }

    c.res = new Response(JSON.stringify(result.data), {
      status: c.res.status,
      headers: c.res.headers
    })
  }
}

export default responseValidator

import { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { HTTPResponseError } from 'hono/types'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { StatusCodes } from 'http-status-codes'

import { isAuthError, isEntityError, isStatusError, isZodError } from '@/utils/errors'

const handleError = (error: HTTPResponseError | Error, c: Context) => {
  console.log(error)
  if (isStatusError(error)) {
    return c.json(
      {
        statusCode: error.status,
        message: error.message
      },
      error.status as ContentfulStatusCode
    )
  }

  if (isEntityError(error)) {
    return c.json(
      {
        statusCode: error.status,
        message: 'Data Validation Error',
        errors: error.fields
      },
      error.status as ContentfulStatusCode
    )
  }

  if (isAuthError(error)) {
    setCookie(c, 'sessionToken', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true
    })

    return c.json({
      statusCode: error.status,
      message: error.message
    })
  }

  if (isZodError(error)) {
    const { issues } = error
    const errors = issues.map(issue => ({
      ...issue,
      field: issue.path.join('.')
    }))
    return c.json(
      {
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `Validation failed for ${errors.length} field(s). Please review the input data.`,
        errors
      },
      StatusCodes.UNPROCESSABLE_ENTITY
    )
  }

  return c.json(
    {
      status: 'Server Error',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error'
    },
    StatusCodes.INTERNAL_SERVER_ERROR
  )
}

export default handleError

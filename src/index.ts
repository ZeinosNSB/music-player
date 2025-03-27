import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

import handleError from '@/middewares/handle-error.middleware'
import routes from '@/routes'
import { initAdminAccount } from '@/services/account.service'

const app = new Hono()

// init middleware
app.use(logger())
app.use(secureHeaders())
app.use(prettyJSON())

// init routes
app.route('/v1/api', routes)

initAdminAccount()

// init error handler
app.onError(handleError)

export default {
  port: 4000,
  fetch: app.fetch
}

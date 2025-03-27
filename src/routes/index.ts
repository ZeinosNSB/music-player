import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { jwt } from 'hono/jwt'

import { EnvConfig } from '@/configs/env.config'
import authRoute from '@/routes/auth.route'
import favoriteRoute from '@/routes/favorite.route'
import historyRoute from '@/routes/history.route'
import playlistRoute from '@/routes/playlist.route'
import searchRoute from '@/routes/search.route'
import songRoute from '@/routes/song.route'
import { Variables } from '@/types/jwt.type'

const app = new Hono<{
  Bindings: EnvConfig
  Variables: Variables
}>()

app.use('*', (c, next) => {
  const publicRouteEndings = ['/login', '/register']

  const path = c.req.path

  const isPublicRoute = publicRouteEndings.some(route => path.endsWith(route) || path.includes(route))

  if (isPublicRoute) return next()

  const { ACCESS_TOKEN_SECRET } = env(c)

  const jwtMiddleware = jwt({
    secret: ACCESS_TOKEN_SECRET
  })

  return jwtMiddleware(c, next)
})

app.route('/auth', authRoute)
app.route('/song', songRoute)
app.route('/playlist', playlistRoute)
app.route('/favorite', favoriteRoute)
app.route('/search', searchRoute)
app.route('/history', historyRoute)

export default app

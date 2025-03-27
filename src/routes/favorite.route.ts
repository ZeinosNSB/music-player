import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'

import { FavoriteBodySchema, FavoriteIdParamSchema } from '@/schemas/favorite.schema'
import { addToFavorites, getFavorites, removeFromFavorites } from '@/services/favorite.service'
import { TokenPayload } from '@/types/jwt.type'

const app = new Hono()

app.post('/add', zValidator('json', FavoriteBodySchema), async c => {
  const { songId } = c.req.valid('json')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId

  const { favorite, song } = await addToFavorites(accountId, songId)

  return c.json(
    {
      message: 'Thêm bài hát vào danh sách yêu thích thành công',
      metadata: { favorite, song }
    },
    StatusCodes.OK
  )
})

app.delete('/:songId', zValidator('param', FavoriteIdParamSchema), async c => {
  const { songId } = c.req.valid('param')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId

  await removeFromFavorites(accountId, songId)

  return c.json(
    {
      message: 'Xóa bài hát khỏi danh sách yêu thích thành công'
    },
    StatusCodes.OK
  )
})

app.get('/list', async c => {
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const songs = await getFavorites(accountId)

  return c.json(
    {
      message: 'Lấy danh sách bài hát yêu thích thành công',
      metadata: { songs }
    },
    StatusCodes.OK
  )
})

export default app

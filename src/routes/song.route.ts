import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'

import responseValidator from '@/middewares/response-validator.middleware'
import { ListSongResponseSchema, SongIdParamSchema, SongResponseSchema } from '@/schemas/song.schema'
import { getNewReleases, getSongInfo, getTopSongs } from '@/services/song.service'

const app = new Hono()

app.get(
  '/info/:id',
  zValidator('param', SongIdParamSchema),
  responseValidator(StatusCodes.OK, SongResponseSchema),
  async c => {
    const { id } = c.req.valid('param')
    const song = await getSongInfo(id)

    return c.json(
      {
        message: 'Lấy thông tin bài hát thành công',
        metadata: { song }
      },
      StatusCodes.OK
    )
  }
)

app.get('top', responseValidator(StatusCodes.OK, ListSongResponseSchema), async c => {
  const topSongs = await getTopSongs()

  return c.json(
    {
      message: 'Lấy danh sách bài hát thành công',
      metadata: { songs: topSongs }
    },
    StatusCodes.OK
  )
})

app.get('/new-releases', responseValidator(StatusCodes.OK, ListSongResponseSchema), async c => {
  const newReleases = await getNewReleases()

  return c.json(
    {
      message: 'Lấy danh sách bài hát thành công',
      metadata: { songs: newReleases }
    },
    StatusCodes.OK
  )
})

export default app

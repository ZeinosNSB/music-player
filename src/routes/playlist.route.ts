import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'

import responseValidator from '@/middewares/response-validator.middleware'
import {
  CreatePlaylistBodySchema,
  PlaylistIdParamSchema,
  PlaylistResponseSchema,
  PlaylistSongIdParamsSchema,
  SharePlaylistBodySchema
} from '@/schemas/playlist.schema'
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistDetails,
  getUserPlaylists,
  removeSongFromPlaylist,
  sharePlaylist
} from '@/services/playlist.service'
import { TokenPayload } from '@/types/jwt.type'

const app = new Hono()

app.get('details/:playlistId', zValidator('param', PlaylistIdParamSchema), async c => {
  const { playlistId } = c.req.valid('param')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const playlist = await getPlaylistDetails(playlistId, accountId)

  return c.json(
    {
      message: 'Lấy thông tin playlist thành công',
      metadata: {
        playlist
      }
    },
    StatusCodes.OK
  )
})

app.post(
  'create',
  zValidator('json', CreatePlaylistBodySchema),
  responseValidator(StatusCodes.OK, PlaylistResponseSchema),
  async c => {
    const body = c.req.valid('json')
    const accountId = (c.get('jwtPayload') as TokenPayload).userId
    const playlist = await createPlaylist(body, accountId)

    return c.json(
      {
        message: 'Tạo playlist thành công',
        metadata: {
          playlist
        }
      },
      StatusCodes.OK
    )
  }
)

app.get('/user', async c => {
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const playlists = await getUserPlaylists(accountId)

  return c.json(
    {
      message: 'Lấy danh sách playlist thành công',
      metadata: {
        playlists
      }
    },
    StatusCodes.OK
  )
})

app.post('/:playlistId/songs/:songId', zValidator('param', PlaylistSongIdParamsSchema), async c => {
  const { playlistId, songId } = c.req.valid('param')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const song = await addSongToPlaylist(playlistId, songId, accountId)

  return c.json(
    {
      message: 'Thêm bài hát vào playlist thành công',
      metadata: { song }
    },
    StatusCodes.OK
  )
})

app.delete('/:playlistId/songs/:songId', zValidator('param', PlaylistSongIdParamsSchema), async c => {
  const { playlistId, songId } = c.req.valid('param')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  await removeSongFromPlaylist(playlistId, songId, accountId)

  return c.json(
    {
      message: 'Xóa bài hát khỏi playlist thành công'
    },
    StatusCodes.OK
  )
})

app.delete('/:playlistId', zValidator('param', PlaylistIdParamSchema), async c => {
  const { playlistId } = c.req.valid('param')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  await deletePlaylist(playlistId, accountId)

  return c.json(
    {
      message: 'Xóa playlist thành công'
    },
    StatusCodes.OK
  )
})

app.post('/share', zValidator('json', SharePlaylistBodySchema), zValidator('param', PlaylistIdParamSchema), async c => {
  const { targetId } = c.req.valid('json')
  const { playlistId } = c.req.valid('param')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId

  const playlist = await sharePlaylist(playlistId, accountId, targetId)

  return c.json(
    {
      message: 'Chia sẻ playlist thành công',
      metadata: { playlist }
    },
    StatusCodes.OK
  )
})

export default app

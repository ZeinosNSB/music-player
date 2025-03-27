import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import { ListeningHistoryQuerySchema, RecordHistoryBodySchema } from '@/schemas/history.schema'
import { clearListeningHistory, getListeningHistory, recordListening } from '@/services/history.service'
import { TokenPayload } from '@/types/jwt.type'

const app = new Hono()

app.post('/record', zValidator('json', RecordHistoryBodySchema), async c => {
  const { songId, durationPlayed } = c.req.valid('json')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const { history, song } = await recordListening(accountId, songId, durationPlayed)

  return c.json({
    message: 'Lịch sử nghe nhạc đã được ghi lại',
    metadata: { history, song }
  })
})

app.get('/list', zValidator('query', ListeningHistoryQuerySchema), async c => {
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const { limit, offset } = c.req.valid('query')

  const { history, pagination } = await getListeningHistory(accountId, limit as number, offset as number)

  return c.json({
    message: 'Lịch sử nghe nhạc',
    metadata: { history, pagination }
  })
})

app.delete('/clear', async c => {
  const accountId = (c.get('jwtPayload') as TokenPayload).userId

  await clearListeningHistory(accountId)

  return c.json({ message: 'Lịch sử nghe nhạc đã được xóa' })
})

export default app

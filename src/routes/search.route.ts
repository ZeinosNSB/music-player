import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import { GetSearchHistoryQuerySchema, SearchSongQuerySchema } from '@/schemas/search.schema'
import { clearSearchHistory, getSearchHistory, getSearchSuggestion, searchMusic } from '@/services/search.service'
import { TokenPayload } from '@/types/jwt.type'

const app = new Hono()

app.get('/', zValidator('query', SearchSongQuerySchema), async c => {
  const { keyword } = c.req.valid('query')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const result = await searchMusic(keyword)

  return c.json({
    message: 'Tìm kiếm thành công',
    metadata: { result }
  })
})

app.get('/popular', async c => {
  const result = await getSearchSuggestion()

  return c.json({
    message: 'Lấy từ khóa tìm kiếm phổ biến thành công',
    metadata: { result }
  })
})

app.get('/history', zValidator('query', GetSearchHistoryQuerySchema), async c => {
  const { limit } = c.req.valid('query')
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  const result = await getSearchHistory(accountId, limit)

  return c.json({
    message: 'Lấy lịch sử tìm kiếm thành công',
    metadata: { result }
  })
})

app.delete('/history', async c => {
  const accountId = (c.get('jwtPayload') as TokenPayload).userId
  await clearSearchHistory(accountId)

  return c.json({
    message: 'Xóa lịch sử tìm kiếm thành công'
  })
})

export default app

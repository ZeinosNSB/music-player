import { z } from 'zod'

export const SearchSongQuerySchema = z.object({
  keyword: z.string()
})

export type SearchSongQuery = z.infer<typeof SearchSongQuerySchema>

export const GetSearchHistoryQuerySchema = z.object({
  limit: z.coerce.number().default(10)
})

export type GetSearchHistoryQuery = z.infer<typeof GetSearchHistoryQuerySchema>

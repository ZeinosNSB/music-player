import { z } from 'zod'

export const RecordHistoryBodySchema = z.object({
  songId: z.string(),
  durationPlayed: z.coerce.number()
})

export type RecordHistoryBody = z.infer<typeof RecordHistoryBodySchema>

export const ListeningHistoryQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional()
})

export type ListeningHistoryQuery = z.infer<typeof ListeningHistoryQuerySchema>

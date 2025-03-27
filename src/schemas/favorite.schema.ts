import { z } from 'zod'

export const FavoriteBodySchema = z.object({
  songId: z.string()
})

export type FavoriteBody = z.infer<typeof FavoriteBodySchema>

export const FavoriteIdParamSchema = FavoriteBodySchema.pick({ songId: true })

export type FavoriteIdParam = z.infer<typeof FavoriteIdParamSchema>

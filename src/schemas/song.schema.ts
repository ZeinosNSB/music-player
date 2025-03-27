import { z } from 'zod'

export const SongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artists: z.array(z.string()),
  thumbnail: z.string(),
  duration: z.coerce.number(),
  source128: z.string()
})

export type SongType = z.infer<typeof SongSchema>

export const SongResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    song: SongSchema
  })
})

export type SongResponseType = z.infer<typeof SongResponseSchema>

export const SongIdParamSchema = z.object({
  id: z.string()
})

export type SongIdParamType = z.infer<typeof SongIdParamSchema>

export const ListSongResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    songs: z.array(SongSchema.omit({ source128: true }))
  })
})

export type ListSongResponse = z.infer<typeof ListSongResponseSchema>

import { z } from 'zod'

export const CreatePlaylistBodySchema = z.object({
  name: z.string(),
  isPublic: z.boolean(),
  description: z.string().optional(),
  thumbnail: z.string().optional()
})

export type CreatePlaylistBody = z.infer<typeof CreatePlaylistBodySchema>

export const PlaylistIdParamSchema = z.object({
  playlistId: z.string()
})

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  thumbnail: z.string().optional(),
  userId: z.string(),
  createdAt: z.string()
})

export type Playlist = z.infer<typeof PlaylistSchema>

export const PlaylistResponseSchema = z.object({
  message: z.string(),
  metadata: z.object({
    playlist: PlaylistSchema
  })
})

export const PlaylistSongIdParamsSchema = PlaylistIdParamSchema.extend({
  songId: z.string()
})

export type PlaylistSongIdParams = z.infer<typeof PlaylistSongIdParamsSchema>

export const SharePlaylistBodySchema = z.object({
  targetId: z.string()
})

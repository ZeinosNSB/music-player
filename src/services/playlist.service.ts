import { StatusCodes } from 'http-status-codes'

import { PrismaErrorCode } from '@/constants/error-reference'
import prisma from '@/database'
import { CreatePlaylistBody } from '@/schemas/playlist.schema'
import { getSongInfo } from '@/services/song.service'
import { getDetailPlaylist } from '@/services/zing-api.service'
import { EntityError, isPrismaClientKnownRequestError, StatusError } from '@/utils/errors'

export const createPlaylist = async (body: CreatePlaylistBody, accountId: string) => {
  try {
    const { name, description, thumbnail, isPublic } = body

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic,
        thumbnail,
        userId: accountId
      }
    })

    return playlist
  } catch (errors) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.UniqueConstraintViolation) {
      throw new EntityError([{ field: 'name', message: 'Tên playlist đã tồn tại. Vui lòng đặt lại tên' }])
    }
  }
}

export const getUserPlaylists = async (accountId: string) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: {
        userId: accountId
      },
      orderBy: { createdAt: 'desc' },
      include: {
        PlaylistSong: {
          select: { song: true },
          take: 5
        }
      }
    })

    return playlists
  } catch (errors) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.RecordNotFound) {
      throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
    }
  }
}

export const getPlaylistDetails = async (playlistId: string, accountId: string) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        PlaylistSong: {
          include: { song: true },
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    })

    if (!playlist) {
      try {
        const zingPlaylist = await getDetailPlaylist(playlistId)

        const formattedPlaylist = {
          id: zingPlaylist.id,
          name: zingPlaylist.title,
          description: zingPlaylist.description || null,
          thumbnail: zingPlaylist.thumbnailM,
          isPublic: true,
          songs:
            zingPlaylist.songs?.map((song: any) => ({
              id: song.id,
              title: song.title,
              artist: song.artistsNames,
              duration: song.duration,
              thumbnail: song.thumbnailM
            })) || []
        }

        return formattedPlaylist
      } catch (zingError) {
        console.error('Error getting Zing playlist:', zingError)
        throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
      }
    }

    if (!playlist.isPublic && playlist.userId !== accountId) {
      const sharedWithUser = await prisma.playlistShare.findUnique({
        where: {
          playlistId_userId: {
            playlistId,
            userId: accountId || ''
          }
        }
      })

      if (!sharedWithUser) throw new StatusError(StatusCodes.NOT_FOUND, 'Không tìm thấy playlist')
    }

    const { PlaylistSong, ...rest } = playlist

    return {
      ...rest,
      songs: playlist.PlaylistSong.map(ps => ps.song)
    }
  } catch (error) {
    console.error('Error getting playlist details:', error)
    throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
  }
}

export const addSongToPlaylist = async (playlistId: string, songId: string, accountId: string) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    })

    if (!playlist || playlist.userId !== accountId) {
      throw new StatusError(StatusCodes.NOT_FOUND, 'Không tìm thấy playlist')
    }

    const song = await getSongInfo(songId)

    const existingEntry = await prisma.playlistSong.findFirst({
      where: {
        playlistId,
        songId: song?.id as string
      }
    })

    if (existingEntry) {
      throw new EntityError([{ field: 'songId', message: 'Bài hát đã tồn tại trong playlist' }])
    }

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId: song?.id as string
      }
    })

    return playlistSong
  } catch (errors) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.RecordNotFound) {
      throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
    }
  }
}

export const removeSongFromPlaylist = async (playlistId: string, songId: string, accountId: string) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    })

    if (!playlist || playlist.userId !== accountId) {
      throw new StatusError(StatusCodes.NOT_FOUND, 'Không tìm thấy playlist')
    }

    const playlistSong = await prisma.playlistSong.deleteMany({
      where: {
        playlistId: playlist.id,
        songId
      }
    })

    return playlistSong
  } catch (errors) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.RecordNotFound) {
      throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
    }
  }
}

export const deletePlaylist = async (playlistId: string, accountId: string) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    })

    if (!playlist || playlist.userId !== accountId) {
      throw new StatusError(StatusCodes.NOT_FOUND, 'Không tìm thấy playlist')
    }

    const deletedPlaylist = await prisma.playlist.delete({
      where: { id: playlistId }
    })

    return deletedPlaylist
  } catch (errors) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.RecordNotFound) {
      throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
    }
  }
}

export const sharePlaylist = async (playlistId: string, accountId: string, targetId: string) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    })

    if (!playlist || playlist.userId !== accountId) {
      throw new StatusError(StatusCodes.NOT_FOUND, 'Không tìm thấy playlist')
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId }
    })

    if (!targetUser) {
      throw new StatusError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng')
    }

    const playlistShare = await prisma.playlistShare.create({
      data: {
        playlistId,
        userId: targetId
      }
    })

    return playlistShare
  } catch (errors) {
    if (isPrismaClientKnownRequestError(errors) && errors.code === PrismaErrorCode.RecordNotFound) {
      throw new EntityError([{ field: 'playlistId', message: 'Không tìm thấy playlist' }])
    }
  }
}

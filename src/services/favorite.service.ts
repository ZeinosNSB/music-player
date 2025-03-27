import { StatusCodes } from 'http-status-codes'

import prisma from '@/database'
import { getSongInfo } from '@/services/song.service'
import { StatusError } from '@/utils/errors'

export const addToFavorites = async (accountId: string, songId: string) => {
  try {
    const existingFavorite = await prisma.favoriteList.findFirst({
      where: {
        userId: accountId,
        songId
      }
    })

    if (existingFavorite) throw new StatusError(StatusCodes.FORBIDDEN, 'Bài hát đã có trong danh sách yêu thích')

    const song = await getSongInfo(songId)

    const favorite = await prisma.favoriteList.create({
      data: {
        userId: accountId,
        songId
      }
    })

    return { favorite, song }
  } catch (errors: any) {
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const removeFromFavorites = async (accountId: string, songId: string) => {
  try {
    const favorite = await prisma.favoriteList.deleteMany({
      where: {
        userId: accountId,
        songId
      }
    })

    return favorite
  } catch (errors: any) {
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const getFavorites = async (accountId: string) => {
  try {
    const favorites = await prisma.favoriteList.findMany({
      where: { userId: accountId },
      include: { song: true },
      orderBy: { createdAt: 'desc' }
    })

    const songs = favorites.map(fav => ({
      id: fav.id,
      song: fav.song,
      addedAt: fav.createdAt
    }))

    return songs
  } catch (errors: any) {
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

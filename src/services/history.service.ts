import { StatusCodes } from 'http-status-codes'

import prisma from '@/database'
import { getSongInfo } from '@/services/song.service'
import { StatusError } from '@/utils/errors'

export const recordListening = async (accountId: string, songId: string, durationPlayed: number) => {
  try {
    const song = await getSongInfo(songId)

    const history = await prisma.listeningHistory.create({
      data: {
        userId: accountId,
        songId: song?.id,
        durationPlayed
      }
    })

    return { history, song }
  } catch (errors: any) {
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const getListeningHistory = async (accountId: string, limit: number, offset: number) => {
  try {
    const history = await prisma.listeningHistory.findMany({
      where: { userId: accountId },
      include: { song: true },
      orderBy: { playedAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.listeningHistory.count({ where: { userId: accountId } })

    const formatedHistory = history.map(entry => ({
      id: entry.id,
      song: entry.song,
      durationPlayed: entry.durationPlayed,
      playedAt: entry.playedAt
    }))

    return {
      history: formatedHistory,
      pagination: {
        total,
        limit,
        offset
      }
    }
  } catch (errors: any) {
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const clearListeningHistory = async (accountId: string) => {
  try {
    await prisma.listeningHistory.deleteMany({ where: { userId: accountId } })
  } catch (errors: any) {
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

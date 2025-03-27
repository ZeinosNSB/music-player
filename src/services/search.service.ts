import { StatusCodes } from 'http-status-codes'

import prisma from '@/database'
import { search, Suggest } from '@/services/zing-api.service'
import { StatusError } from '@/utils/errors'

export const searchMusic = async (keyword: string, accountId?: string) => {
  try {
    if (!keyword) {
      throw new StatusError(StatusCodes.BAD_REQUEST, 'Keyword is required')
    }

    if (accountId) {
      await prisma.searchHistory.create({
        data: {
          userId: accountId,
          keyword
        }
      })
    }

    const searchResult = await search(keyword)

    const formatResult = {
      songs: searchResult.data.songs.map((song: any) => ({
        songId: song.encodeId,
        title: song.title,
        artists: song.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          thumbnailM: artist.thumbnailM
        })),
        thumbnail: song.thumbnailM,
        duration: song.duration
      })),

      playlists: searchResult.data.playlists.map((playlist: any) => ({
        playlistId: playlist.encodeId,
        title: playlist.title,
        thumbnail: playlist.thumbnailM,
        artistNames: playlist.artistNames,
        userName: playlist.userName
      })),

      artists: searchResult.data.artists.map((artist: any) => ({
        artistId: artist.encodeId,
        name: artist.name,
        thumbnail: artist.thumbnailM,
        playlistId: artist.playlistId,
        totalFollow: artist.totalFollow
      })),

      top: {
        topId: searchResult.data.top.encodeId,
        title: searchResult.data.top.title,
        artistsNames: searchResult.data.top.artistsNames,
        thumbnail: searchResult.data.top.thumbnailM,
        artists: searchResult.data.top.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          thumbnailM: artist.thumbnailM
        })),
        duration: searchResult.data.top.duration
      }
    }

    return formatResult
  } catch (errors: any) {
    console.log(errors)
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const getSearchHistory = async (accountId: string, limit: number) => {
  try {
    const searchHistories = await prisma.searchHistory.findMany({
      where: {
        userId: accountId
      },
      orderBy: {
        searchedAt: 'desc'
      },
      take: limit
    })

    return searchHistories
  } catch (errors: any) {
    console.log(errors)
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const clearSearchHistory = async (accountId: string) => {
  try {
    await prisma.searchHistory.deleteMany({
      where: {
        userId: accountId
      }
    })

    return true
  } catch (errors: any) {
    console.log(errors)
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

export const getSearchSuggestion = async () => {
  try {
    const suggest = await Suggest()
    const searchHistories = await prisma.searchHistory.groupBy({
      by: ['keyword'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          keyword: 'desc'
        }
      },
      take: 5
    })

    return { suggest, searchHistories }
  } catch (errors: any) {
    console.log(errors)
    throw new StatusError(StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

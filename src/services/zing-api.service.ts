import axios from 'axios'

import envConfig from '@/configs/env.config'
import {
  CTIME,
  hashCategoryMV,
  hashListMV,
  hashParam,
  hashParamHome,
  hashParamNoId,
  hashSearchAll,
  hashSuggest
} from '@/utils/helpers'

async function getCookie(): Promise<any> {
  try {
    const res = await axios.get(envConfig.ZING_MP3_API_URL)
    const cookies = res.headers['set-cookie']
    return cookies![1]
  } catch (err) {
    console.error(err)
  }
}

async function requestZingMp3(path: string, qs: object): Promise<any> {
  const client = axios.create({
    baseURL: envConfig.ZING_MP3_API_URL
  })

  client.interceptors.response.use((res: any) => res.data)

  try {
    const cookie = await getCookie()
    const response = await client.get(path, {
      headers: {
        Cookie: cookie
      },
      params: {
        ...qs,
        ctime: CTIME,
        version: envConfig.ZING_MP3_API_VERSION,
        apiKey: envConfig.ZING_MP3_API_KEY
      }
    })
    return response
  } catch (err) {
    console.error(err)
  }
}

export const getSong = async (songId: string): Promise<any> =>
  requestZingMp3('/api/v2/song/get/streaming', {
    id: songId,
    sig: hashParam('/api/v2/song/get/streaming', songId)
  })

export const getDetailPlaylist = async (playlistId: string): Promise<any> =>
  requestZingMp3('/api/v2/page/get/playlist', {
    id: playlistId,
    sig: hashParam('/api/v2/page/get/playlist', playlistId)
  })

export const getHome = async (): Promise<any> =>
  requestZingMp3('/api/v2/page/get/home', {
    page: 1,
    segmentId: '-1',
    count: '30',
    sig: hashParamHome('/api/v2/page/get/home')
  })

export const getTop100 = async (): Promise<any> =>
  requestZingMp3('/api/v2/page/get/top-100', {
    sig: hashParamNoId('/api/v2/page/get/top-100')
  })

export const getChartHome = async (): Promise<any> =>
  requestZingMp3('/api/v2/page/get/chart-home', {
    sig: hashParamNoId('/api/v2/page/get/chart-home')
  })

export const getNewReleaseChart = async (): Promise<any> =>
  requestZingMp3('/api/v2/page/get/newrelease-chart', {
    sig: hashParamNoId('/api/v2/page/get/newrelease-chart')
  })

export const getInfoSong = async (songId: string): Promise<any> =>
  requestZingMp3('/api/v2/song/get/info', {
    id: songId,
    sig: hashParam('/api/v2/song/get/info', songId)
  })

export const getArtist = async (name: string): Promise<any> =>
  requestZingMp3('/api/v2/page/get/artist', {
    alias: name,
    sig: hashParamNoId('/api/v2/page/get/artist')
  })

export const getLyric = async (songId: string): Promise<any> =>
  requestZingMp3('/api/v2/lyric/get/lyric', {
    id: songId,
    sig: hashParam('/api/v2/lyric/get/lyric', songId)
  })

export const search = async (name: string): Promise<any> =>
  requestZingMp3('/api/v2/search/multi', {
    q: name,
    sig: hashParamNoId('/api/v2/search/multi')
  })

export const getListArtistSong = async (artistId: string, page: string, count: string): Promise<any> =>
  requestZingMp3('/api/v2/song/get/list', {
    id: artistId,
    type: 'artist',
    page,
    count,
    sort: 'new',
    sectionId: 'aSong',
    sig: hashListMV('/api/v2/song/get/list', artistId, 'artist', page, count)
  })

export const getListArtistPlaylist = async (artistId: string, page: string, count: string): Promise<any> =>
  requestZingMp3('/api/v2/playlist/get/list', {
    id: artistId,
    type: 'artist',
    page,
    count,
    sort: 'new',
    sectionId: 'aPlaylist',
    sig: hashListMV('/api/v2/playlist/get/list', artistId, 'artist', page, count)
  })

export const getSongsByArtistName = async (name: string, page: string, count: string): Promise<any> =>
  requestZingMp3('/api/v2/search', {
    q: name,
    type: 'song',
    page,
    count,
    sig: hashSearchAll('/api/v2/search', 'song', page, count)
  })

export const getPlaylistsByArtistName = async (name: string, page: string, count: string): Promise<any> =>
  requestZingMp3('/api/v2/search', {
    q: name,
    type: 'playlist',
    page,
    count,
    sig: hashSearchAll('/api/v2/search', 'playlist', page, count)
  })

export const getVideosByArtistName = async (name: string, page: string, count: string): Promise<any> =>
  requestZingMp3('/api/v2/search', {
    q: name,
    type: 'video',
    page,
    count,
    sig: hashSearchAll('/api/v2/search', 'video', page, count)
  })

export const Suggest = async (): Promise<any> =>
  requestZingMp3('/api/v2/app/get/recommend-keyword', {
    sig: hashSuggest('/api/v2/app/get/recommend-keyword')
  })

export const getListMV = async (id: string, page: string, count: string): Promise<any> =>
  requestZingMp3('/api/v2/video/get/list', {
    id,
    type: 'genre',
    page,
    count,
    sort: 'listen',
    sig: hashListMV('/api/v2/video/get/list', id, 'genre', page, count)
  })

export const getCategoryMV = async (id: string): Promise<any> =>
  requestZingMp3('/api/v2/genre/get/info', {
    id,
    type: 'video',
    sig: hashCategoryMV('/api/v2/genre/get/info', id, 'video')
  })

export const getVideo = async (videoId: string): Promise<any> =>
  requestZingMp3('/api/v2/page/get/video', {
    id: videoId,
    sig: hashParam('/api/v2/page/get/video', videoId)
  })

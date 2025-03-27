import prisma from '@/database'
import { getChartHome, getInfoSong, getNewReleaseChart, getSong } from '@/services/zing-api.service'

export const getSongInfo = async (id: string) => {
  try {
    const existingSong = await prisma.song.findUnique({
      where: { id }
    })

    if (existingSong) return existingSong

    const [songInfo, streamingInfo] = await Promise.all([getInfoSong(id), getSong(id)])

    const format = {
      id: songInfo.data.encodeId,
      title: songInfo.data.title,
      thumbnail: songInfo.data.thumbnail,
      duration: songInfo.data.duration,
      artists: songInfo.data.artists.map((artist: any) => artist.name),
      source128: streamingInfo.data['128']
    }

    await prisma.song.create({ data: format as any })

    return format
  } catch (errors) {
    console.log(errors)
  }
}

export const getTopSongs = async () => {
  try {
    const topSongs = await getChartHome()
    const format = topSongs.data.RTChart.items.map((song: any) => ({
      id: song.encodeId,
      title: song.title,
      thumbnail: song.thumbnail,
      artists: song.artists.map((artist: any) => artist.name),
      duration: song.duration
    }))

    return format
  } catch (errors) {
    console.log(errors)
  }
}

export const getNewReleases = async () => {
  try {
    const newReleases = await getNewReleaseChart()

    const format = newReleases.data.items.map((song: any) => ({
      id: song.encodeId,
      title: song.title,
      thumbnail: song.thumbnail,
      artists: song.artists.map((artist: any) => artist.name),
      duration: song.duration
    }))

    return format
  } catch (errors) {
    console.log(errors)
  }
}

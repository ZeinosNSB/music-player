export interface ZingMp3Response<T> {
  err: number
  msg: string
  data: T
  timestamp: number
}

export interface SongInfo {
  id: string
  title: string
  thumbnail: string
  artists: { id: string; name: string }[]
  album?: { id: string; title: string }
  duration: number
}

export interface StreamingInfo {
  '128'?: string
  '320'?: string
  lossless?: string
}

export interface Playlist {
  id: string
  title: string
  songs: SongInfo[]
}

export interface Artist {
  id: string
  name: string
  alias: string
  songs: SongInfo[]
  playlists: Playlist[]
}

export interface HomeData {
  items: Array<{
    sectionType: string
    items: SongInfo[] | Playlist[]
  }>
}

export interface ChartData {
  RTChart: {
    items: SongInfo[]
  }
  weekChart: {
    [key: string]: { items: SongInfo[] }
  }
}

export interface SearchResult {
  songs: SongInfo[]
  playlists: Playlist[]
  artists: Artist[]
}

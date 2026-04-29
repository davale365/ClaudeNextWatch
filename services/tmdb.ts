const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// Static genre maps — TMDb IDs rarely change
const MOVIE_GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
}

const TV_GENRES: Record<number, string> = {
  10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  10762: 'Kids', 9648: 'Mystery', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
  10768: 'War & Politics', 37: 'Western',
}

export interface TMDbTitle {
  id: number
  title: string
  type: 'movie' | 'tv'
  poster: string | null
  genres: string[]
  rating: number
  vote_count: number
  popularity: number
  release_year: number | null
  overview: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResult(item: any): TMDbTitle {
  const isMovie = item.media_type === 'movie'
  const genreMap = isMovie ? MOVIE_GENRES : TV_GENRES
  const rawDate = isMovie ? item.release_date : item.first_air_date

  return {
    id: item.id,
    title: isMovie ? item.title : item.name,
    type: item.media_type as 'movie' | 'tv',
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
    genres: (item.genre_ids as number[]).map((id) => genreMap[id]).filter(Boolean),
    rating: Math.round(item.vote_average * 10) / 10,
    vote_count: item.vote_count,
    popularity: Number(item.popularity ?? 0),
    release_year: rawDate ? new Date(rawDate).getFullYear() : null,
    overview: item.overview || null,
  }
}

// ─── Inverse maps for discover queries (name → ID) ───────────────────────────

const MOVIE_GENRE_IDS: Record<string, number> = Object.fromEntries(
  Object.entries(MOVIE_GENRES).map(([id, name]) => [name, Number(id)])
)

const TV_GENRE_IDS: Record<string, number> = Object.fromEntries(
  Object.entries(TV_GENRES).map(([id, name]) => [name, Number(id)])
)

// Separate mapper for /discover results — no media_type field, type is known upfront
function mapDiscoverResult(item: Record<string, unknown>, type: 'movie' | 'tv'): TMDbTitle {
  const genreMap = type === 'movie' ? MOVIE_GENRES : TV_GENRES
  const rawDate =
    type === 'movie'
      ? (item.release_date as string | undefined)
      : (item.first_air_date as string | undefined)

  return {
    id: item.id as number,
    title: type === 'movie' ? (item.title as string) : (item.name as string),
    type,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path as string}` : null,
    genres: ((item.genre_ids as number[]) ?? []).map((id) => genreMap[id]).filter(Boolean),
    rating: Math.round(((item.vote_average as number) ?? 0) * 10) / 10,
    vote_count: (item.vote_count as number) ?? 0,
    popularity: Number(item.popularity ?? 0),
    release_year: rawDate ? new Date(rawDate).getFullYear() : null,
    overview: (item.overview as string) || null,
  }
}

/**
 * Fetches up to 20 candidates from TMDb /discover filtered by genre names.
 * Results are sorted by vote_average descending with a minimum of 50 votes.
 */
export async function fetchCandidatesByGenres(
  genreNames: string[],
  type: 'movie' | 'tv'
): Promise<TMDbTitle[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY is not configured')

  const genreIdMap = type === 'movie' ? MOVIE_GENRE_IDS : TV_GENRE_IDS
  const genreIds = genreNames
    .map((name) => genreIdMap[name])
    .filter(Boolean)
    .join(',')

  if (!genreIds) return []

  const endpoint = type === 'movie' ? 'discover/movie' : 'discover/tv'
  const url =
    `${TMDB_BASE_URL}/${endpoint}` +
    `?api_key=${apiKey}` +
    `&with_genres=${genreIds}` +
    `&sort_by=vote_average.desc` +
    `&vote_count.gte=50` +
    `&language=en-US` +
    `&page=1`

  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`TMDb discover failed: ${res.status}`)

  const data = await res.json()
  return (data.results as Record<string, unknown>[])
    .slice(0, 20)
    .map((item) => mapDiscoverResult(item, type))
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchTitles(query: string): Promise<TMDbTitle[]> {
  if (!query.trim()) return []

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY is not configured')

  const url =
    `${TMDB_BASE_URL}/search/multi` +
    `?api_key=${apiKey}` +
    `&query=${encodeURIComponent(query)}` +
    `&include_adult=false` +
    `&language=en-US` +
    `&page=1`

  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`TMDb responded with ${res.status}`)

  const data = await res.json()

  type RawResult = { media_type: string; [key: string]: unknown }
  return (data.results as RawResult[])
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
    .slice(0, 20)
    .map(mapResult)
}

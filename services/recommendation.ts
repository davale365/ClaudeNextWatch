import type { Mood } from '@/types/database'
import type { WatchInteraction } from './interactions'
import type { TMDbTitle } from './tmdb'
import { fetchCandidatesByGenres } from './tmdb'
import { getPlatformsForTitle, DEFAULT_REGION } from './availability'

export { DEFAULT_REGION }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Candidate {
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  genres: string[]
  rating: number          // TMDb vote_average (0–10)
  vote_count: number
  popularity: number      // TMDb popularity score
  runtime_minutes: number | null
  platforms: string[]     // known streaming platforms for this title
}

export interface UserPreference {
  genres: string[]
  interaction: WatchInteraction
}

export interface ScoreInput {
  candidate: Candidate
  userPreferences: UserPreference[]
  mood: Mood
  timeAvailable: number   // minutes the user has available
  selectedPlatforms: string[]
}

export interface ScoreBreakdown {
  publicRating: number    // 0–1
  tasteMatch: number      // 0–1
  popularity: number      // 0–1
  context: number         // 0–1
  availability: number    // 0 | 0.5 | 1
}

export interface ScoreResult {
  score: number           // 0–100 integer
  breakdown: ScoreBreakdown
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Genres associated with each mood, covering both movie and TV genre labels
const MOOD_GENRES: Record<Mood, string[]> = {
  happy:    ['Comedy', 'Animation', 'Family', 'Romance', 'Music', 'Kids'],
  sad:      ['Drama', 'Romance'],
  excited:  ['Action', 'Adventure', 'Science Fiction', 'Thriller', 'Action & Adventure', 'Sci-Fi & Fantasy'],
  relaxed:  ['Documentary', 'Comedy', 'Animation', 'Family', 'Reality', 'Talk'],
  tense:    ['Thriller', 'Horror', 'Mystery', 'Crime', 'War', 'War & Politics'],
  romantic: ['Romance', 'Drama'],
}

const WEIGHTS = {
  publicRating: 0.35,
  tasteMatch:   0.25,
  popularity:   0.20,
  context:      0.10,
  availability: 0.10,
} as const

// ─── Sub-scorers (exported for testability) ───────────────────────────────────

/**
 * Rewards highly-rated titles, dampened by how many people voted.
 * log10 scale caps at ~1M votes. A 9.0 with 1M votes → 0.90.
 */
export function computePublicRatingScore(rating: number, voteCount: number): number {
  const normalizedVoteCount = Math.min(Math.log10(voteCount + 1) / 6, 1)
  return Math.min((rating / 10) * normalizedVoteCount, 1)
}

/**
 * Measures how many of the candidate's genres match genres the user
 * has binged or liked. Returns 0.5 when no positive signal exists.
 */
export function computeTasteMatchScore(
  candidateGenres: string[],
  userPreferences: UserPreference[]
): number {
  if (candidateGenres.length === 0) return 0.5

  const positiveInteractions = new Set<WatchInteraction>(['binged', 'liked'])
  const likedGenres = new Set<string>()

  for (const pref of userPreferences) {
    if (positiveInteractions.has(pref.interaction)) {
      pref.genres.forEach((g) => likedGenres.add(g))
    }
  }

  if (likedGenres.size === 0) return 0.5 // no positive signal → neutral

  const overlap = candidateGenres.filter((g) => likedGenres.has(g)).length
  return Math.min(overlap / candidateGenres.length, 1)
}

/**
 * Logarithmic normalization of TMDb popularity.
 * ~10 popularity → 0.35  |  ~100 → 0.67  |  ~1 000 → 1.0
 */
export function computePopularityScore(popularity: number): number {
  return Math.min(Math.log10(popularity + 1) / 3, 1)
}

/**
 * Combines mood–genre affinity (60%) and time-fit (40%).
 *
 * Mood fit:  fraction of candidate genres that match the mood's genre list.
 * Time fit:  for movies, checks runtime vs available time;
 *            for TV, a single episode (~20 min) is always possible.
 */
export function computeContextScore(
  candidate: Pick<Candidate, 'type' | 'genres' | 'runtime_minutes'>,
  mood: Mood,
  timeAvailable: number
): number {
  // Mood fit
  let moodScore: number
  if (candidate.genres.length === 0) {
    moodScore = 0.3 // unknown genres → below neutral
  } else {
    const preferred = MOOD_GENRES[mood]
    const overlap = candidate.genres.filter((g) => preferred.includes(g)).length
    moodScore = Math.min(overlap / candidate.genres.length, 1)
  }

  // Time fit
  let timeScore: number
  if (candidate.type === 'movie') {
    const runtime = candidate.runtime_minutes ?? 100 // assume ~100 min if unknown
    if (timeAvailable >= runtime) {
      timeScore = 1
    } else if (timeAvailable >= runtime * 0.75) {
      timeScore = 0.5 // close — user might still start it
    } else {
      timeScore = 0.1 // not enough time
    }
  } else {
    // TV: one episode is typically 20–60 min
    timeScore = timeAvailable >= 20 ? 1 : 0.3
  }

  return moodScore * 0.6 + timeScore * 0.4
}

/**
 * 1 if the title is on a platform the user selected.
 * 0.5 if platform data is unknown on either side.
 * 0 if confirmed unavailable on all selected platforms.
 */
export function computeAvailabilityScore(
  candidatePlatforms: string[],
  selectedPlatforms: string[]
): number {
  if (selectedPlatforms.length === 0 || candidatePlatforms.length === 0) return 0.5
  return candidatePlatforms.some((p) => selectedPlatforms.includes(p)) ? 1 : 0
}

// ─── Main function ────────────────────────────────────────────────────────────

export function getConfidenceScore({
  candidate,
  userPreferences,
  mood,
  timeAvailable,
  selectedPlatforms,
}: ScoreInput): ScoreResult {
  const breakdown: ScoreBreakdown = {
    publicRating: computePublicRatingScore(candidate.rating, candidate.vote_count),
    tasteMatch:   computeTasteMatchScore(candidate.genres, userPreferences),
    popularity:   computePopularityScore(candidate.popularity),
    context:      computeContextScore(candidate, mood, timeAvailable),
    availability: computeAvailabilityScore(candidate.platforms, selectedPlatforms),
  }

  const rawScore =
    breakdown.publicRating * WEIGHTS.publicRating +
    breakdown.tasteMatch   * WEIGHTS.tasteMatch   +
    breakdown.popularity   * WEIGHTS.popularity   +
    breakdown.context      * WEIGHTS.context      +
    breakdown.availability * WEIGHTS.availability

  return {
    score: Math.round(rawScore * 100),
    breakdown,
  }
}

// ─── Recommendation generator ─────────────────────────────────────────────────

export interface UserInteraction {
  title: {
    tmdb_id: number
    genres: string[]
    type: 'movie' | 'tv'
  }
  interaction: WatchInteraction
}

export interface RecommendationResult {
  title: TMDbTitle
  score: number
  reason: string
  platforms: string[]        // selected platforms this title is available on
  platformFallback: boolean  // true when no platform match found and this is a fallback
}

export interface Recommendations {
  safe: RecommendationResult
  stretch: RecommendationResult
  hidden: RecommendationResult
}

export interface RecommendationInput {
  userInteractions: UserInteraction[]
  mood: Mood
  timeAvailable: number
  selectedPlatforms: string[]
  excludeIds?: number[]   // additional tmdb_ids to exclude (e.g. already-seen recommendations)
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface PreferenceProfile {
  dominantGenres: string[]   // top genres by frequency from binged/liked titles
  avoidedGenres: Set<string> // genres from dropped/not_for_me titles
  watchedIds: Set<number>    // tmdb_ids already seen — exclude from candidates
}

function buildPreferenceProfile(interactions: UserInteraction[]): PreferenceProfile {
  const positive = new Set<WatchInteraction>(['binged', 'liked'])
  const negative = new Set<WatchInteraction>(['dropped', 'not_for_me'])

  const genreCounts = new Map<string, number>()
  const avoidedGenres = new Set<string>()
  const watchedIds = new Set<number>()

  for (const { title, interaction } of interactions) {
    watchedIds.add(title.tmdb_id)

    if (positive.has(interaction)) {
      title.genres.forEach((g) => genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1))
    }
    if (negative.has(interaction)) {
      title.genres.forEach((g) => avoidedGenres.add(g))
    }
  }

  const dominantGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
    .slice(0, 3)

  return { dominantGenres, avoidedGenres, watchedIds }
}

function tmdbToCandidate(t: TMDbTitle): Candidate {
  return {
    tmdb_id: t.id,
    title: t.title,
    type: t.type,
    genres: t.genres,
    rating: t.rating,
    vote_count: t.vote_count,
    popularity: t.popularity,
    runtime_minutes: null,
    platforms: getPlatformsForTitle(t.title),
  }
}

function makeReason(
  pick: 'safe' | 'stretch' | 'hidden',
  title: TMDbTitle,
  dominantGenres: string[]
): string {
  const medium = title.type === 'movie' ? 'film' : 'show'
  const topGenre = dominantGenres[0]

  switch (pick) {
    case 'safe':
      return topGenre
        ? `Highly rated ${medium} that matches your love of ${topGenre}`
        : `Highly rated ${medium} that matches what you've been watching`
    case 'stretch':
      return 'Slightly different from your usual taste, but strong reviews suggest you might enjoy it'
    case 'hidden':
      return 'Less popular but closely aligns with what you\'ve been watching'
  }
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function getRecommendations({
  userInteractions,
  mood,
  timeAvailable,
  selectedPlatforms,
  excludeIds = [],
}: RecommendationInput): Promise<Recommendations> {
  const { dominantGenres, avoidedGenres, watchedIds } =
    buildPreferenceProfile(userInteractions)
  excludeIds.forEach((id) => watchedIds.add(id))

  const fetchGenres = dominantGenres.length > 0 ? dominantGenres : ['Drama', 'Comedy', 'Action']

  const [movies, shows] = await Promise.all([
    fetchCandidatesByGenres(fetchGenres, 'movie'),
    fetchCandidatesByGenres(fetchGenres, 'tv'),
  ])

  const userPreferences: UserPreference[] = userInteractions.map(({ title, interaction }) => ({
    genres: title.genres,
    interaction,
  }))

  interface ScoredTitle { tmdbTitle: TMDbTitle; candidate: Candidate; result: ScoreResult }

  // Absolute quality floors per slot
  const SAFE_FLOOR    = 65
  const STRETCH_FLOOR = 60
  const HIDDEN_FLOOR  = 55

  function isEligible(t: TMDbTitle): boolean {
    if (watchedIds.has(t.id)) return false
    if (avoidedGenres.size > 0 && t.genres.length > 0) {
      return !t.genres.every((g) => avoidedGenres.has(g))
    }
    return true
  }

  function scoreTitle(tmdbTitle: TMDbTitle): ScoredTitle {
    const candidate = tmdbToCandidate(tmdbTitle)
    return {
      tmdbTitle,
      candidate,
      result: getConfidenceScore({ candidate, userPreferences, mood, timeAvailable, selectedPlatforms }),
    }
  }

  let pool: ScoredTitle[] = [...movies, ...shows]
    .filter(isEligible)
    .map(scoreTitle)
    .sort((a, b) => b.result.score - a.result.score)

  // ── Hard platform filter ──────────────────────────────────────────────────
  // When platforms are selected, only consider titles confirmed on those platforms.
  const activePool = selectedPlatforms.length > 0
    ? pool.filter((s) => s.candidate.platforms.some((p) => selectedPlatforms.includes(p)))
    : pool

  // ── Expand if fewer than 3 candidates meet the safe floor ────────────────
  if (activePool.filter((s) => s.result.score >= SAFE_FLOOR).length < 3) {
    const broadGenres = ['Drama', 'Comedy', 'Action', 'Thriller', 'Adventure', 'Science Fiction']
    const poolIds = new Set(pool.map((s) => s.tmdbTitle.id))
    const [moreMovies, moreShows] = await Promise.all([
      fetchCandidatesByGenres(broadGenres, 'movie'),
      fetchCandidatesByGenres(broadGenres, 'tv'),
    ])
    const additional = [...moreMovies, ...moreShows]
      .filter((t) => !poolIds.has(t.id) && isEligible(t))
      .map(scoreTitle)
    pool = [...pool, ...additional].sort((a, b) => b.result.score - a.result.score)
    // Rebuild activePool with the expanded pool
    const expanded = selectedPlatforms.length > 0
      ? pool.filter((s) => s.candidate.platforms.some((p) => selectedPlatforms.includes(p)))
      : pool
    expanded.forEach((s) => { if (!activePool.find((a) => a.tmdbTitle.id === s.tmdbTitle.id)) activePool.push(s) })
    activePool.sort((a, b) => b.result.score - a.result.score)
  }

  function tryPick(
    pred: (s: ScoredTitle) => boolean,
    exclude: Set<number>
  ): ScoredTitle | null {
    return activePool.find((s) => !exclude.has(s.tmdbTitle.id) && pred(s)) ?? null
  }

  function anyPick(exclude: Set<number>): ScoredTitle | null {
    return activePool.find((s) => !exclude.has(s.tmdbTitle.id)) ?? null
  }

  const usedIds = new Set<number>()

  // ── Safe: highest score >= 65 ─────────────────────────────────────────────
  const safePick = tryPick((s) => s.result.score >= SAFE_FLOOR, usedIds)
  if (!safePick) throw new Error('NOT_ENOUGH_MATCHES')
  usedIds.add(safePick.tmdbTitle.id)

  // ── Stretch: >= 60, prefer genre variety ─────────────────────────────────
  const stretchPick =
    tryPick((s) => s.result.score >= STRETCH_FLOOR && s.result.breakdown.tasteMatch < 0.5, usedIds) ??
    tryPick((s) => s.result.score >= STRETCH_FLOOR, usedIds) ??
    anyPick(usedIds) ??
    safePick
  if (stretchPick.tmdbTitle.id !== safePick.tmdbTitle.id) usedIds.add(stretchPick.tmdbTitle.id)

  // ── Hidden gem: >= 55, prefer lower popularity ────────────────────────────
  const hiddenPick =
    tryPick((s) => s.result.score >= HIDDEN_FLOOR && s.tmdbTitle.vote_count < 5000, usedIds) ??
    tryPick((s) => s.result.score >= HIDDEN_FLOOR, usedIds) ??
    anyPick(usedIds) ??
    stretchPick

  function displayPlatforms(candidate: Candidate): string[] {
    if (selectedPlatforms.length === 0) return []
    return candidate.platforms.filter((p) => selectedPlatforms.includes(p))
  }

  return {
    safe: {
      title:            safePick.tmdbTitle,
      score:            safePick.result.score,
      reason:           makeReason('safe', safePick.tmdbTitle, dominantGenres),
      platforms:        displayPlatforms(safePick.candidate),
      platformFallback: false,
    },
    stretch: {
      title:            stretchPick.tmdbTitle,
      score:            stretchPick.result.score,
      reason:           makeReason('stretch', stretchPick.tmdbTitle, dominantGenres),
      platforms:        displayPlatforms(stretchPick.candidate),
      platformFallback: false,
    },
    hidden: {
      title:            hiddenPick.tmdbTitle,
      score:            hiddenPick.result.score,
      reason:           makeReason('hidden', hiddenPick.tmdbTitle, dominantGenres),
      platforms:        displayPlatforms(hiddenPick.candidate),
      platformFallback: false,
    },
  }
}

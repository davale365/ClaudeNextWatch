import type { Mood } from '@/types/database'
import type { WatchInteraction } from './interactions'

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

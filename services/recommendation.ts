import type { Mood } from '@/types/database'
import type { WatchInteraction } from './interactions'
import type { TMDbTitle } from './tmdb'
import { fetchCandidatesByGenres } from './tmdb'

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

// ─── Platform catalogue (MVP hardcoded map) ───────────────────────────────────
// Platform names must match exactly the values in app/page.tsx PLATFORMS array.

const PLATFORM_TITLES: Record<string, string[]> = {
  'Netflix': [
    'Breaking Bad', 'Stranger Things', 'Ozark', 'The Crown', 'Money Heist',
    'Squid Game', 'Narcos', 'Dark', 'Wednesday', 'Bridgerton', 'Black Mirror',
    'The Witcher', 'Mindhunter', 'Better Call Saul', 'Cobra Kai', 'Lupin',
    'Emily in Paris', 'Peaky Blinders', 'Bird Box', 'The Irishman', 'Roma',
    'Marriage Story', "Don't Look Up", 'Glass Onion: A Knives Out Mystery',
    'Extraction', 'The Adam Project', 'The Gray Man', 'Rebel Moon',
    'All Quiet on the Western Front', 'Enola Holmes', 'Lift',
  ],
  'Disney+': [
    'The Mandalorian', 'WandaVision', 'Loki', 'Andor', 'The Book of Boba Fett',
    'Hawkeye', 'Moon Knight', "She-Hulk: Attorney at Law", 'Secret Invasion',
    "X-Men '97", 'Avatar: The Last Airbender',
    'Avengers: Endgame', 'Black Panther', 'The Lion King', 'Encanto',
    'Moana', 'Frozen', 'Toy Story 4', 'Soul', 'Coco',
    'Thor: Love and Thunder', 'Doctor Strange in the Multiverse of Madness',
    'Star Wars: The Clone Wars', 'Obi-Wan Kenobi',
  ],
  'Amazon Prime Video': [
    'The Boys', 'Fallout', 'Reacher', 'The Marvelous Mrs. Maisel',
    'Jack Ryan', 'The Lord of the Rings: The Rings of Power', 'Upload',
    'Invincible', 'The Man in the High Castle', 'Fleabag', 'Good Omens',
    'Manchester by the Sea', 'Sound of Metal', 'The Big Sick',
    'Saltburn', 'Road House', 'Air',
  ],
  'Apple TV+': [
    'Severance', 'Ted Lasso', 'The Morning Show', 'Slow Horses', 'Silo',
    'Presumed Innocent', 'Sugar', 'Bad Monkey', 'Disclaimer', 'Shrinking',
    'Mythic Quest', 'Foundation', 'For All Mankind', 'Hijack',
    'CODA', 'Killers of the Flower Moon', 'Finch', 'Wolfs',
  ],
  'Max': [
    'Game of Thrones', 'Succession', 'The Last of Us', 'House of the Dragon',
    'Euphoria', 'The Wire', 'Chernobyl', 'Barry', 'The Sopranos',
    'True Detective', 'Westworld', 'Band of Brothers', 'The Pacific',
    'Six Feet Under', 'Deadwood', 'Curb Your Enthusiasm', 'Insecure',
    'Watchmen', 'The White Lotus', 'Industry', 'Peacemaker',
    'Dune: Part One', 'Dune: Part Two', 'Barbie', 'Oppenheimer', 'The Batman',
  ],
  'Hulu': [
    'The Bear', "The Handmaid's Tale", 'Only Murders in the Building',
    "It's Always Sunny in Philadelphia", 'Abbott Elementary', 'The Great',
    'Reservation Dogs', 'The Dropout', 'Pam & Tommy', 'Prey', 'Palm Springs',
    'Little Fires Everywhere', 'Normal People',
  ],
  'Peacock': [
    'The Traitors', 'Bel-Air', 'Poker Face', 'Rutherford Falls', 'Downton Abbey',
  ],
  'Paramount+': [
    'Yellowstone', '1883', '1923', 'Tulsa King', 'Mayor of Kingstown',
    'Star Trek: Strange New Worlds', 'Star Trek: Discovery', 'Evil', 'Lioness',
    'Top Gun: Maverick',
  ],
  'BBC iPlayer': [
    'The Night Manager', 'Peaky Blinders', 'Sherlock', 'Doctor Who',
    'Happy Valley', 'This Is Going to Hurt', 'Fleabag', 'Luther', 'Bodyguard',
    'Line of Duty', 'Killing Eve', 'Vigil', 'Showtrial',
  ],
  'MUBI': [
    'Portrait of a Lady on Fire', 'Carol', 'Moonlight', 'The Zone of Interest',
    'Aftersun', 'Saint Maud', 'The Worst Person in the World',
    'Drive My Car', 'Petite Maman',
  ],
  'Shudder': [
    'Hereditary', 'Midsommar', 'The Witch', 'Creep', 'Host',
    'Terrifier', 'Possessor', 'Barbarian',
  ],
  'BritBox': [
    'Vera', 'Midsomer Murders', 'Shetland', 'Grantchester', 'Broadchurch',
    'Inside No. 9', "Agatha Christie's Poirot",
  ],
}

// Inverse map built at module load: title name → platforms it appears on
const TITLE_PLATFORMS: Record<string, string[]> = {}
for (const [platform, titles] of Object.entries(PLATFORM_TITLES)) {
  for (const t of titles) {
    if (!TITLE_PLATFORMS[t]) TITLE_PLATFORMS[t] = []
    TITLE_PLATFORMS[t].push(platform)
  }
}

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
    platforms: TITLE_PLATFORMS[t.title] ?? [],
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
}: RecommendationInput): Promise<Recommendations> {
  const { dominantGenres, avoidedGenres, watchedIds } =
    buildPreferenceProfile(userInteractions)

  // Fall back to broad genres if the user has no positive watch history
  const fetchGenres = dominantGenres.length > 0 ? dominantGenres : ['Drama', 'Comedy', 'Action']

  // Fetch up to 40 candidates: 20 movies + 20 TV shows in parallel
  const [movies, shows] = await Promise.all([
    fetchCandidatesByGenres(fetchGenres, 'movie'),
    fetchCandidatesByGenres(fetchGenres, 'tv'),
  ])

  const userPreferences: UserPreference[] = userInteractions.map(({ title, interaction }) => ({
    genres: title.genres,
    interaction,
  }))

  // Build scored pool: exclude already-watched and fully-avoided titles
  interface ScoredTitle { tmdbTitle: TMDbTitle; candidate: Candidate; result: ScoreResult }

  const pool: ScoredTitle[] = [...movies, ...shows]
    .filter((t) => {
      if (watchedIds.has(t.id)) return false
      if (avoidedGenres.size > 0 && t.genres.length > 0) {
        return !t.genres.every((g) => avoidedGenres.has(g))
      }
      return true
    })
    .map((tmdbTitle) => {
      const candidate = tmdbToCandidate(tmdbTitle)
      return {
        tmdbTitle,
        candidate,
        result: getConfidenceScore({ candidate, userPreferences, mood, timeAvailable, selectedPlatforms }),
      }
    })
    .sort((a, b) => b.result.score - a.result.score)

  // ── Platform filtering ────────────────────────────────────────────────────
  // When the user selected platforms, prefer titles known to be on them.
  const platformPool = selectedPlatforms.length > 0
    ? pool.filter((s) => s.candidate.platforms.some((p) => selectedPlatforms.includes(p)))
    : pool

  // Try the predicate in platformPool first, then fall back to full pool.
  // platformFallback = true means no platform match was found for this pick.
  function tryPick(
    pred: (s: ScoredTitle) => boolean,
    exclude: Set<number>
  ): { item: ScoredTitle; platformFallback: boolean } | null {
    const pp = platformPool.find((s) => !exclude.has(s.tmdbTitle.id) && pred(s))
    if (pp) return { item: pp, platformFallback: false }
    const fp = pool.find((s) => !exclude.has(s.tmdbTitle.id) && pred(s))
    if (fp) return { item: fp, platformFallback: selectedPlatforms.length > 0 }
    return null
  }

  function anyPick(exclude: Set<number>): { item: ScoredTitle; platformFallback: boolean } | null {
    const pp = platformPool.find((s) => !exclude.has(s.tmdbTitle.id))
    if (pp) return { item: pp, platformFallback: false }
    const fp = pool.find((s) => !exclude.has(s.tmdbTitle.id))
    if (fp) return { item: fp, platformFallback: selectedPlatforms.length > 0 }
    return null
  }

  const usedIds = new Set<number>()

  // ── Safe pick: highest score with strong genre alignment ──────────────────
  const safePicked =
    tryPick((s) => s.result.breakdown.tasteMatch >= 0.4, usedIds) ??
    anyPick(usedIds) ??
    { item: pool[0], platformFallback: selectedPlatforms.length > 0 }
  if (safePicked.item) usedIds.add(safePicked.item.tmdbTitle.id)

  // ── Stretch pick: good score but from a different genre cluster ───────────
  const stretchPicked =
    tryPick((s) => s.result.breakdown.tasteMatch < 0.35 && s.result.score > 20, usedIds) ??
    anyPick(usedIds) ??
    safePicked

  if (stretchPicked.item && stretchPicked.item.tmdbTitle.id !== safePicked.item?.tmdbTitle.id) {
    usedIds.add(stretchPicked.item.tmdbTitle.id)
  }

  // ── Hidden gem: low vote_count but decent score ───────────────────────────
  const hiddenPicked =
    tryPick((s) => s.tmdbTitle.vote_count < 5000 && s.result.score > 15, usedIds) ??
    anyPick(usedIds) ??
    stretchPicked

  // Platforms to display: intersection of title platforms and selected platforms
  function displayPlatforms(candidate: Candidate): string[] {
    if (selectedPlatforms.length === 0) return []
    return candidate.platforms.filter((p) => selectedPlatforms.includes(p))
  }

  const safePick    = safePicked.item    ?? pool[0]
  const stretchPick = stretchPicked.item ?? pool[1] ?? safePick
  const hiddenPick  = hiddenPicked.item  ?? pool[2] ?? stretchPick

  return {
    safe: {
      title:            safePick.tmdbTitle,
      score:            safePick.result.score,
      reason:           makeReason('safe', safePick.tmdbTitle, dominantGenres),
      platforms:        displayPlatforms(safePick.candidate),
      platformFallback: safePicked.platformFallback,
    },
    stretch: {
      title:            stretchPick.tmdbTitle,
      score:            stretchPick.result.score,
      reason:           makeReason('stretch', stretchPick.tmdbTitle, dominantGenres),
      platforms:        displayPlatforms(stretchPick.candidate),
      platformFallback: stretchPicked.platformFallback,
    },
    hidden: {
      title:            hiddenPick.tmdbTitle,
      score:            hiddenPick.result.score,
      reason:           makeReason('hidden', hiddenPick.tmdbTitle, dominantGenres),
      platforms:        displayPlatforms(hiddenPick.candidate),
      platformFallback: hiddenPicked.platformFallback,
    },
  }
}

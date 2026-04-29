'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TitleCard from '@/components/TitleCard'
import WatchEntry from '@/components/WatchEntry'
import { saveWatchHistory } from '@/services/interactions'
import type { TMDbTitle } from '@/services/tmdb'
import type { WatchInteraction } from '@/services/interactions'
import type { Recommendations } from '@/services/recommendation'
import RecommendationCard from '@/components/RecommendationCard'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  'Netflix', 'Disney+', 'Amazon Prime Video', 'Apple TV+',
  'Max', 'Hulu', 'Peacock', 'Paramount+',
  'BBC iPlayer', 'MUBI', 'Shudder', 'BritBox',
]

const MIN_TITLES = 3
const MAX_TITLES = 5

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'landing' | 'platforms' | 'watches' | 'results'

interface EntryState {
  title: TMDbTitle
  interaction: WatchInteraction | null
}

// ─── Progress indicator ───────────────────────────────────────────────────────

const STEP_NUM: Record<Step, number> = { landing: 0, platforms: 1, watches: 2, results: 3 }

function ProgressBar({ step }: { step: Step }) {
  if (step === 'landing') return null
  const current = STEP_NUM[step]
  return (
    <div className="flex items-center gap-2 py-5 justify-center">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            n <= current ? 'bg-blue-600 w-8' : 'bg-gray-200 w-4'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [step, setStep] = useState<Step>('landing')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [entries, setEntries] = useState<EntryState[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDbTitle[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [recLoading, setRecLoading] = useState(false)
  const [recError, setRecError] = useState<string | null>(null)

  // ─── Search ────────────────────────────────────────────────────────────────

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (step !== 'watches') return
    const t = setTimeout(() => runSearch(query), 400)
    return () => clearTimeout(t)
  }, [query, runSearch, step])


  // ─── Platform handlers ──────────────────────────────────────────────────────

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  // ─── Title handlers ─────────────────────────────────────────────────────────

  function addTitle(title: TMDbTitle) {
    if (entries.length >= MAX_TITLES) return
    if (entries.some((e) => e.title.id === title.id && e.title.type === title.type)) return
    setEntries((prev) => [...prev, { title, interaction: null }])
    setQuery('')
    setResults([])
  }

  function removeEntry(i: number) {
    setEntries((prev) => prev.filter((_, idx) => idx !== i))
  }

  function setInteraction(i: number, interaction: WatchInteraction) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, interaction } : e)))
  }

  const isAdded = (t: TMDbTitle) =>
    entries.some((e) => e.title.id === t.id && e.title.type === t.type)

  // ─── Save ───────────────────────────────────────────────────────────────────

  const missingInteractions = entries.filter((e) => e.interaction === null).length
  const canSave = entries.length >= MIN_TITLES && missingInteractions === 0

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveWatchHistory(
        entries.map((e) => ({ title: e.title, interaction: e.interaction! }))
      )
      setStep('results')
      setRecLoading(true)
      setRecError(null)
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interactions: entries.map((e) => ({
              title: { tmdb_id: e.title.id, genres: e.title.genres, type: e.title.type },
              interaction: e.interaction,
            })),
            selectedPlatforms: platforms,
          }),
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setRecommendations(data)
      } catch (err) {
        setRecError(err instanceof Error ? err.message : 'Could not load recommendations.')
      } finally {
        setRecLoading(false)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Landing ─────────────────────────────────────────────────────────────────

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-white">
        <div className="max-w-sm w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="text-6xl">🎬</div>
            <h1 className="text-3xl font-bold tracking-tight">ClaudeNextWatch</h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Tell us what you&apos;ve watched.<br />
              Get 3 perfect recommendations.
            </p>
          </div>
          <div className="space-y-3">
            <Button size="lg" className="w-full text-base" onClick={() => setStep('platforms')}>
              Get started
            </Button>
            <p className="text-xs text-gray-400">Takes about 2 minutes · No account needed</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Platforms ────────────────────────────────────────────────────────────────

  if (step === 'platforms') {
    return (
      <div className="min-h-screen flex flex-col max-w-xl mx-auto w-full px-4">
        <ProgressBar step={step} />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <button
              onClick={() => setStep('landing')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-3 block"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold">What are you subscribed to?</h2>
            <p className="text-gray-500 text-sm">
              We&apos;ll only suggest titles you can actually watch. Skip if you&apos;re not sure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-colors ${
                  platforms.includes(p)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6">
          <Button className="w-full" size="lg" onClick={() => { setQuery(''); setResults([]); setStep('watches') }}>
            {platforms.length === 0
              ? 'Skip'
              : `Continue with ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Watches ──────────────────────────────────────────────────────────────────

  if (step === 'watches') {
    return (
      <div className="min-h-screen flex flex-col max-w-xl mx-auto w-full px-4">
        <ProgressBar step={step} />

        <div className="flex-1 space-y-5 pb-4">
          <div className="space-y-1">
            <button
              onClick={() => setStep('platforms')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-3 block"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold">What have you watched recently?</h2>
            <p className="text-gray-500 text-sm">
              Add {MIN_TITLES}–{MAX_TITLES} titles and tell us how you felt about each.
            </p>
          </div>

          {/* Added titles */}
          {entries.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Your recent watches</p>
                <span className="text-xs text-gray-400 tabular-nums">
                  {entries.length} / {MAX_TITLES}
                </span>
              </div>
              <div className="space-y-2">
                {entries.map((entry, i) => (
                  <WatchEntry
                    key={`${entry.title.type}-${entry.title.id}`}
                    title={entry.title}
                    interaction={entry.interaction}
                    onChange={(interaction) => setInteraction(i, interaction)}
                    onRemove={() => removeEntry(i)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Search */}
          {entries.length < MAX_TITLES && (
            <section className="space-y-3">
              <Input
                type="search"
                placeholder="Search movies and TV shows…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus={entries.length === 0}
              />

              {searching && (
                <p className="text-sm text-gray-400 animate-pulse">Searching…</p>
              )}

              {!searching && results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.slice(0, 6).map((title) => (
                    <TitleCard
                      key={`${title.type}-${title.id}`}
                      title={title}
                      selected={isAdded(title)}
                      onToggle={addTitle}
                      actionLabel="Add"
                      selectedLabel="✓ Added"
                    />
                  ))}
                </div>
              )}

              {!searching && query.trim() && results.length === 0 && (
                <p className="text-sm text-gray-400">No results for &quot;{query}&quot;</p>
              )}

              {entries.length === 0 && !query && (
                <div className="text-center py-10 text-gray-300 text-sm select-none">
                  Search for a title above to get started
                </div>
              )}
            </section>
          )}
        </div>

        {/* Save */}
        <div className="py-6 space-y-2 border-t">
          {!canSave && entries.length > 0 && (
            <p className="text-xs text-gray-400">
              {entries.length < MIN_TITLES
                ? `Add ${MIN_TITLES - entries.length} more title${MIN_TITLES - entries.length !== 1 ? 's' : ''} to continue`
                : `Pick a reaction for ${missingInteractions} title${missingInteractions !== 1 ? 's' : ''} to continue`}
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save & continue'}
          </Button>
          {saveError && (
            <p className="text-sm text-red-500">{saveError}</p>
          )}
        </div>
      </div>
    )
  }

  // ─── Results ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto w-full px-4">
      <ProgressBar step="results" />

      <div className="flex-1 space-y-6 pb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Your picks</h2>
          <p className="text-gray-500 text-sm">Based on what you&apos;ve watched</p>
        </div>

        {recLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 animate-pulse">Finding your best picks…</p>
          </div>
        )}

        {recError && !recLoading && (
          <div className="text-center py-12 space-y-4">
            <p className="text-sm text-red-500">{recError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setRecLoading(true)
                setRecError(null)
                try {
                  const res = await fetch('/api/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      interactions: entries.map((e) => ({
                        title: { tmdb_id: e.title.id, genres: e.title.genres, type: e.title.type },
                        interaction: e.interaction,
                      })),
                      selectedPlatforms: platforms,
                    }),
                  })
                  if (!res.ok) throw new Error(`Server error ${res.status}`)
                  setRecommendations(await res.json())
                } catch (err) {
                  setRecError(err instanceof Error ? err.message : 'Could not load recommendations.')
                } finally {
                  setRecLoading(false)
                }
              }}
            >
              Try again
            </Button>
          </div>
        )}

        {recommendations && !recLoading && (
          <div className="space-y-4">
            <RecommendationCard
              pick="safe"
              title={recommendations.safe.title}
              score={recommendations.safe.score}
              reason={recommendations.safe.reason}
              platforms={recommendations.safe.platforms}
              platformFallback={recommendations.safe.platformFallback}
            />
            <RecommendationCard
              pick="stretch"
              title={recommendations.stretch.title}
              score={recommendations.stretch.score}
              reason={recommendations.stretch.reason}
              platforms={recommendations.stretch.platforms}
              platformFallback={recommendations.stretch.platformFallback}
            />
            <RecommendationCard
              pick="hidden"
              title={recommendations.hidden.title}
              score={recommendations.hidden.score}
              reason={recommendations.hidden.reason}
              platforms={recommendations.hidden.platforms}
              platformFallback={recommendations.hidden.platformFallback}
            />
          </div>
        )}
      </div>

      <div className="py-6 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setStep('landing')
            setEntries([])
            setPlatforms([])
            setSaveError(null)
            setRecommendations(null)
            setRecError(null)
          }}
        >
          Start over
        </Button>
      </div>
    </div>
  )
}

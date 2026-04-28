'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TitleCard from '@/components/TitleCard'
import WatchEntry from '@/components/WatchEntry'
import { saveWatchHistory } from '@/services/interactions'
import type { TMDbTitle } from '@/services/tmdb'
import type { WatchInteraction } from '@/services/interactions'

const MIN = 3
const MAX = 5

interface EntryState {
  title: TMDbTitle
  interaction: WatchInteraction | null
}

export default function WatchesPage() {
  const [entries, setEntries] = useState<EntryState[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDbTitle[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 400)
    return () => clearTimeout(t)
  }, [query, search])

  function addTitle(title: TMDbTitle) {
    if (entries.length >= MAX) return
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

  const missingInteractions = entries.filter((e) => e.interaction === null).length
  const canSave = entries.length >= MIN && missingInteractions === 0

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveWatchHistory(
        entries.map((e) => ({ title: e.title, interaction: e.interaction! }))
      )
      setSavedOk(true)
      setEntries([])
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">What have you watched?</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add {MIN}–{MAX} titles and tell us how you felt about each one.
        </p>
      </div>

      {/* Success banner */}
      {savedOk && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ✓ Watch history saved! We&apos;ll use this to power your recommendations.
          <button
            className="ml-3 underline text-green-600"
            onClick={() => setSavedOk(false)}
          >
            Add more
          </button>
        </div>
      )}

      {/* Watch entries */}
      {entries.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Your recent watches
            </p>
            <span className="text-xs text-gray-400">{entries.length}/{MAX}</span>
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

          {/* Hint + save */}
          <div className="space-y-2 pt-1">
            {!canSave && (
              <p className="text-xs text-gray-400">
                {entries.length < MIN
                  ? `Add ${MIN - entries.length} more title${MIN - entries.length !== 1 ? 's' : ''} to continue`
                  : `Select how you felt about ${missingInteractions} title${missingInteractions !== 1 ? 's' : ''}`}
              </p>
            )}
            <Button onClick={handleSave} disabled={!canSave || saving} className="w-full">
              {saving ? 'Saving…' : 'Save watch history'}
            </Button>
            {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          </div>
        </section>
      )}

      {/* Search */}
      {entries.length < MAX && (
        <section className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {entries.length === 0 ? 'Search for a title to get started' : 'Add another title'}
          </p>
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

          {!searching && query && results.length === 0 && (
            <p className="text-sm text-gray-400">No results for &quot;{query}&quot;</p>
          )}
        </section>
      )}

      {entries.length === 0 && !query && !savedOk && (
        <div className="text-center py-12 text-gray-300 text-sm select-none">
          Search above to add titles
        </div>
      )}
    </main>
  )
}

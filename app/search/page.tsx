'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import TitleCard from '@/components/TitleCard'
import type { TMDbTitle } from '@/services/tmdb'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDbTitle[]>([])
  const [selected, setSelected] = useState<TMDbTitle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce: fire search 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => search(query), 400)
    return () => clearTimeout(timer)
  }, [query, search])

  function toggleTitle(title: TMDbTitle) {
    setSelected((prev) =>
      prev.some((t) => t.id === title.id && t.type === title.type)
        ? prev.filter((t) => !(t.id === title.id && t.type === title.type))
        : [...prev, title]
    )
  }

  function isSelected(title: TMDbTitle) {
    return selected.some((t) => t.id === title.id && t.type === title.type)
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Search Titles</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find movies and TV shows you&apos;ve watched recently.
        </p>
      </div>

      {/* Search bar */}
      <Input
        type="search"
        placeholder="Search movies and TV shows…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-base"
        autoFocus
      />

      {/* Selected titles */}
      {selected.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-gray-600">
            Selected ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((t) => (
              <Badge
                key={`${t.type}-${t.id}`}
                variant="secondary"
                className="cursor-pointer gap-1 pr-1"
                onClick={() => toggleTitle(t)}
              >
                {t.title}
                <span className="text-gray-400 hover:text-gray-600 ml-1">✕</span>
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* States */}
      {loading && (
        <p className="text-sm text-gray-400 animate-pulse">Searching…</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {!loading && !error && query && results.length === 0 && (
        <p className="text-sm text-gray-400">No results for &quot;{query}&quot;</p>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <section className="space-y-3">
          <p className="text-sm text-gray-500">{results.length} results</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((title) => (
              <TitleCard
                key={`${title.type}-${title.id}`}
                title={title}
                selected={isSelected(title)}
                onToggle={toggleTitle}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

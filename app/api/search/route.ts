import { NextRequest, NextResponse } from 'next/server'
import Fuse from 'fuse.js'
import { searchTitles } from '@/services/tmdb'
import { AVAILABILITY_TITLES } from '@/services/availability'

const fuse = new Fuse(AVAILABILITY_TITLES, {
  threshold: 0.45,   // 0 = exact, 1 = match anything; 0.45 catches single-char typos
  distance: 200,
  minMatchCharLength: 3,
})

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim()

  if (!query) {
    return NextResponse.json({ results: [], noMatch: false, suggestion: null })
  }

  try {
    // 1. Exact query
    let results = await searchTitles(query)
    if (results.length > 0) return NextResponse.json({ results, noMatch: false, suggestion: null })

    // 2. Normalised (trimmed lowercase)
    const normalized = query.toLowerCase()
    if (normalized !== query) {
      results = await searchTitles(normalized)
      if (results.length > 0) return NextResponse.json({ results, noMatch: false, suggestion: null })
    }

    // 3. First 5 characters
    const prefix = query.slice(0, 5)
    if (prefix.length >= 2 && prefix !== query) {
      results = await searchTitles(prefix)
      if (results.length > 0) return NextResponse.json({ results, noMatch: false, suggestion: null })
    }

    // 4. Fuse.js fuzzy suggestion from local availability corpus
    const [fuzzyMatch] = fuse.search(query)
    const suggestion = fuzzyMatch?.item ?? null

    return NextResponse.json({ results: [], noMatch: true, suggestion })
  } catch {
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}

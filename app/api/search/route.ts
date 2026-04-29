import { NextRequest, NextResponse } from 'next/server'
import { searchTitles } from '@/services/tmdb'

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim()

  if (!query) {
    return NextResponse.json({ results: [], noMatch: false })
  }

  try {
    // 1. Exact query
    let results = await searchTitles(query)
    if (results.length > 0) return NextResponse.json({ results, noMatch: false })

    // 2. Trimmed lowercase (handles case/whitespace variations)
    const normalized = query.toLowerCase()
    if (normalized !== query) {
      results = await searchTitles(normalized)
      if (results.length > 0) return NextResponse.json({ results, noMatch: false })
    }

    // 3. First 5 characters (handles truncated or partial matches)
    const prefix = query.slice(0, 5)
    if (prefix.length >= 2 && prefix !== query) {
      results = await searchTitles(prefix)
      if (results.length > 0) return NextResponse.json({ results, noMatch: false })
    }

    return NextResponse.json({ results: [], noMatch: true })
  } catch {
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}

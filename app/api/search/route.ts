import { NextRequest, NextResponse } from 'next/server'
import { searchTitles } from '@/services/tmdb'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''

  if (!query.trim()) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await searchTitles(query)
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}

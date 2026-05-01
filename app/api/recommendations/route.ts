import { NextRequest, NextResponse } from 'next/server'
import { getRecommendations } from '@/services/recommendation'
import type { UserInteraction } from '@/services/recommendation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const interactions: UserInteraction[] = body.interactions ?? []
    const selectedPlatforms: string[] = body.selectedPlatforms ?? []
    const excludeIds: number[] = body.excludeIds ?? []
    const mood = body.mood ?? 'relaxed'
    const timeAvailable = body.timeAvailable ?? 120

    const recommendations = await getRecommendations({
      userInteractions: interactions,
      mood,
      timeAvailable,
      selectedPlatforms,
      excludeIds,
    })

    return NextResponse.json(recommendations)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_ENOUGH_MATCHES') {
      return NextResponse.json({ notEnoughMatches: true })
    }
    const message = err instanceof Error ? err.message : 'Failed to fetch recommendations'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

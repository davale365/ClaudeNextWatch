'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { TMDbTitle } from '@/services/tmdb'
import { DEFAULT_REGION } from '@/services/recommendation'

type PickType = 'safe' | 'stretch' | 'hidden'

interface RecommendationCardProps {
  pick: PickType
  title: TMDbTitle
  score: number
  reason: string
  platforms: string[]
  platformFallback: boolean
  onAlreadySeen: () => void
  onNotForMe: () => void
  onInterested: () => void
}

const PICK_CONFIG = {
  safe:    { label: 'Safe Pick',    bg: 'bg-blue-100 text-blue-700' },
  stretch: { label: 'Stretch Pick', bg: 'bg-purple-100 text-purple-700' },
  hidden:  { label: 'Hidden Gem',   bg: 'bg-amber-100 text-amber-700' },
}

export default function RecommendationCard({
  pick, title, score, reason, platforms, platformFallback,
  onAlreadySeen, onNotForMe, onInterested,
}: RecommendationCardProps) {
  const [watchlisted, setWatchlisted] = useState(false)
  const [interested, setInterested]   = useState(false)
  const { label, bg } = PICK_CONFIG[pick]
  const year   = title.release_year ?? '—'
  const medium = title.type === 'movie' ? 'Movie' : 'TV Show'

  function handleInterested() {
    setInterested(true)
    onInterested()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="flex-shrink-0">
          {title.poster ? (
            <Image
              src={title.poster}
              alt={title.title}
              width={72}
              height={108}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-[72px] h-[108px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-2xl">
              🎬
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${bg}`}>
                {label}
              </span>
              <h3 className="font-bold text-gray-900 leading-snug">{title.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{year} · {medium}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{score}</p>
              <p className="text-xs text-gray-400">/ 100</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-snug">{reason}</p>

          {/* Platform availability */}
          {platforms.length > 0 && (
            <p className="text-xs font-medium text-green-600">
              Available on: {platforms.join(', ')} · {DEFAULT_REGION}
            </p>
          )}
          {platformFallback && (
            <p className="text-xs text-amber-500">
              May not be available on your selected platforms ({DEFAULT_REGION})
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        <button
          onClick={handleInterested}
          disabled={interested}
          className={`py-3 text-xs font-medium transition-colors ${
            interested ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {interested ? '✓ Interested' : 'Interested'}
        </button>
        <button
          onClick={() => setWatchlisted((w) => !w)}
          className={`py-3 text-xs font-medium transition-colors ${
            watchlisted ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {watchlisted ? '✓ Watchlisted' : '+ Watchlist'}
        </button>
        <button
          onClick={onNotForMe}
          className="py-3 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          Not for me
        </button>
      </div>
      <div className="border-t border-gray-100">
        <button
          onClick={onAlreadySeen}
          className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Already seen — show me something else
        </button>
      </div>
    </div>
  )
}

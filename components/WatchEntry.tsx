'use client'

import Image from 'next/image'
import type { TMDbTitle } from '@/services/tmdb'
import type { WatchInteraction } from '@/services/interactions'

const INTERACTIONS: { value: WatchInteraction; label: string }[] = [
  { value: 'binged', label: '🔥 Binged' },
  { value: 'liked', label: '👍 Liked' },
  { value: 'watched_normally', label: '✅ Watched' },
  { value: 'dropped', label: '🚪 Dropped' },
  { value: 'not_for_me', label: '👎 Not for me' },
]

interface WatchEntryProps {
  title: TMDbTitle
  interaction: WatchInteraction | null
  onChange: (interaction: WatchInteraction) => void
  onRemove: () => void
}

export default function WatchEntry({ title, interaction, onChange, onRemove }: WatchEntryProps) {
  return (
    <div className="flex gap-3 p-3 border rounded-lg bg-white">
      {/* Poster */}
      <div className="relative h-20 w-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        {title.poster ? (
          <Image
            src={title.poster}
            alt={title.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-300">–</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight truncate">{title.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {[title.release_year, title.type === 'movie' ? 'Movie' : 'TV'].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 leading-none"
            aria-label={`Remove ${title.title}`}
          >
            ✕
          </button>
        </div>

        {/* Interaction pills */}
        <div className="flex flex-wrap gap-1.5">
          {INTERACTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                interaction === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

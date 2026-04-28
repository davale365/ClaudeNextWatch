'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { TMDbTitle } from '@/services/tmdb'

interface TitleCardProps {
  title: TMDbTitle
  selected: boolean
  onToggle: (title: TMDbTitle) => void
  actionLabel?: string
  selectedLabel?: string
}

export default function TitleCard({
  title,
  selected,
  onToggle,
  actionLabel = 'Select',
  selectedLabel = '✓ Selected',
}: TitleCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all ${
        selected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
    >
      <div className="relative h-48 w-full bg-gray-100">
        {title.poster ? (
          <Image
            src={title.poster}
            alt={title.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No poster
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={title.type === 'movie' ? 'default' : 'secondary'}>
            {title.type === 'movie' ? 'Movie' : 'TV'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">
            {title.title}
            {title.release_year && (
              <span className="text-gray-400 font-normal ml-1">({title.release_year})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-yellow-500">★</span>
          <span>{title.rating > 0 ? `${title.rating}/10` : 'N/A'}</span>
          {title.vote_count > 0 && (
            <span className="text-gray-300">· {title.vote_count.toLocaleString()} votes</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {title.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs px-1.5 py-0">
              {genre}
            </Badge>
          ))}
        </div>

        <Button
          size="sm"
          variant={selected ? 'default' : 'outline'}
          className="w-full mt-1"
          onClick={() => onToggle(title)}
        >
          {selected ? selectedLabel : actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

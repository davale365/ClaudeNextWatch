import { supabase } from '@/lib/supabase'
import type { TMDbTitle } from './tmdb'

export type WatchInteraction = 'binged' | 'liked' | 'watched_normally' | 'dropped' | 'not_for_me'

export interface WatchEntry {
  title: TMDbTitle
  interaction: WatchInteraction
}

async function getOrCreateUser(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()

  if (user) return user.id

  // Anonymous sign-in — requires "Enable anonymous sign-ins" in Supabase Auth settings
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw new Error(`Auth failed: ${error.message}`)
  if (!data.user) throw new Error('Could not establish user session')

  return data.user.id
}

export async function saveWatchHistory(entries: WatchEntry[]): Promise<void> {
  const userId = await getOrCreateUser()

  // Upsert user profile row (email is null for anonymous users)
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { error: userError } = await supabase
    .from('users')
    .upsert({ id: userId, email: currentUser?.email ?? null }, { onConflict: 'id' })

  if (userError) throw new Error(`Failed to save user: ${userError.message}`)

  for (const entry of entries) {
    // Upsert title into shared catalogue
    const { data: titleRow, error: titleError } = await supabase
      .from('titles')
      .upsert(
        {
          tmdb_id: entry.title.id,
          type: entry.title.type,
          title: entry.title.title,
          overview: entry.title.overview,
          genres: entry.title.genres,
          release_year: entry.title.release_year,
          poster_url: entry.title.poster,
        },
        { onConflict: 'tmdb_id' }
      )
      .select('id')
      .single()

    if (titleError) throw new Error(`Failed to save title "${entry.title.title}": ${titleError.message}`)

    // Upsert interaction — one record per (user, title), last write wins
    const { error: interactionError } = await supabase
      .from('user_title_interactions')
      .upsert(
        {
          user_id: userId,
          title_id: titleRow.id,
          interaction_type: entry.interaction,
        },
        { onConflict: 'user_id,title_id' }
      )

    if (interactionError) throw new Error(`Failed to save interaction: ${interactionError.message}`)
  }
}

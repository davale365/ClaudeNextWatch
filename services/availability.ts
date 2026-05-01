export const DEFAULT_REGION = 'UK'

export interface AvailabilityEntry {
  title: string
  region: string
  platforms: string[]
}

// Curated UK availability map. Structured for future replacement by a real API.
// Platform names must match exactly the values in app/page.tsx PLATFORMS array.
export const AVAILABILITY: AvailabilityEntry[] = [
  // ── Netflix UK ────────────────────────────────────────────────────────────
  { title: 'Breaking Bad',                          region: 'UK', platforms: ['Netflix'] },
  { title: 'Better Call Saul',                      region: 'UK', platforms: ['Netflix'] },
  { title: 'Stranger Things',                       region: 'UK', platforms: ['Netflix'] },
  { title: 'Ozark',                                 region: 'UK', platforms: ['Netflix'] },
  { title: 'The Crown',                             region: 'UK', platforms: ['Netflix'] },
  { title: 'Squid Game',                            region: 'UK', platforms: ['Netflix'] },
  { title: 'Wednesday',                             region: 'UK', platforms: ['Netflix'] },
  { title: 'Bridgerton',                            region: 'UK', platforms: ['Netflix'] },
  { title: 'Black Mirror',                          region: 'UK', platforms: ['Netflix'] },
  { title: 'The Witcher',                           region: 'UK', platforms: ['Netflix'] },
  { title: 'Mindhunter',                            region: 'UK', platforms: ['Netflix'] },
  { title: 'Cobra Kai',                             region: 'UK', platforms: ['Netflix'] },
  { title: 'Peaky Blinders',                        region: 'UK', platforms: ['Netflix', 'BBC iPlayer'] },
  { title: 'Emily in Paris',                        region: 'UK', platforms: ['Netflix'] },
  { title: 'Money Heist',                           region: 'UK', platforms: ['Netflix'] },
  { title: 'Narcos',                                region: 'UK', platforms: ['Netflix'] },
  { title: 'Dark',                                  region: 'UK', platforms: ['Netflix'] },
  { title: 'Lupin',                                 region: 'UK', platforms: ['Netflix'] },
  { title: 'Bird Box',                              region: 'UK', platforms: ['Netflix'] },
  { title: 'The Irishman',                          region: 'UK', platforms: ['Netflix'] },
  { title: 'Roma',                                  region: 'UK', platforms: ['Netflix'] },
  { title: 'Marriage Story',                        region: 'UK', platforms: ['Netflix'] },
  { title: "Don't Look Up",                         region: 'UK', platforms: ['Netflix'] },
  { title: 'Glass Onion: A Knives Out Mystery',     region: 'UK', platforms: ['Netflix'] },
  { title: 'Extraction',                            region: 'UK', platforms: ['Netflix'] },
  { title: 'Enola Holmes',                          region: 'UK', platforms: ['Netflix'] },
  { title: 'All Quiet on the Western Front',        region: 'UK', platforms: ['Netflix'] },
  { title: 'The Adam Project',                      region: 'UK', platforms: ['Netflix'] },
  { title: 'The Gray Man',                          region: 'UK', platforms: ['Netflix'] },
  { title: 'Rebel Moon',                            region: 'UK', platforms: ['Netflix'] },
  { title: 'Lift',                                  region: 'UK', platforms: ['Netflix'] },

  // ── Disney+ UK ───────────────────────────────────────────────────────────
  { title: 'The Mandalorian',                       region: 'UK', platforms: ['Disney+'] },
  { title: 'WandaVision',                           region: 'UK', platforms: ['Disney+'] },
  { title: 'Loki',                                  region: 'UK', platforms: ['Disney+'] },
  { title: 'Andor',                                 region: 'UK', platforms: ['Disney+'] },
  { title: 'The Book of Boba Fett',                 region: 'UK', platforms: ['Disney+'] },
  { title: 'Hawkeye',                               region: 'UK', platforms: ['Disney+'] },
  { title: 'Moon Knight',                           region: 'UK', platforms: ['Disney+'] },
  { title: 'She-Hulk: Attorney at Law',             region: 'UK', platforms: ['Disney+'] },
  { title: 'Secret Invasion',                       region: 'UK', platforms: ['Disney+'] },
  { title: "X-Men '97",                             region: 'UK', platforms: ['Disney+'] },
  { title: 'Avatar: The Last Airbender',            region: 'UK', platforms: ['Disney+'] },
  { title: 'Avengers: Endgame',                     region: 'UK', platforms: ['Disney+'] },
  { title: 'Black Panther',                         region: 'UK', platforms: ['Disney+'] },
  { title: 'The Lion King',                         region: 'UK', platforms: ['Disney+'] },
  { title: 'Encanto',                               region: 'UK', platforms: ['Disney+'] },
  { title: 'Moana',                                 region: 'UK', platforms: ['Disney+'] },
  { title: 'Frozen',                                region: 'UK', platforms: ['Disney+'] },
  { title: 'Toy Story 4',                           region: 'UK', platforms: ['Disney+'] },
  { title: 'Soul',                                  region: 'UK', platforms: ['Disney+'] },
  { title: 'Coco',                                  region: 'UK', platforms: ['Disney+'] },
  { title: 'Thor: Love and Thunder',                region: 'UK', platforms: ['Disney+'] },
  { title: 'Doctor Strange in the Multiverse of Madness', region: 'UK', platforms: ['Disney+'] },
  { title: 'Star Wars: The Clone Wars',             region: 'UK', platforms: ['Disney+'] },
  { title: 'Obi-Wan Kenobi',                        region: 'UK', platforms: ['Disney+'] },
  { title: 'The Bear',                              region: 'UK', platforms: ['Disney+'] },
  { title: 'Only Murders in the Building',          region: 'UK', platforms: ['Disney+'] },
  { title: 'Abbott Elementary',                     region: 'UK', platforms: ['Disney+'] },
  { title: 'The Great',                             region: 'UK', platforms: ['Disney+'] },
  { title: 'Prey',                                  region: 'UK', platforms: ['Disney+'] },

  // ── Amazon Prime Video UK ─────────────────────────────────────────────────
  { title: 'The Boys',                              region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Fallout',                               region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Reacher',                               region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'The Marvelous Mrs. Maisel',             region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Jack Ryan',                             region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'The Lord of the Rings: The Rings of Power', region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Upload',                                region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Invincible',                            region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'The Man in the High Castle',            region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Fleabag',                               region: 'UK', platforms: ['Amazon Prime Video', 'BBC iPlayer'] },
  { title: 'Good Omens',                            region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Manchester by the Sea',                 region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Sound of Metal',                        region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'The Big Sick',                          region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Saltburn',                              region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Road House',                            region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Air',                                   region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Little Fires Everywhere',               region: 'UK', platforms: ['Amazon Prime Video'] },
  { title: 'Killing Eve',                           region: 'UK', platforms: ['Amazon Prime Video', 'BBC iPlayer'] },

  // ── Apple TV+ UK ─────────────────────────────────────────────────────────
  { title: 'Severance',                             region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Ted Lasso',                             region: 'UK', platforms: ['Apple TV+'] },
  { title: 'The Morning Show',                      region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Slow Horses',                           region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Silo',                                  region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Presumed Innocent',                     region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Sugar',                                 region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Bad Monkey',                            region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Disclaimer',                            region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Shrinking',                             region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Mythic Quest',                          region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Foundation',                            region: 'UK', platforms: ['Apple TV+'] },
  { title: 'For All Mankind',                       region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Hijack',                                region: 'UK', platforms: ['Apple TV+'] },
  { title: 'CODA',                                  region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Killers of the Flower Moon',            region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Finch',                                 region: 'UK', platforms: ['Apple TV+'] },
  { title: 'Wolfs',                                 region: 'UK', platforms: ['Apple TV+'] },

  // ── Max (HBO content — via Sky/Now in UK, labelled Max for user clarity) ─
  { title: 'Game of Thrones',                       region: 'UK', platforms: ['Max'] },
  { title: 'Succession',                            region: 'UK', platforms: ['Max'] },
  { title: 'The Last of Us',                        region: 'UK', platforms: ['Max'] },
  { title: 'House of the Dragon',                   region: 'UK', platforms: ['Max'] },
  { title: 'Euphoria',                              region: 'UK', platforms: ['Max'] },
  { title: 'The Wire',                              region: 'UK', platforms: ['Max'] },
  { title: 'Chernobyl',                             region: 'UK', platforms: ['Max'] },
  { title: 'Barry',                                 region: 'UK', platforms: ['Max'] },
  { title: 'The Sopranos',                          region: 'UK', platforms: ['Max'] },
  { title: 'True Detective',                        region: 'UK', platforms: ['Max'] },
  { title: 'Westworld',                             region: 'UK', platforms: ['Max'] },
  { title: 'Band of Brothers',                      region: 'UK', platforms: ['Max'] },
  { title: 'The Pacific',                           region: 'UK', platforms: ['Max'] },
  { title: 'Six Feet Under',                        region: 'UK', platforms: ['Max'] },
  { title: 'Deadwood',                              region: 'UK', platforms: ['Max'] },
  { title: 'Curb Your Enthusiasm',                  region: 'UK', platforms: ['Max'] },
  { title: 'Insecure',                              region: 'UK', platforms: ['Max'] },
  { title: 'Watchmen',                              region: 'UK', platforms: ['Max'] },
  { title: 'The White Lotus',                       region: 'UK', platforms: ['Max'] },
  { title: 'Industry',                              region: 'UK', platforms: ['Max'] },
  { title: 'Peacemaker',                            region: 'UK', platforms: ['Max'] },
  { title: 'Dune: Part One',                        region: 'UK', platforms: ['Max'] },
  { title: 'Dune: Part Two',                        region: 'UK', platforms: ['Max'] },
  { title: 'Barbie',                                region: 'UK', platforms: ['Max'] },
  { title: 'Oppenheimer',                           region: 'UK', platforms: ['Max'] },
  { title: 'The Batman',                            region: 'UK', platforms: ['Max'] },

  // ── Hulu (not in UK — included for reference/international users) ─────────
  { title: "The Handmaid's Tale",                   region: 'UK', platforms: ['Hulu'] },
  { title: 'Reservation Dogs',                      region: 'UK', platforms: ['Hulu'] },
  { title: 'The Dropout',                           region: 'UK', platforms: ['Hulu'] },
  { title: 'Pam & Tommy',                           region: 'UK', platforms: ['Hulu'] },
  { title: 'Palm Springs',                          region: 'UK', platforms: ['Hulu'] },

  // ── Peacock (not in UK) ───────────────────────────────────────────────────
  { title: 'Bel-Air',                               region: 'UK', platforms: ['Peacock'] },
  { title: 'Poker Face',                            region: 'UK', platforms: ['Peacock'] },

  // ── Paramount+ UK ─────────────────────────────────────────────────────────
  { title: 'Yellowstone',                           region: 'UK', platforms: ['Paramount+'] },
  { title: '1883',                                  region: 'UK', platforms: ['Paramount+'] },
  { title: '1923',                                  region: 'UK', platforms: ['Paramount+'] },
  { title: 'Tulsa King',                            region: 'UK', platforms: ['Paramount+'] },
  { title: 'Mayor of Kingstown',                    region: 'UK', platforms: ['Paramount+'] },
  { title: 'Star Trek: Strange New Worlds',         region: 'UK', platforms: ['Paramount+'] },
  { title: 'Star Trek: Discovery',                  region: 'UK', platforms: ['Paramount+'] },
  { title: 'Evil',                                  region: 'UK', platforms: ['Paramount+'] },
  { title: 'Lioness',                               region: 'UK', platforms: ['Paramount+'] },
  { title: 'Top Gun: Maverick',                     region: 'UK', platforms: ['Paramount+'] },

  // ── BBC iPlayer UK ────────────────────────────────────────────────────────
  { title: 'The Night Manager',                     region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Sherlock',                              region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Doctor Who',                            region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Happy Valley',                          region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'This Is Going to Hurt',                 region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Luther',                                region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Bodyguard',                             region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Line of Duty',                          region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Vigil',                                 region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Showtrial',                             region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'Normal People',                         region: 'UK', platforms: ['BBC iPlayer'] },
  { title: 'The Traitors',                          region: 'UK', platforms: ['BBC iPlayer'] },

  // ── MUBI UK ───────────────────────────────────────────────────────────────
  { title: 'Portrait of a Lady on Fire',            region: 'UK', platforms: ['MUBI'] },
  { title: 'Carol',                                 region: 'UK', platforms: ['MUBI'] },
  { title: 'Moonlight',                             region: 'UK', platforms: ['MUBI'] },
  { title: 'The Zone of Interest',                  region: 'UK', platforms: ['MUBI'] },
  { title: 'Aftersun',                              region: 'UK', platforms: ['MUBI'] },
  { title: 'Saint Maud',                            region: 'UK', platforms: ['MUBI'] },
  { title: 'The Worst Person in the World',         region: 'UK', platforms: ['MUBI'] },
  { title: 'Drive My Car',                          region: 'UK', platforms: ['MUBI'] },
  { title: 'Petite Maman',                          region: 'UK', platforms: ['MUBI'] },

  // ── Shudder UK ────────────────────────────────────────────────────────────
  { title: 'Hereditary',                            region: 'UK', platforms: ['Shudder'] },
  { title: 'Midsommar',                             region: 'UK', platforms: ['Shudder'] },
  { title: 'The Witch',                             region: 'UK', platforms: ['Shudder'] },
  { title: 'Creep',                                 region: 'UK', platforms: ['Shudder'] },
  { title: 'Host',                                  region: 'UK', platforms: ['Shudder'] },
  { title: 'Terrifier',                             region: 'UK', platforms: ['Shudder'] },
  { title: 'Possessor',                             region: 'UK', platforms: ['Shudder'] },
  { title: 'Barbarian',                             region: 'UK', platforms: ['Shudder'] },

  // ── BritBox UK ────────────────────────────────────────────────────────────
  { title: 'Vera',                                  region: 'UK', platforms: ['BritBox'] },
  { title: 'Midsomer Murders',                      region: 'UK', platforms: ['BritBox'] },
  { title: 'Shetland',                              region: 'UK', platforms: ['BritBox'] },
  { title: 'Grantchester',                          region: 'UK', platforms: ['BritBox'] },
  { title: 'Broadchurch',                           region: 'UK', platforms: ['BritBox'] },
  { title: 'Inside No. 9',                          region: 'UK', platforms: ['BritBox'] },
  { title: "Agatha Christie's Poirot",              region: 'UK', platforms: ['BritBox'] },
  { title: 'Downton Abbey',                         region: 'UK', platforms: ['BritBox'] },
]

// Lookup: title → platforms (for the default region)
export function getPlatformsForTitle(titleName: string, region = DEFAULT_REGION): string[] {
  return AVAILABILITY
    .filter((e) => e.title === titleName && e.region === region)
    .flatMap((e) => e.platforms)
}

// All known title names — used as Fuse.js corpus for fuzzy search suggestions
export const AVAILABILITY_TITLES: string[] = [...new Set(AVAILABILITY.map((e) => e.title))]

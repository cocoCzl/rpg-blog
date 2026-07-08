export const SUPPORTED_LOCALES = ['zh', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const THEME_PRESETS = ['guild'] as const
export type ThemePresetName = (typeof THEME_PRESETS)[number]

export const AMBIANCE_EFFECTS = ['embers', 'mist', 'stars'] as const
export type AmbianceEffect = (typeof AMBIANCE_EFFECTS)[number]

export interface LocalizedText {
  zh: string
  en: string
}

export interface AuthorConfig {
  name: LocalizedText
  avatar?: string
  bio: LocalizedText
}

export interface SocialLinks {
  github?: string
  twitter?: string
  website?: string
}

export interface DisplayConfig {
  showAbout: boolean
  showTags: boolean
  showArchive: boolean
  showToolbox: boolean
}

export interface ThemeConfig {
  preset: ThemePresetName
  backgroundImage?: string
  effects: AmbianceEffect[]
}

export interface FocusItem {
  title: LocalizedText
  detail: LocalizedText
  href?: string
}

export interface HomeConfig {
  intro: LocalizedText
  focus: FocusItem[]
  toolbox: FocusItem[]
}

export interface SiteConfig {
  siteUrl: string
  title: LocalizedText
  description: LocalizedText
  locale: SupportedLocale
  author: AuthorConfig
  social: SocialLinks
  home: HomeConfig
  theme: ThemeConfig
  display: DisplayConfig
  postsPerPage: number
}

export interface ThemePreset {
  mode: 'dark' | 'light'
  sceneImage: string
  background: string
  surface: string
  surfaceStrong: string
  border: string
  text: string
  textSecondary: string
  primary: string
  secondary: string
  accent: string
  muted: string
  shadow: string
  heading: string
  body: string
  mono: string
}

export const themePresets: Record<ThemePresetName, ThemePreset> = {
  guild: {
    mode: 'light',
    sceneImage: '/images/scenes/guild-hall.svg',
    background: '#FFFDF5',
    surface: 'rgba(255, 255, 255, 0.96)',
    surfaceStrong: 'rgba(255, 249, 205, 0.98)',
    border: '#111111',
    text: '#101010',
    textSecondary: '#4C4C5A',
    primary: '#C36AA4',
    secondary: '#58D6C8',
    accent: '#F4D142',
    muted: '#F6E7F4',
    shadow: '8px 8px 0 #111111',
    heading: '"Press Start 2P", "Noto Sans SC", ui-monospace, monospace',
    body: '"Alegreya Sans", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
    mono: '"Press Start 2P", "Courier New", ui-monospace, monospace',
  },
}

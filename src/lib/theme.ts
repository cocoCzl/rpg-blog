export interface AuthorConfig {
  name: string
  avatar: string
  bio: string
}

export interface SocialLinks {
  github?: string
  twitter?: string
  website?: string
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  backgroundGradient?: string
  surface: string
  text: string
  textSecondary: string
}

export interface ThemePreset {
  mode: 'dark' | 'light'
  fontFamily: {
    heading: string
    body: string
    mono: string
  }
  fontScale: number
  colors: ThemeColors
}

export interface ThemeConfig {
  preset: 'ocean' | 'forest' | 'twilight'
  backgroundImages: string[]
}

export interface SiteConfig {
  siteUrl: string
  title: string
  description: string
  author: AuthorConfig
  social: SocialLinks
  theme: ThemeConfig
  locale: 'zh' | 'en'
  postsPerPage: number
}

export const themePresets: Record<string, ThemePreset> = {
  ocean: {
    mode: 'dark',
    fontFamily: {
      heading: '"Noto Serif SC", "Source Han Serif CN", serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontScale: 1.0,
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#22D3EE',
      background: '#0B1121',
      backgroundGradient: 'from-[#0B1121] via-[#0F2847] to-[#0B1121]',
      surface: 'rgba(15, 23, 42, 0.75)',
      text: '#E2E8F0',
      textSecondary: '#94A3B8',
    },
  },
  forest: {
    mode: 'dark',
    fontFamily: {
      heading: '"Noto Serif SC", "Source Han Serif CN", serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontScale: 1.0,
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      background: '#0A1C0E',
      backgroundGradient: 'from-[#0A1C0E] via-[#1A3A25] to-[#0A1C0E]',
      surface: 'rgba(15, 30, 20, 0.75)',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
    },
  },
  twilight: {
    mode: 'dark',
    fontFamily: {
      heading: '"Noto Serif SC", "Source Han Serif CN", serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontScale: 1.0,
    colors: {
      primary: '#C3B1E1',
      secondary: '#FFB7C5',
      accent: '#E0F7FA',
      background: '#0F0B1A',
      backgroundGradient: 'from-[#0F0B1A] via-[#2D1B4E] to-[#0F0B1A]',
      surface: 'rgba(15, 15, 32, 0.75)',
      text: '#F5F0FF',
      textSecondary: '#C0B0D8',
    },
  },
}

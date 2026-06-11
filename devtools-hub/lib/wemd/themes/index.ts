// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { basic } from './built-in/basic'
import { academicPaper } from './built-in/academic-paper'
import { auroraGlass } from './built-in/aurora-glass'
import { bauhaus } from './built-in/bauhaus'
import { codeGithub } from './built-in/code-github'
import { customDefault } from './built-in/custom-default'
import { cyberpunkNeon } from './built-in/cyberpunk-neon'
import { knowledgeBase } from './built-in/knowledge-base'
import { luxuryGold } from './built-in/luxury-gold'
import { morandiForest } from './built-in/morandi-forest'
import { neoBrutalism } from './built-in/neo-brutalism'
import { receipt } from './built-in/receipt'
import { sunsetFilm } from './built-in/sunset-film'
import type { Theme } from '../types'

export const builtInThemes: Theme[] = [
  basic,
  academicPaper,
  auroraGlass,
  bauhaus,
  codeGithub,
  customDefault,
  cyberpunkNeon,
  knowledgeBase,
  luxuryGold,
  morandiForest,
  neoBrutalism,
  receipt,
  sunsetFilm,
]

/** Theme IDs available for free users */
export const FREE_THEME_IDS: string[] = [
  'basic',
  'custom-default',
  'code-github',
  'knowledge-base',
  'receipt',
]

/** Check if a theme requires Pro subscription */
export function isProTheme(id: string): boolean {
  return !FREE_THEME_IDS.includes(id)
}

export function getThemeById(id: string): Theme | undefined {
  return builtInThemes.find((t) => t.id === id)
}

export function getAllThemes(customThemes: Theme[] = []): Theme[] {
  return [...builtInThemes, ...customThemes]
}

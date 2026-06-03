// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { basic } from './built-in/basic'
import { academicPaper } from './built-in/academic-paper'
import { auroraGlass } from './built-in/aurora-glass'
import { bauhaus } from './built-in/bauhaus'
import { codeGithub } from './built-in/code-github'
import { cyberpunkNeon } from './built-in/cyberpunk-neon'
import { knowledgeBase } from './built-in/knowledge-base'
import { luxuryGold } from './built-in/luxury-gold'
import { morandiForest } from './built-in/morandi-forest'
import { neoBrutalism } from './built-in/neo-brutalism'
import type { Theme } from '../types'

export const builtInThemes: Theme[] = [
  basic,
  academicPaper,
  auroraGlass,
  bauhaus,
  codeGithub,
  cyberpunkNeon,
  knowledgeBase,
  luxuryGold,
  morandiForest,
  neoBrutalism,
]

export function getThemeById(id: string): Theme | undefined {
  return builtInThemes.find((t) => t.id === id)
}

export function getAllThemes(customThemes: Theme[] = []): Theme[] {
  return [...builtInThemes, ...customThemes]
}

// How a crab grows: counters kept across sessions, the achievements they reach, and the form each level gives.
// Pure functions only: register.tsx feeds them the engine's events and stores the result.

import type { Feature, Progress } from '../types'
import { BASHOU_FAMILIES } from './bashou'

export type { Feature, Progress }

// Every feature the contract names, in the order the pane lists them.
export const FEATURES = [
  'planner', 'delegator', 'crabTeam', 'skilledClaw', 'tidyTide', 'shellMemory', 'pluggedIn', 'burrow',
] as const satisfies readonly Feature[]

type Counter = 'days' | 'bestStreak' | 'tokens' | 'prompts' | 'sessions'

export const GROWTH = [
  { id: 'day1', counter: 'days', goal: 1 },
  { id: 'day3', counter: 'days', goal: 3 },
  { id: 'day7', counter: 'days', goal: 7 },
  { id: 'day30', counter: 'days', goal: 30 },
  { id: 'day100', counter: 'days', goal: 100 },
  { id: 'streak3', counter: 'bestStreak', goal: 3 },
  { id: 'streak7', counter: 'bestStreak', goal: 7 },
  { id: 'streak30', counter: 'bestStreak', goal: 30 },
  { id: 'tokens100k', counter: 'tokens', goal: 100_000 },
  { id: 'tokens1m', counter: 'tokens', goal: 1_000_000 },
  { id: 'tokens10m', counter: 'tokens', goal: 10_000_000 },
  { id: 'tokens100m', counter: 'tokens', goal: 100_000_000 },
  { id: 'prompts10', counter: 'prompts', goal: 10 },
  { id: 'prompts100', counter: 'prompts', goal: 100 },
  { id: 'prompts1000', counter: 'prompts', goal: 1000 },
  { id: 'sessions10', counter: 'sessions', goal: 10 },
  { id: 'sessions100', counter: 'sessions', goal: 100 },
] as const satisfies readonly { id: string; counter: Counter; goal: number }[]
export type Growth = (typeof GROWTH)[number]['id']

export type Achievement = Feature | Growth
export const ACHIEVEMENTS: readonly Achievement[] = [...FEATURES, ...GROWTH.map(g => g.id)]

// The crab line: Claudou's own pixel art.
export const CRAB = [
  'crabling', 'peaCrab', 'hermitCrab', 'boxerCrab', 'fiddlerCrab', 'hornedGhostCrab', 'halloweenCrab', 'coconutCrab',
  'tasmanianGiantCrab', 'japaneseSpiderCrab', 'crabPlanet',
] as const
export type CrabForm = (typeof CRAB)[number]

// The pets a player can start with: the crab, and Bashou's three starter lines (its pixel art, copied).
export const STARTERS = ['crab', 'star', 'sprout', 'pebble'] as const
export type Starter = (typeof STARTERS)[number]
export const LINES: Record<Starter, readonly string[]> = {
  crab: CRAB,
  star: BASHOU_FAMILIES.star!.forms,
  sprout: BASHOU_FAMILIES.sprout!.forms,
  pebble: BASHOU_FAMILIES.pebble!.forms,
}

// The level each place of a line starts at, the same for every line; the 11th needs every achievement.
// A line with fewer forms drawn stops at its last one until more are drawn.
export const LEVELS = [0, 3, 5, 7, 9, 11, 13, 16, 19, 22, 25] as const

export type Form = string

export function forms(line: Starter): { id: Form; level: number }[] {
  return LINES[line].map((id, i) => ({ id, level: LEVELS[i]! }))
}

export const isStarter = (x: unknown): x is Starter => STARTERS.includes(x as Starter)

export function fresh(): Progress {
  return { days: 0, lastDay: '', streak: 0, bestStreak: 0, tokens: 0, prompts: 0, sessions: 0, features: [] }
}

// What the store holds may be missing, old or damaged: keep only what makes sense.
export function normalize(stored: unknown): Progress {
  const p = fresh()
  if (typeof stored !== 'object' || stored === null) return p
  const s = stored as Record<string, unknown>
  for (const key of ['days', 'streak', 'bestStreak', 'tokens', 'prompts', 'sessions'] as const) {
    const n = s[key]
    if (typeof n === 'number' && Number.isFinite(n) && n >= 0) p[key] = Math.floor(n)
  }
  if (typeof s.lastDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.lastDay)) p.lastDay = s.lastDay
  if (Array.isArray(s.features)) {
    p.features = FEATURES.filter(f => (s.features as unknown[]).includes(f))
  }
  return p
}

// The local calendar day of a time in milliseconds.
export function dayOf(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function daysBetween(from: string, to: string): number {
  const utc = (day: string) => {
    const [y, m, d] = day.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(to) - utc(from)) / 86_400_000)
}

// A prompt on a day: counts the day once, and the streak if it follows the last one.
export function prompted(p: Progress, day: string): Progress {
  const next = { ...p, prompts: p.prompts + 1 }
  if (day === p.lastDay) return next
  if (p.lastDay !== '' && daysBetween(p.lastDay, day) < 0) return next     // clock went back: count the prompt only
  next.streak = p.lastDay !== '' && daysBetween(p.lastDay, day) === 1 ? p.streak + 1 : 1
  next.bestStreak = Math.max(p.bestStreak, next.streak)
  next.days = p.days + 1
  next.lastDay = day
  return next
}

export function usedTokens(p: Progress, usage: { input_tokens: number; output_tokens: number }): Progress {
  const n = Math.max(0, usage.input_tokens) + Math.max(0, usage.output_tokens)
  return n > 0 ? { ...p, tokens: p.tokens + n } : p
}

export function startedSession(p: Progress): Progress {
  return { ...p, sessions: p.sessions + 1 }
}

export function used(p: Progress, feature: Feature): Progress {
  return p.features.includes(feature) ? p : { ...p, features: [...p.features, feature] }
}

export function achieved(p: Progress): Achievement[] {
  return [
    ...FEATURES.filter(f => p.features.includes(f)),
    ...GROWTH.filter(g => p[g.counter] >= g.goal).map(g => g.id),
  ]
}

export function level(p: Progress): number {
  return achieved(p).length
}

export function formAt(line: Starter, lvl: number): Form {
  return [...forms(line)].reverse().find(f => lvl >= f.level)!.id
}

// The forms of a line reached at a level, first to last.
export function reached(line: Starter, lvl: number): Form[] {
  return forms(line).filter(f => lvl >= f.level).map(f => f.id)
}

// The next form and the level it needs, or null at the line's last form.
export function nextForm(line: Starter, lvl: number): { id: Form; level: number } | null {
  return forms(line).find(f => f.level > lvl) ?? null
}

// What a change unlocked, in order: shown to the player once.
export function unlocked(before: Progress, after: Progress): Achievement[] {
  const had = new Set(achieved(before))
  return achieved(after).filter(a => !had.has(a))
}

// Which file writes count as Claude keeping notes: a CLAUDE.md, or a file in a memory folder.
export function isMemoryFile(path: string): boolean {
  return /(^|\/)CLAUDE(\.local)?\.md$/.test(path) || /\/memory\/[^/]+\.md$/.test(path)
}

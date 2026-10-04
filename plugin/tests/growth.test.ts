import { expect, test } from 'claude-code/testing'

import * as growth from '../hooks/growth'
import { t } from '../hooks/messages'

const days = (p: growth.Progress, ...list: string[]) => list.reduce(growth.prompted, p)

test('25 achievements: the 8 features and 17 growth goals the owner approved', () => {
  expect(growth.ACHIEVEMENTS.length).toBe(25)
  expect(new Set(growth.ACHIEVEMENTS).size).toBe(25)
  expect(growth.GROWTH.map(g => g.goal)).toEqual(
    [1, 3, 7, 30, 100, 3, 7, 30, 100_000, 1_000_000, 10_000_000, 100_000_000, 10, 100, 1000, 10, 100])
})

test('each form starts at its level, and the crab planet needs every achievement', () => {
  const at = [0, 3, 5, 7, 9, 11, 13, 16, 19, 22, 25]
  expect(growth.FORMS.map(f => f.level)).toEqual(at)
  for (const [i, form] of growth.FORMS.entries()) {
    expect(growth.formAt(form.level)).toBe(form.id)
    if (i > 0) expect(growth.formAt(form.level - 1)).toBe(growth.FORMS[i - 1].id)
  }
  expect(growth.FORMS[growth.FORMS.length - 1].level).toBe(growth.ACHIEVEMENTS.length)
  expect(growth.nextForm(4)).toEqual({ id: 'hermitCrab', level: 5 })
  expect(growth.nextForm(25)).toBe(null)
})

test('a day counts once, however many prompts', () => {
  const p = days(growth.fresh(), '2026-10-03', '2026-10-03', '2026-10-03')
  expect([p.days, p.prompts, p.streak, p.lastDay]).toEqual([1, 3, 1, '2026-10-03'])
})

test('days in a row make a streak, across months and years; a gap starts it over', () => {
  const p = days(growth.fresh(), '2026-12-30', '2026-12-31', '2027-01-01')
  expect([p.days, p.streak, p.bestStreak]).toEqual([3, 3, 3])
  const q = days(p, '2027-01-03', '2027-01-04')
  expect([q.days, q.streak, q.bestStreak]).toEqual([5, 2, 3])
  expect(days(growth.fresh(), '2028-02-28', '2028-02-29', '2028-03-01').streak).toBe(3)
})

test('a clock set back counts the prompt but not a new day', () => {
  const p = days(growth.fresh(), '2026-10-03', '2026-10-01')
  expect([p.days, p.prompts, p.lastDay, p.streak]).toEqual([1, 2, '2026-10-03', 1])
})

test('dayOf gives the local calendar day', () => {
  expect(growth.dayOf(new Date(2026, 9, 3, 23, 59).getTime())).toBe('2026-10-03')
  expect(growth.dayOf(new Date(2026, 0, 1, 0, 0).getTime())).toBe('2026-01-01')
})

test('tokens: input and output count, cache does not', () => {
  const p = growth.usedTokens(growth.fresh(), { input_tokens: 70_000, output_tokens: 30_000 })
  expect(p.tokens).toBe(100_000)
  expect(growth.achieved(p)).toEqual(['tokens100k'])
  const same = growth.fresh()
  expect(growth.usedTokens(same, { input_tokens: 0, output_tokens: 0 })).toBe(same)
})

test('a feature counts once', () => {
  const p = growth.used(growth.used(growth.fresh(), 'planner'), 'planner')
  expect(p.features).toEqual(['planner'])
  expect(growth.level(p)).toBe(1)
  expect(growth.unlocked(growth.fresh(), p)).toEqual(['planner'])
  expect(growth.unlocked(p, growth.used(p, 'planner'))).toEqual([])
})

test('every achievement reached gives the crab planet', () => {
  let p: growth.Progress = { ...growth.fresh(), days: 100, bestStreak: 30, tokens: 1e8, prompts: 1000, sessions: 100 }
  for (const f of growth.FEATURES) p = growth.used(p, f)
  expect(growth.level(p)).toBe(25)
  expect(growth.formAt(growth.level(p))).toBe('crabPlanet')
})

test('a damaged or old store gives clean progress', () => {
  expect(growth.normalize(undefined)).toEqual(growth.fresh())
  expect(growth.normalize('x')).toEqual(growth.fresh())
  const p = growth.normalize({ days: -3, tokens: 12.7, prompts: 'many', lastDay: 'yesterday',
                               features: ['planner', 'flying', 'planner', 4], sessions: Infinity })
  expect(p).toEqual({ ...growth.fresh(), tokens: 12, features: ['planner'] })
})

test('memory files: CLAUDE.md and memory folders, nothing else', () => {
  for (const yes of ['/r/CLAUDE.md', 'CLAUDE.md', '/r/CLAUDE.local.md', '/h/.claude/projects/x/memory/note.md']) {
    expect(growth.isMemoryFile(yes)).toBe(true)
  }
  for (const no of ['/r/README.md', '/r/NOTCLAUDE.md', '/r/memory/x.txt', '/r/CLAUDE.md.bak']) {
    expect(growth.isMemoryFile(no)).toBe(false)
  }
})

test('every feature tells the player how to find it', () => {
  for (const f of growth.FEATURES) {
    expect(t(`how.${f}`).length > 20).toBe(true)
    expect(t(`ach.${f}`, 'fr').length > 0).toBe(true)
  }
  expect(t('level', 'en', { n: 3, max: 25 })).toBe('Level 3 of 25')
})

import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { BASHOU_FAMILIES, BASHOU_NAMES } from '../hooks/bashou'
import { LINES, STARTERS } from '../hooks/growth'
import { LANGUAGES } from '../hooks/messages'
import { frame, lines, poseAt, SEQUENCE, TICK_MS } from '../hooks/sprite'
import type { Sprite } from '../hooks/sprite'
import { SPRITES } from '../hooks/sprites'

const TINY: Sprite = {
  palette: { a: '#111111', b: '#222222' },
  base: ['ab.', 'a.b'],
  poses: { closed: { 0: 'b-a' } },
}

test('two pixel rows make one line of half blocks, cells of the same colors joined', () => {
  expect(lines(TINY, 'base')).toEqual([[
    { text: '█', color: '#111111' },
    { text: '▀▄', color: '#222222' },                              // both drawn in the character's color
  ]])
  expect(lines({ ...TINY, base: ['aa', 'bb'] }, 'base')).toEqual([[{ text: '▀▀', color: '#111111', background: '#222222' }]])
  expect(lines({ ...TINY, base: ['..', '..'] }, 'base')).toEqual([[{ text: '  ' }]])
})

test('a pose paints over the base, "-" keeps the pixel, an unknown pose is the base', () => {
  expect(frame(TINY, 'closed')).toEqual(['bba', 'a.b'])
  expect(frame(TINY, 'nope')).toEqual(TINY.base)
  expect(TINY.base).toEqual(['ab.', 'a.b'])                        // the sprite itself is left alone
})

test('every sprite is 17x12, its letters all in its palette: every form of every line, every Bashou pet', () => {
  const ids = new Set([...STARTERS.flatMap(s => LINES[s]), ...Object.values(BASHOU_FAMILIES).flatMap(f => f.forms)])
  expect(ids.size > 100).toBe(true)
  for (const id of ids) {
    const sprite = SPRITES[id]!
    for (const pose of ['base', ...SEQUENCE]) {
      const rows = frame(sprite, pose)
      expect(rows.length).toBe(12)
      expect(rows.every(row => row.length === 17)).toBe(true)
      expect(rows.join('').split('').filter(ch => ch !== '.' && !(ch in sprite.palette))).toEqual([])
    }
    expect(lines(sprite, 'base').length).toBe(6)
  }
})

test('every Bashou pet has its name in every language', () => {
  for (const family of Object.values(BASHOU_FAMILIES)) {
    for (const id of family.forms) for (const l of LANGUAGES) expect((BASHOU_NAMES[id]?.[l] ?? '').length > 0).toBe(true)
  }
})

test('the poses go round', () => {
  expect(poseAt(0)).toBe(SEQUENCE[0])
  expect(poseAt(SEQUENCE.length + 2)).toBe(SEQUENCE[2])
  expect(new Set(SEQUENCE)).toEqual(new Set(['base', 'inhale', 'closed', 'left', 'right', 'fidget']))
  const moves = SEQUENCE.filter(p => p !== 'base').length
  expect(SEQUENCE.length / moves).toBeGreaterThanOrEqual(8)        // one move every 10 s or so, not every 2 or 3
})

function world(on: On, progress: Record<string, unknown> = {}) {
  mock.store(on, { progress, layout: 'horizontal', starter: 'crab' })
  const clock = mock.clock(on, { now: 0 })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  return clock
}

const mount = ($: Engine, surface: 'terminal' | 'desktop') =>
  $.ui.mount({ plugin: 'claudou', surface, component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 80, scroll: { offset: 0, bodyRows: 20 } } as never })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`the band draws the crab of the current form, and it moves, on ${surface}`, async ($, on) => {
    const clock = world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const band = await mount($, surface)
    const first = JSON.stringify(await band.drawn())
    expect(first).toContain(lines(SPRITES.crabling, 'base')[2]![0]!.text)
    expect(first.includes('▀') || first.includes('▄')).toBe(true)
    const seen = new Set([first])
    for (let i = 0; i < SEQUENCE.length; i++) {
      await clock.advance(TICK_MS)
      seen.add(JSON.stringify(await band.drawn()))
    }
    expect(seen.size > 3).toBe(true)                 // breathing, blinking, looking around, fidgeting
  })
}

test('in French, the crab speaks French', { options: { language: 'fr' } }, async ($, on) => {
  world(on, { days: 3, bestStreak: 3, prompts: 12, features: ['planner'] })
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const { text } = await $.command.run({ command: 'claudou', args: 'stats', origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 } })
  expect(text).toContain('Bernard-l\'ermite')
  expect(text).toContain('Niveau 5 sur 25')
  expect((await $.command.run({ command: 'claudou', args: 'config', origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 } })).text).toContain('Langue : français')
  const drawn = JSON.stringify(await (await mount($, 'terminal')).drawn())
  expect(drawn).toContain(SPRITES.hermitCrab.palette.S!)        // level 5 draws the Hermit crab's shell
  expect(drawn.includes(SPRITES.crabling.palette.o!)).toBe(false)
  expect((await $.command.run({ command: 'claudou', args: 'talk', origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 } })).text).toContain('Délégateur')
})

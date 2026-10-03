import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { FORMS } from '../hooks/growth'
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

test('every form has a 17x12 sprite whose letters are all in its palette', () => {
  for (const { id } of FORMS) {
    const sprite = SPRITES[id]
    for (const pose of ['base', ...SEQUENCE]) {
      const rows = frame(sprite, pose)
      expect(rows.length).toBe(12)
      for (const row of rows) {
        expect(row.length).toBe(17)
        for (const ch of row) expect(ch === '.' || ch in sprite.palette).toBe(true)
      }
    }
    expect(lines(sprite, 'base').length).toBe(6)
  }
})

test('the poses go round', () => {
  expect(poseAt(0)).toBe(SEQUENCE[0])
  expect(poseAt(SEQUENCE.length + 2)).toBe(SEQUENCE[2])
  expect(new Set(SEQUENCE)).toEqual(new Set(['base', 'inhale', 'closed', 'left', 'right', 'fidget']))
})

function world(on: On, progress: Record<string, unknown> = {}) {
  mock.store(on, { progress })
  const clock = mock.clock(on, { now: 0 })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  return clock
}

const mount = ($: Engine, surface: 'terminal' | 'desktop') =>
  $.ui.mount({ plugin: 'claudou', surface, component: 'Pane', requestId: 'claudou',
    props: { title: 'Claudou', isFocused: false, bodyColumns: 60, placement: 'dock',
             scroll: { offset: 0, bodyRows: 30 }, view: {} } })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`the pane draws the crab of the current form, and it moves, on ${surface}`, async ($, on) => {
    const clock = world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const pane = await mount($, surface)
    const first = JSON.stringify(await pane.drawn())
    expect(first).toContain(lines(SPRITES.crabling, 'base')[2][0].text)
    expect(first.includes('▀') || first.includes('▄')).toBe(true)
    const seen = new Set([first])
    for (let i = 0; i < SEQUENCE.length; i++) {
      await clock.advance(TICK_MS)
      seen.add(JSON.stringify(await pane.drawn()))
    }
    expect(seen.size > 3).toBe(true)                 // breathing, blinking, looking around, fidgeting
  })
}

test('in French, the pane speaks French', { options: { language: 'fr' } }, async ($, on) => {
  world(on, { days: 3, bestStreak: 3, prompts: 12, features: ['planner'] })
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const text = JSON.stringify(await (await mount($, 'terminal')).drawn())
  expect(text).toContain('Crabe violoniste')
  expect(text).toContain('Niveau 5 sur 25')
  expect(text).toContain('Délégateur')
  expect(text).toContain(SPRITES.fiddlerCrab.palette.O)          // level 5 draws the Fiddler crab's giant claw
  expect(text.includes(SPRITES.crabling.palette.o)).toBe(false)
})

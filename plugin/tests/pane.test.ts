import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { t } from '../hooks/messages'
import { TICK_MS } from '../hooks/sprite'
import { SPRITES } from '../hooks/sprites'
import { BUBBLE_TICKS, FIRST_TALK, TALK_EVERY } from '../hooks/register'

function world(on: On, stored: Record<string, unknown> = {}) {
  mock.store(on, stored)
  const clock = mock.clock(on, { now: 0 })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.render', { component: 'AbovePrompt' }, async ($, e) => h($.ui.resolve(e).Text, {}, 'beneath') as never)   // under the mod
  return clock
}

const run = async ($: Engine, args: string) => (await $.command.run({
  command: 'claudou', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 },
})).text ?? ''

const band = ($: Engine, surface: 'terminal' | 'desktop', props: { maxRows?: number; bodyColumns?: number } = {}) =>
  $.ui.mount({ plugin: 'claudou', surface, component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: props.maxRows ?? 20, bodyColumns: props.bodyColumns ?? 80,
             scroll: { offset: 0, bodyRows: 20 } } as never })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`the crab sits above the prompt, on the right, on ${surface}`, async ($, on) => {
    world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const drawn = JSON.stringify(await (await band($, surface)).drawn())
    expect(drawn).toContain('"justifyContent":"flex-end"')        // pushed to the right
    expect(drawn.includes('▀') || drawn.includes('▄')).toBe(true)
  })

  for (const [why, props, stored] of [
    ['too short', { maxRows: 4 }, {}],
    ['too narrow', { bodyColumns: 10 }, {}],
    ['hidden', {}, { hidden: true }],
  ] as const) {
    test(`no crab when the band is ${why}, on ${surface}`, async ($, on) => {
      world(on, stored)
      await $.session.start({ cwd: '/r', surface, isInteractive: true })
      expect(JSON.stringify(await (await band($, surface, props)).drawn())).toContain('beneath')
    })
  }
  test(`the crab is drawn instead of what is beneath, on ${surface}`, async ($, on) => {
    world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    expect(JSON.stringify(await (await band($, surface)).drawn()).includes('beneath')).toBe(false)
  })
}

test('/claudou hides and shows the crab; here shows it, hide hides it, and it stays so', async ($, on) => {
  world(on)
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  expect(await run($, '')).toBe(t('hidden'))
  expect(await run($, '')).toBe(t('shown'))
  expect(await run($, 'hide')).toBe(t('hidden'))
  expect(await run($, 'here')).toBe(t('shown'))
  expect(await run($, 'off')).toBe(t('hidden'))
  expect(await run($, 'on')).toBe(t('shown'))
})

test('/claudou help, or a word it does not know, lists the commands', async ($, on) => {
  world(on)
  expect(await run($, 'help')).toBe(t('help'))
  expect(await run($, 'dance')).toBe(t('help'))
  expect(t('help')).toContain('/claudou stats')
})

// day1, day3, day7, streak3, streak7, 100k tokens, prompts10, sessions10, planner: level 9, the Fiddler crab
const LEVEL_9 = { progress: { days: 7, bestStreak: 7, tokens: 100_000, prompts: 12, sessions: 10, features: ['planner'] } }

test('/claudou pets lists the forms reached; swap shows one of them, by number or name, and comes back', async ($, on) => {
  world(on, LEVEL_9)
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const list = await run($, 'pets')
  expect(list).toContain('Forms reached (5/11):')
  expect(list).toContain('▸ 5. Fiddler crab')
  expect(list).toContain('  1. Crabling')
  expect(await run($, 'swap 3')).toBe('Your crab is now a Hermit crab.')
  expect(await run($, 'pets')).toContain('▸ 3. Hermit crab')
  expect(await run($, 'swap boxer')).toBe('Your crab is now a Boxer crab.')
  expect(await run($, 'swap crabe violoniste')).toBe('Your crab is now a Fiddler crab.')
  expect(await run($, 'swap planet')).toBe('Crab planet comes at level 25. Keep using Claude Code to get there.')
  expect(await run($, 'swap lobster')).toBe('No form called "lobster". /claudou pets lists them.')
  await run($, 'swap 1')
  expect(await run($, 'swap')).toBe('Your crab shows its newest form: Fiddler crab.')
})

test('the swapped form is drawn and kept for the next session', async ($, on) => {
  world(on, { ...LEVEL_9, chosen: 'peaCrab' })
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const drawn = JSON.stringify(await (await band($, 'terminal')).drawn())
  expect(drawn.includes(SPRITES.fiddlerCrab.palette.O!)).toBe(false)
  expect(await run($, 'pets')).toContain('▸ 2. Pea crab')
})

test('/claudou talk: the crab says the next feature to try in a bubble, then Claude Code tips', async ($, on) => {
  world(on, { progress: { features: ['planner', 'delegator', 'crabTeam', 'skilledClaw', 'tidyTide', 'shellMemory', 'pluggedIn'] } })
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const said = await run($, 'talk')
  expect(said).toBe(`Back to the burrow: ${t('how.burrow')}`)
  expect(JSON.stringify(await (await band($, 'terminal')).drawn())).toContain('Back to the burrow')
})

test('the crab speaks by itself after a while, and its bubble goes away', async ($, on) => {
  const clock = world(on)
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const mounted = await band($, 'terminal')
  const advance = async (ticks: number) => { for (let i = 0; i < ticks; i++) await clock.advance(TICK_MS) }
  await advance(FIRST_TALK - 1)
  expect(JSON.stringify(await mounted.drawn()).includes('Planner')).toBe(false)
  await advance(1)
  expect(JSON.stringify(await mounted.drawn())).toContain('Planner')
  await advance(BUBBLE_TICKS)
  expect(JSON.stringify(await mounted.drawn()).includes('Planner')).toBe(false)
  expect(TALK_EVERY > BUBBLE_TICKS).toBe(true)
})

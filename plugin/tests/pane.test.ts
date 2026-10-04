import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { t } from '../hooks/messages'
import { TICK_MS } from '../hooks/sprite'
import { SPRITES } from '../hooks/sprites'
import { BUBBLE_MS, FIRST_TALK, TALK_EVERY } from '../hooks/register'

function world(on: On, stored: Record<string, unknown> = {}) {
  mock.store(on, { layout: 'horizontal', ...stored })
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
  await advance(Math.floor(BUBBLE_MS / TICK_MS))
  expect(JSON.stringify(await mounted.drawn())).toContain('Planner')         // still there after 9.6 s
  await advance(1)
  expect(JSON.stringify(await mounted.drawn()).includes('Planner')).toBe(false)
  expect(TALK_EVERY * TICK_MS > BUBBLE_MS).toBe(true)
})

test('what /claudou talk says stays about 10 seconds', async ($, on) => {
  const clock = world(on)
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  const mounted = await band($, 'terminal')
  const said = (await run($, 'talk')).slice(0, 20)
  for (let i = 0; i < 8; i++) await clock.advance(TICK_MS)                    // 9.6 s
  expect(JSON.stringify(await mounted.drawn())).toContain(said)
  await clock.advance(TICK_MS)
  expect(JSON.stringify(await mounted.drawn()).includes(said)).toBe(false)
})

// The layout: the question at first start, /claudou layout, and the column the vertical crab sits in.
function placing(on: On, answer: 'horizontal' | 'vertical' | 'dismiss') {
  const seen = { asked: 0, opened: [] as string[], closed: [] as string[] }
  on('tool.call', { tool: 'AskUserQuestion' }, async (_$, e) => {
    seen.asked += 1
    if (answer === 'dismiss') return { deny: 'dismissed' }
    const question = e.questions[0]!.question
    return { result: { questions: e.questions, answers: { [question]: t(`layout.${answer}`) } } } as never
  })
  on('ui.open', async (_$, e) => { seen.opened.push(e.id); return { value: { isPlaced: true } } as never })
  on('ui.close', async (_$, e) => { seen.closed.push(e.id); return { value: undefined } as never })
  return seen
}

const column = ($: Engine, surface: 'terminal' | 'desktop') =>
  $.ui.mount({ plugin: 'claudou', surface, component: 'Pane', requestId: 'claudou',
    props: { title: 'Claudou', isFocused: false, bodyColumns: 26, placement: 'dock', scroll: { offset: 0, bodyRows: 30 } } as never })

test('at first start the crab asks where to sit; vertical moves it to a column, and it is not asked again', async ($, on) => {
  const clock = world(on, { layout: undefined })
  const seen = placing(on, 'vertical')
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  await clock.settle()
  expect(seen.asked).toBe(1)
  expect(seen.opened).toEqual(['claudou'])
  expect(JSON.stringify(await (await band($, 'terminal')).drawn())).toContain('beneath')   // the band is left free
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  await clock.settle()
  expect(seen.asked).toBe(1)
  expect(seen.opened).toEqual(['claudou', 'claudou'])
})

test('a dismissed question keeps the crab above the prompt, and is not asked again', async ($, on) => {
  const clock = world(on, { layout: undefined })
  const seen = placing(on, 'dismiss')
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  await clock.settle()
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  await clock.settle()
  expect(seen.asked).toBe(1)
  expect(seen.opened).toEqual([])
  expect(JSON.stringify(await (await band($, 'terminal')).drawn())).toContain('"justifyContent":"flex-end"')
})

test('no question when nobody is at the prompt', async ($, on) => {
  const clock = world(on, { layout: undefined })
  const seen = placing(on, 'vertical')
  await $.session.start({ cwd: '/r', surface: null, isInteractive: false })
  await clock.settle()
  expect(seen.asked).toBe(0)
})

test('/claudou layout switches between the band and the column; off and on close and reopen the column', async ($, on) => {
  world(on)
  const seen = placing(on, 'vertical')
  await $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })
  expect(await run($, 'layout vertical')).toBe(t('shownVertical'))
  expect(seen.opened).toEqual(['claudou'])
  expect(await run($, 'off')).toBe(t('hidden'))
  expect(seen.closed).toEqual(['claudou'])
  expect(await run($, 'on')).toBe(t('shownVertical'))
  expect(seen.opened).toEqual(['claudou', 'claudou'])
  expect(await run($, 'layout horizontal')).toBe(t('shown'))
  expect(seen.closed).toEqual(['claudou', 'claudou'])
  expect(await run($, 'layout sideways')).toBe(t('layoutUnknown'))
  expect(await run($, 'layout')).toBe(t('shownVertical'))           // alone, it asks
  expect(seen.asked).toBe(1)
  expect(t('help')).toContain('/claudou layout')
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`the vertical crab is drawn in its column, with what it says beneath, on ${surface}`, async ($, on) => {
    world(on, { layout: 'vertical' })
    placing(on, 'vertical')
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const pane = await column($, surface)
    expect(JSON.stringify(await pane.drawn())).toContain('▀')
    const said = await run($, 'talk')
    expect(JSON.stringify(await pane.drawn())).toContain(said.slice(0, 20))
  })
}

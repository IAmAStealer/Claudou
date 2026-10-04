import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { t } from '../hooks/messages'
import { TICK_MS } from '../hooks/sprite'
import { SPRITES } from '../hooks/sprites'
import { LINES } from '../hooks/growth'

// The world beneath the mod: a store, Bashou's save when given (else no such file), and the answers to the
// mod's questions, by question (null: dismissed).
function world(on: On, stored: Record<string, unknown>, options: {
  answers?: Record<string, (labels: string[]) => string | null>; bashou?: unknown; env?: Record<string, string>
} = {}) {
  const asked: string[] = []
  const reads: string[] = []
  const toasts: string[] = []
  mock.store(on, { layout: 'horizontal', ...stored })
  mock.env(on, options.env ?? { HOME: '/home/p' })
  const clock = mock.clock(on, { now: 0 })
  on('ui.toast', (_$, e) => { toasts.push(e.text); return { value: undefined } })
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.render', { component: 'AbovePrompt' }, async ($, e) => h($.ui.resolve(e).Text, {}, 'beneath') as never)
  on('fs.read', async (_$, e) => {
    reads.push(e.path)
    return options.bashou === undefined ? { deny: 'ENOENT' } : { value: JSON.stringify(options.bashou) }
  })
  on('tool.call', { tool: 'AskUserQuestion' }, async (_$, e) => {
    const q = e.questions[0]!
    asked.push(q.question)
    const said = options.answers?.[q.question]?.(q.options.map(o => o.label)) ?? null
    if (said === null) return { deny: 'dismissed' }
    return { result: { questions: e.questions, answers: { [q.question]: said } } } as never
  })
  return { clock, asked, reads, toasts }
}

const run = async ($: Engine, args: string) => (await $.command.run({
  command: 'claudou', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 },
})).text ?? ''

const start = ($: Engine) => $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })

const band = ($: Engine) => $.ui.mount({ plugin: 'claudou', surface: 'terminal', component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 80, scroll: { offset: 0, bodyRows: 20 } } as never })

const LEVEL_9 = { progress: { days: 7, bestStreak: 7, tokens: 100_000, prompts: 12, sessions: 10, features: ['planner'] } }
const ALL = { progress: { days: 100, bestStreak: 30, tokens: 100_000_000, prompts: 1000, sessions: 100,
  features: ['planner', 'delegator', 'crabTeam', 'skilledClaw', 'tidyTide', 'shellMemory', 'pluggedIn', 'burrow'] } }
const pickLabel = (start: string) => (labels: string[]) => labels.find(l => l.startsWith(start)) ?? null

test('a new player chooses a pet at first start, then where it sits; neither is asked again', async ($, on) => {
  const { clock, asked } = world(on, { layout: undefined }, { answers: {
    [t('startQuestion')]: pickLabel('Star'), [t('layoutQuestion')]: pickLabel('Horizontal') } })
  await start($)
  await clock.settle()
  expect(asked).toEqual([t('startQuestion'), t('layoutQuestion')])
  expect(await run($, 'level')).toBe('Stardust · Level 0 of 25 · Next: Meteor at level 3')
  await start($)
  await clock.settle()
  expect(asked.length).toBe(2)
  expect(await run($, 'level')).toContain('Stardust')
})

test('the four starters are offered, in both languages', async ($, on) => {
  let offered: string[] = []
  const { clock } = world(on, {}, { answers: { [t('startQuestion')]: labels => { offered = labels; return null } } })
  await start($)
  await clock.settle()
  expect(offered).toEqual(['crab', 'star', 'sprout', 'pebble'].map(s => t(`starter.${s}` as never)))
  expect(t('starter.sprout' as never, 'fr')).toContain('Pousse')
})

test('a dismissed first question gives the crab, and is not asked again', async ($, on) => {
  const { clock, asked } = world(on, { layout: 'horizontal' })
  await start($)
  await clock.settle()
  await start($)
  await clock.settle()
  expect(asked).toEqual([t('startQuestion')])
  expect(await run($, 'level')).toContain('Crabling')
})

test('a player from before the starters keeps the crab without being asked', async ($, on) => {
  const { clock, asked } = world(on, LEVEL_9)
  await start($)
  await clock.settle()
  expect(asked).toEqual([])
  expect(await run($, 'level')).toBe('Fiddler crab · Level 9 of 25 · Next: Horned ghost crab at level 11')
})

test('/claudou start changes the line at any time; the level and achievements stay', async ($, on) => {
  const { clock } = world(on, { ...LEVEL_9, starter: 'crab', chosen: 'peaCrab' },
    { answers: { [t('startQuestion')]: pickLabel('Sprout') } })
  await start($)
  await clock.settle()
  expect(await run($, 'start')).toBe('Your pet is now a Fern. Your level and achievements stay.')
  expect(await run($, 'level')).toBe('Fern · Level 9 of 25 · Next: Bush at level 11')
  expect(await run($, 'pets')).toContain('▸ 5. Fern')
  expect(await run($, 'evolve')).toBe('Watch your pet grow: Seedling → Sprout → Grass → Flower → Fern')
  expect(await run($, 'stats')).toContain('Achievements (9/25)')
  const drawn = JSON.stringify(await (await band($)).drawn())
  expect(drawn).toContain(SPRITES.seedling!.palette[Object.keys(SPRITES.seedling!.palette)[0]!]!)
})

test('/claudou start dismissed keeps the pet', async ($, on) => {
  world(on, { ...LEVEL_9, starter: 'star' })
  await start($)
  expect(await run($, 'start')).toBe('Your pet stays a Planet.')
})

for (const [line, last] of [['star', 'Universe'], ['sprout', 'World tree'], ['pebble', 'Pet rock']] as const) {
  test(`the ${line} line has its 11 forms, the ${last} at level 25`, async ($, on) => {
    expect(LINES[line]).toHaveLength(11)
    world(on, { ...ALL, starter: line })
    await start($)
    expect(await run($, 'level')).toBe(`${last} · Level 25 of 25`)
    expect(await run($, 'pets')).toContain(t('lastFormAny'))
    expect(await run($, 'stats')).not.toContain(t('lastForm'))
  })
}

test('in French, the last Pebble form is the Caillou chéri', { options: { language: 'fr' } }, async ($, on) => {
  world(on, { ...ALL, starter: 'pebble' })
  await start($)
  expect(await run($, 'level')).toContain('Caillou chéri')
})


const SAVE = { starter: 'sprout', starter_best: 'grass', pets: ['fox', 'slime', 'nope'], ladder_best: { slime: 'leaf_slime' },
               looks: { fox: 'fox' } }

test('with Bashou installed, the pets unlocked there can be shown too', async ($, on) => {
  const { clock, reads } = world(on, { ...LEVEL_9, starter: 'crab' }, { bashou: SAVE })
  await start($)
  await clock.settle()
  expect(reads).toEqual(['/home/p/.local/share/bashou/state.json'])
  const list = await run($, 'pets')
  expect(list).toContain(t('fromBashou'))
  expect(list).toContain('  6. Pygmy owl')                              // found with plan mode, before Bashou's
  expect(list).toContain('  7. Seedling')
  for (const name of ['Sprout', 'Grass', 'Fennec', 'Fox', 'Droplet', 'Slime', 'Leaf slime']) expect(list).toContain(name)
  expect(list.includes('Kitsune')).toBe(false)                          // fox's next form: not reached in Bashou
  expect(await run($, 'swap fox')).toBe('Your pet is now a Fox.')
  expect(JSON.stringify(await (await band($)).drawn())).toContain(SPRITES.fox!.palette[Object.keys(SPRITES.fox!.palette)[0]!]!)
  expect(await run($, 'swap kitsune')).toBe('No form called "kitsune". /claudou pets lists them.')
  expect(await run($, 'swap 7')).toBe('Your pet is now a Seedling.')
})

test('Bashou\'s save is read where BASHOU_DATA says', async ($, on) => {
  const { clock, reads } = world(on, LEVEL_9, { bashou: SAVE, env: { HOME: '/home/p', BASHOU_DATA: '/data/b' } })
  await start($)
  await clock.settle()
  expect(reads).toEqual(['/data/b/state.json'])
})

test('without Bashou, or with a damaged save, only the line\'s forms', async ($, on) => {
  const { clock } = world(on, LEVEL_9)
  await start($)
  await clock.settle()
  expect((await run($, 'pets')).includes(t('fromBashou'))).toBe(false)
})

test('a damaged Bashou save is ignored', async ($, on) => {
  const { clock } = world(on, LEVEL_9, { bashou: { pets: 'fox', starter: 3, looks: [1] } })
  await start($)
  await clock.settle()
  expect((await run($, 'pets')).includes(t('fromBashou'))).toBe(false)
})

test('evolving on a Bashou line shows the new form', async ($, on) => {
  const { clock, toasts } = world(on, { progress: { days: 2, prompts: 9, features: [] }, starter: 'star' })
  on('prompt.submit', async (_$, e) => ({ text: e.text }))
  await start($)
  await clock.advance(TICK_MS)
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'composer' } })
  expect(toasts).toContain('Claudou: your pet became a Meteor!')
})

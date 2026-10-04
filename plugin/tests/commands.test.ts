import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import * as growth from '../hooks/growth'
import { t } from '../hooks/messages'
import { TICK_MS } from '../hooks/sprite'
import { SPRITES } from '../hooks/sprites'
import { VERSION } from '../hooks/version'

// The world beneath the mod, and the answers a person gives to its questions (null: the dialog is dismissed).
function world(on: On, stored: Record<string, unknown> = {}, answer: (options: string[]) => string | null = () => null) {
  const asked: string[][] = []
  mock.store(on, { layout: 'horizontal', starter: 'crab', ...stored })
  const clock = mock.clock(on, { now: 0 })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.open', async () => ({ value: { isPlaced: true } }) as never)
  on('ui.close', async () => ({ value: undefined }) as never)
  on('ui.render', { component: 'AbovePrompt' }, async ($, e) => h($.ui.resolve(e).Text, {}, 'beneath') as never)
  on('tool.call', { tool: 'AskUserQuestion' }, async (_$, e) => {
    const q = e.questions[0]!
    const options = q.options.map(o => o.label)
    asked.push(options)
    const said = answer(options)
    if (said === null) return { deny: 'dismissed' }
    return { result: { questions: e.questions, answers: { [q.question]: said } } } as never
  })
  return { clock, asked }
}

const run = async ($: Engine, args: string) => (await $.command.run({
  command: 'claudou', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 },
})).text ?? ''

const start = ($: Engine) => $.session.start({ cwd: '/r', surface: 'terminal', isInteractive: true })

const band = ($: Engine) => $.ui.mount({ plugin: 'claudou', surface: 'terminal', component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 80, scroll: { offset: 0, bodyRows: 20 } } as never })

// day1, day3, day7, streak3, streak7, 100k tokens, prompts10, sessions10, planner: level 9, the Fiddler crab
const LEVEL_9 = { progress: { days: 7, bestStreak: 7, tokens: 100_000, prompts: 12, sessions: 10, features: ['planner'] } }
const ALL = { progress: { days: 100, bestStreak: 30, tokens: 100_000_000, prompts: 1000, sessions: 100,
                          features: [...growth.FEATURES] } }

test('/claudou swap alone offers the newest four forms reached, and takes the one picked', async ($, on) => {
  const { asked } = world(on, LEVEL_9, options => options[2]!)
  await start($)
  expect(await run($, 'swap')).toBe('Your pet is now a Hermit crab.')
  expect(asked).toEqual([['Fiddler crab', 'Boxer crab', 'Hermit crab', 'Pea crab']])
  expect(await run($, 'pets')).toContain('▸ 3. Hermit crab')
})

test('/claudou swap alone takes a number or name typed under Other', async ($, on) => {
  world(on, LEVEL_9, () => '1')
  await start($)
  expect(await run($, 'swap')).toBe('Your pet is now a Crabling.')
})

test('/claudou swap alone, dismissed, keeps the form', async ($, on) => {
  const { asked } = world(on, LEVEL_9)
  await start($)
  expect(await run($, 'swap')).toBe('Your pet stays a Fiddler crab.')
  expect(asked.length).toBe(1)
})

test('/claudou swap alone with a single form says so without asking', async ($, on) => {
  const { asked } = world(on, {}, options => options[0]!)
  await start($)
  expect(await run($, 'swap')).toBe(t('swapOnlyOne', 'en', { form: 'Crabling' }))
  expect(asked).toEqual([])
})

test('/claudou level: form, level and next form in one line; the planet has no next', async ($, on) => {
  world(on, LEVEL_9)
  await start($)
  expect(await run($, 'level')).toBe('Fiddler crab · Level 9 of 25 · Next: Horned ghost crab at level 11')
})

test('/claudou level at the last form', async ($, on) => {
  world(on, ALL)
  await start($)
  expect(await run($, 'level')).toBe('Crab planet · Level 25 of 25')
})

test('/claudou achievements lists all 25: earned ones ticked, features with how, goals with how far', async ($, on) => {
  world(on, LEVEL_9)
  await start($)
  const lines = (await run($, 'achievements')).split('\n')
  expect(lines[0]).toBe('Achievements (9/25):')
  expect(lines.length).toBe(26)
  expect(lines).toContain('✓ Planner')
  expect(lines).toContain(`· Delegator: ${t('how.delegator')}`)
  expect(lines).toContain('✓ 7 days')
  expect(lines).toContain('· 30 days (7/30)')
  expect(lines).toContain('· 1M tokens (100,000/1,000,000)')
  expect(lines.filter(l => l.startsWith('✓ ')).length).toBe(9)
})

test('/claudou evolve walks the crab through every form it reached, one per tick, and back', async ($, on) => {
  const { clock } = world(on, LEVEL_9)
  await start($)
  const mounted = await band($)
  expect(await run($, 'evolve')).toBe('Watch your pet grow: Crabling → Pea crab → Hermit crab → Boxer crab → Fiddler crab')
  expect(JSON.stringify(await mounted.drawn())).toContain(SPRITES.crabling.palette.o!)
  await clock.advance(TICK_MS)
  expect(JSON.stringify(await mounted.drawn())).not.toContain(SPRITES.crabling.palette.o!)
  for (let i = 0; i < 5; i++) await clock.advance(TICK_MS)
  const after = JSON.stringify(await mounted.drawn())
  expect(after).toContain(SPRITES.fiddlerCrab.palette.O!)
  expect(await run($, 'pets')).toContain('▸ 5. Fiddler crab')
})

test('/claudou evolve while hidden asks to show the crab first', async ($, on) => {
  world(on, { ...LEVEL_9, hidden: true })
  await start($)
  expect(await run($, 'evolve')).toBe(t('evolveHidden'))
})

test('/claudou share gives a card with the form, level, achievements and the project link', async ($, on) => {
  world(on, LEVEL_9)
  await start($)
  const card = await run($, 'share')
  expect(card).toContain('My Claudou is a Fiddler crab, level 9 of 25')
  expect(card).toContain('9 achievements · 7 days · best streak 7')
  expect(card).toContain('https://github.com/IAmAStealer/Claudou')
})

test('/claudou version names the version', async ($, on) => {
  world(on)
  expect(await run($, 'version')).toBe(`Claudou v${VERSION}`)
  expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
})

test('/claudou config shows the language and the layout, and where to change them', async ($, on) => {
  world(on)
  await start($)
  expect(await run($, 'config')).toBe(t('config', 'en', { language: 'English', layout: t('layoutName.horizontal') }))
  await run($, 'layout vertical')
  expect(await run($, 'config')).toContain('Layout: vertical, a column beside the conversation')
})

test('/claudou reset starts over once confirmed, and it lasts', async ($, on) => {
  world(on, { ...LEVEL_9, chosen: 'peaCrab' }, options => options[0]!)
  await start($)
  expect(await run($, 'reset')).toBe(t('resetDone'))
  expect(await run($, 'level')).toBe('Crabling · Level 0 of 25 · Next: Pea crab at level 3')
  await start($)
  expect(await run($, 'level')).toBe('Crabling · Level 0 of 25 · Next: Pea crab at level 3')
  expect(await run($, 'pets')).toContain('▸ 1. Crabling')
})

test('/claudou reset keeps the crab when the person says no or dismisses', async ($, on) => {
  let n = 0
  world(on, LEVEL_9, options => (n++ === 0 ? options[1]! : null))
  await start($)
  expect(await run($, 'reset')).toBe(t('resetKept'))
  expect(await run($, 'reset')).toBe(t('resetKept'))
  expect(await run($, 'level')).toContain('Level 9 of 25')
})

test('help lists every command', async ($, on) => {
  world(on)
  for (const word of ['level', 'stats', 'achievements', 'hint', 'talk', 'pets', 'swap', 'evolve', 'share', 'layout',
                      'config', 'reset', 'version']) {
    expect(t('help')).toContain(`/claudou ${word}`)
    expect(t('help', 'fr')).toContain(`/claudou ${word}`)
    expect(t('commandHelp')).toContain(word)
  }
})

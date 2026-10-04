import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { TICK_MS } from '../hooks/sprite'
import { IDLE_MS, LONG_TURN_MS, REACT_MS } from '../hooks/register'

// The world beneath the mod: Bash fails when the command has "false" in it; every other call succeeds.
function world(on: On, stored: Record<string, unknown> = {}) {
  mock.store(on, { layout: 'horizontal', starter: 'crab', ...stored })
  const clock = mock.clock(on, { now: 0 })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.open', async () => ({ value: { isPlaced: true } }) as never)
  on('prompt.submit', async (_$, e) => ({ text: e.text }))
  on('turn.complete', async (_$, e) => ({ text: e.answer }))
  on('tool.call', async (_$, e) => (e.tool === 'Bash' && String((e as { command?: unknown }).command).includes('false')
    ? { result: 'exit 1', isError: true } : { result: {}, text: 'ok' }) as never)
  on('ui.render', { component: 'AbovePrompt' }, async ($, e) => h($.ui.resolve(e).Text, {}, 'beneath') as never)
  return clock
}

const band = ($: Engine, surface: 'terminal' | 'desktop') => $.ui.mount({ plugin: 'claudou', surface,
  component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 80,
                                     scroll: { offset: 0, bodyRows: 20 } } as never })
const column = ($: Engine, surface: 'terminal' | 'desktop') => $.ui.mount({ plugin: 'claudou', surface,
  component: 'Pane', requestId: 'claudou',
  props: { title: 'Claudou', isFocused: false, bodyColumns: 26, placement: 'dock', scroll: { offset: 0, bodyRows: 30 } } as never })

const bash = ($: Engine, command: string) => $.tool.call({ tool: 'Bash', command })
const turn = ($: Engine, durationMs: number) =>
  $.turn.complete({ answer: 'a', durationMs, isAborted: false, turnId: 't', reason: 'answer' })
const shows = async (m: { drawn: () => Promise<unknown> }, symbol: string) => JSON.stringify(await m.drawn()).includes(symbol)

for (const surface of ['terminal', 'desktop'] as const) {
  test(`passing tests make a ✦ beside the pet for a few seconds; other commands do not, on ${surface}`, async ($, on) => {
    const clock = world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const m = await band($, surface)
    await bash($, 'ls -la')
    expect(await shows(m, '✦')).toBe(false)
    await bash($, 'npm test')
    expect(await shows(m, '✦')).toBe(true)
    for (let i = 0; i <= REACT_MS / TICK_MS; i++) await clock.advance(TICK_MS)
    expect(await shows(m, '✦')).toBe(false)
  })

  test(`a failed command makes a ! beside the pet, on ${surface}`, async ($, on) => {
    world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const m = await band($, surface)
    await bash($, 'cargo test || false')
    expect(await shows(m, '!')).toBe(true)
    expect(await shows(m, '✦')).toBe(false)
  })

  test(`a long turn ends with a ♪, a short one does not, on ${surface}`, async ($, on) => {
    world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const m = await band($, surface)
    await turn($, LONG_TURN_MS - 1)
    expect(await shows(m, '♪')).toBe(false)
    await turn($, LONG_TURN_MS)
    expect(await shows(m, '♪')).toBe(true)
  })

  test(`with nothing going on the pet falls asleep (z), and wakes at the next prompt, on ${surface}`, async ($, on) => {
    const clock = world(on)
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const m = await band($, surface)
    const sleeping = async () => JSON.stringify(await m.drawn()).includes('"  z"')
    for (let i = 0; i < IDLE_MS / TICK_MS - 1; i++) await clock.advance(TICK_MS)
    expect(await sleeping()).toBe(false)
    for (let i = 0; i < 2; i++) await clock.advance(TICK_MS)
    expect(await sleeping()).toBe(true)
    await clock.advance(10 * TICK_MS)
    expect(await sleeping()).toBe(true)                                   // asleep until something happens
    await $.prompt.submit({ text: 'hi', origin: { kind: 'composer' } } as never)
    expect(await sleeping()).toBe(false)
  })

  test(`the side column shows the reactions too, on ${surface}`, async ($, on) => {
    world(on, { layout: 'vertical' })
    await $.session.start({ cwd: '/r', surface, isInteractive: true })
    const m = await column($, surface)
    await bash($, 'pytest -q')
    expect(await shows(m, '✦')).toBe(true)
  })
}

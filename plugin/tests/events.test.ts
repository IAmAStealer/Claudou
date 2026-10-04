import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

const DAY = 86_400_000
const NOON = new Date(2026, 9, 3, 12).getTime()

// The world beneath the mod: a store, a clock, tools that succeed (a skill named "broken" fails), toasts kept.
function world(on: On, progress: Record<string, unknown> = {}) {
  mock.store(on, { progress, layout: 'horizontal', starter: 'crab' })
  const clock = mock.clock(on, { now: NOON })
  const toasts: string[] = []
  on('ui.toast', (_$, e) => { toasts.push(e.text); return { value: undefined } })
  on('tool.call', async (_$, e) =>
    (e.tool === 'Skill' && e.skill === 'broken' ? { result: 'no', isError: true } : { result: {}, text: 'ok' }) as never)
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('prompt.submit', async (_$, e) => ({ text: e.text }))
  on('classic.SessionStart', async () => ({}))
  on('turn.complete', async (_$, e) => ({ text: e.answer }))
  on('session.compact', async () => ({ messages: [{ role: 'user', text: 'summary', toolUses: [] }] }))
  return { clock, toasts }
}

// What /claudou <args> answers: the mod's own record of the progress, as the player reads it.
async function claudou($: Engine, args: string): Promise<string> {
  const { text } = await $.command.run({
    command: 'claudou', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 },
  })
  return text ?? ''
}
const pane = ($: Engine) => claudou($, 'stats')

const start = ($: Engine, surface: 'terminal' | 'desktop' = 'terminal') =>
  $.session.start({ cwd: '/r', surface, isInteractive: true })
const endTurn = ($: Engine, usage?: { input_tokens: number; output_tokens: number }) =>
  $.turn.complete({ answer: 'a', durationMs: 1, isAborted: false, turnId: 't', reason: 'answer',
    ...(usage ? { usage: { ...usage, cache_read_input_tokens: 50_000, cache_creation_input_tokens: 9000, model: 'm' } } : {}) })

test('prompts on three days in a row unlock First day, 3 days and 3 days in a row', async ($, on) => {
  const { clock, toasts } = world(on)              // no session start: its animation timer would tick all day
  for (let i = 0; i < 3; i++) {
    await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'composer' } })
    await clock.advance(DAY)
  }
  expect(toasts).toContain('Claudou: 3 days in a row! Your pet grows.')
  expect(toasts).toContain('Claudou: your pet became a Pea crab!')
  expect(await pane($)).toContain('3 days · best streak 3 · 0 tokens · 3 prompts · 0 sessions')
})

test('prompts the person did not type are not counted', async ($, on) => {
  const { toasts } = world(on)
  await start($)
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'sdk' } })
  expect(toasts).toEqual([])
})

test('three subagents in one turn make a crab team; two then one across turns do not', async ($, on) => {
  const { toasts } = world(on)
  await start($)
  const agent = () => $.tool.call({ tool: 'Agent', description: 'd', prompt: 'p' })
  await agent(); await agent(); await endTurn($); await agent()
  expect(toasts).toEqual(['Claudou: Delegator! Your pet grows.'])
  await agent(); await agent()
  expect(toasts).toContain('Claudou: Crab team! Your pet grows.')
})

test('plan mode, skills, MCP tools and memory files count; other files and failed calls do not', async ($, on) => {
  const { toasts } = world(on)
  await start($)
  await $.tool.call({ tool: 'Write', file_path: '/r/README.md', content: 'x' })
  await $.tool.call({ tool: 'Skill', skill: 'broken' })
  expect(toasts).toEqual([])
  await $.tool.call({ tool: 'ExitPlanMode' })
  await $.tool.call({ tool: 'Skill', skill: 'review' })
  await $.tool.call({ tool: 'mcp__docs__read', id: 'x' } as never)
  await $.tool.call({ tool: 'Edit', file_path: '/r/CLAUDE.md', old_string: 'a', new_string: 'b' })
  const names = toasts.filter(x => x.endsWith('grows.'))
  expect(names).toEqual(['Planner', 'Skilled claw', 'Plugged in', 'Shell memory']
    .map(n => `Claudou: ${n}! Your pet grows.`))
})

test('/compact counts, an automatic compaction does not', async ($, on) => {
  const { toasts } = world(on)
  await start($)
  await $.session.compact({ trigger: 'auto', messages: [{ role: 'user', text: 'hi', toolUses: [] }] })
  expect(toasts).toEqual([])
  await $.session.compact({ trigger: 'manual', messages: [{ role: 'user', text: 'hi', toolUses: [] }] })
  expect(toasts[0]).toBe('Claudou: Tidy tide! Your pet grows.')
})

test('new and resumed sessions count; a resume is Back to the burrow; /clear is not a session', async ($, on) => {
  const { toasts } = world(on)
  await start($)
  await $.classic.SessionStart({ source: 'startup' })
  await $.classic.SessionStart({ source: 'clear' })
  expect(toasts).toEqual([])
  await $.classic.SessionStart({ source: 'resume' })
  expect(toasts[0]).toBe('Claudou: Back to the burrow! Your pet grows.')
  expect(await pane($)).toContain('2 sessions')
})

test('tokens add up input and output of every turn, cache left out', async ($, on) => {
  const { toasts } = world(on, { tokens: 99_000 })
  await start($)
  await endTurn($, { input_tokens: 600, output_tokens: 400 })
  expect(toasts[0]).toBe('Claudou: 100k tokens! Your pet grows.')
  expect(await pane($)).toContain('100,000 tokens')
})

test('a first day with a feature and 100k tokens evolves the crab once, not three times', async ($, on) => {
  const { toasts } = world(on)
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'composer' } })
  await $.tool.call({ tool: 'ExitPlanMode' })
  await endTurn($, { input_tokens: 60_000, output_tokens: 40_000 })
  expect(toasts.filter(t => t.includes('became'))).toEqual(['Claudou: your pet became a Pea crab!'])
})

test('/claudou stats shows the form, the level, the next form and the achievements', async ($, on) => {
  world(on, { days: 3, bestStreak: 3, prompts: 12, features: ['planner'] })
  await start($)
  const text = await claudou($, 'stats')
  expect(text).toContain('Hermit crab · Level 5 of 25')          // day1, day3, streak3, prompts10, planner: level 5
  expect(text).toContain('Next: Boxer crab at level 7')
  expect(text).toContain('Achievements (5/25): Planner, First day, 3 days, 3 days in a row, 10 prompts')
})

test('/claudou hint gives the next feature to try, one at a time, until all are tried', async ($, on) => {
  world(on, { features: ['planner'] })
  await start($)
  const text = await claudou($, 'hint')
  expect(text).toContain('Try next: Delegator')
  expect(text.includes('Crab team')).toBe(false)
  expect(text.includes('Planner')).toBe(false)
})

test('/claudou hint says when every feature was tried', async ($, on) => {
  world(on, { features: ['planner', 'delegator', 'crabTeam', 'skilledClaw', 'tidyTide', 'shellMemory', 'pluggedIn', 'burrow'] })
  await start($)
  expect(await claudou($, 'hint')).toContain('You tried every feature')
})

test('the crab planet tells the joke', async ($, on) => {
  world(on, { days: 100, bestStreak: 30, tokens: 1e8, prompts: 1000, sessions: 100,
              features: ['planner', 'delegator', 'crabTeam', 'skilledClaw', 'tidyTide', 'shellMemory', 'pluggedIn', 'burrow'] })
  await start($)
  const drawn = await pane($)
  expect(drawn).toContain('Crab planet')
  expect(drawn).toContain('Everything ends up a crab')
})

import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { SPRITES } from '../hooks/sprites'

// The session's state as the engine holds it: after a /clear or a resume the session has a new id and its
// state starts empty, with no session.start. `wipe` does that.
function sessionState(on: On) {
  let values = new Map<string, { value: unknown; version: number }>()
  const name = (e: { plugin: string; key: string; id?: string }) => `${e.plugin}.${e.key}.${e.id ?? ''}`
  on('state.get', async (_$, e) => {
    const held = values.get(name(e))
    return { value: { value: held?.value, version: held?.version ?? 0 } } as never
  })
  on('state.set', async (_$, e) => {
    const version = values.get(name(e))?.version ?? 0
    if (e.ifVersion !== undefined && e.ifVersion !== version) return { value: { isSet: false, version } } as never
    values.set(name(e), { value: e.value, version: version + 1 })
    return { value: { isSet: true, version: version + 1 } } as never
  })
  return { wipe: () => { values = new Map() } }
}

function world(on: On) {
  mock.store(on, { layout: 'horizontal', chosen: 'crabling',
                   progress: { days: 7, bestStreak: 7, tokens: 100_000, prompts: 12, sessions: 10, features: ['planner'] } })
  mock.env(on, { HOME: '/home/p' })
  const clock = mock.clock(on, { now: 0 })
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: undefined }) as never)
  on('ui.toast', async () => ({ value: undefined }))
  on('ui.render', { component: 'AbovePrompt' }, async ($, e) => h($.ui.resolve(e).Text, {}, 'beneath') as never)
  on('classic.SessionStart', async () => ({}) as never)
  return { clock, ...sessionState(on) }
}

const run = async ($: Engine, args: string) => (await $.command.run({
  command: 'claudou', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 },
})).text ?? ''

const band = ($: Engine, surface: 'terminal' | 'desktop') => $.ui.mount({ plugin: 'claudou', surface,
  component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 80,
                                     scroll: { offset: 0, bodyRows: 20 } } as never })

const colorOf = (id: string) => SPRITES[id]!.palette[Object.keys(SPRITES[id]!.palette)[0]!]!

for (const source of ['clear', 'resume'] as const) {
  for (const surface of ['terminal', 'desktop'] as const) {
    test(`after a ${source} the pet, its level and its picked form come back from the store, on ${surface}`,
      async ($, on) => {
        const { clock, wipe } = world(on)
        await $.session.start({ cwd: '/r', surface, isInteractive: false })
        await clock.settle()
        expect(await run($, 'swap pygmy')).toContain('Pygmy owl')
        wipe()
        await $.classic.SessionStart({ source })
        await clock.settle()
        const pets = await run($, 'pets')
        expect(pets).toContain('Hermit crab')
        expect(pets).toMatch(/▸ +\d+\. Pygmy owl/)
        expect(JSON.stringify(await (await band($, surface)).drawn())).toContain(colorOf('pygmy_owl'))
        expect(await run($, 'evolve')).toContain('Crabling → Pea crab → Hermit crab')
      })
  }
}

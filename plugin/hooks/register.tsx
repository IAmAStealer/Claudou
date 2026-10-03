import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import * as growth from './growth'
import type { Feature, Progress } from './growth'
import { t as translate } from './messages'
import type { Language, MessageId } from './messages'
import { lines, poseAt, TICK_MS } from './sprite'
import { SPRITES } from './sprites'

export const PANE = 'claudou'
export const COMMAND = 'claudou'
export const STORE_KEY = 'progress'
// Small: the crab (17 columns), a few lines of text and one tip. The person can still drag it bigger.
export const PANE_SIZE = { columns: 36, rows: 16 } as const

const progress = atom({ plugin: 'claudou', key: 'progress' } as const, growth.fresh())
const tick = atom({ plugin: 'claudou', key: 'tick' } as const, 0)       // moves the crab: one pose per tick

// The player's language, from the mod's settings (/config): English unless they chose French.
let language: Language = 'en'
const t = (id: MessageId, values: Record<string, string | number> = {}) => translate(id, language, values)
let ticking = false

// Subagents the main loop started in the turn under way (Crab team: 3 in one turn).
let agentsThisTurn = 0

// Reads the store again before each change, so two Claude Code windows don't undo each other's counts.
async function change($: EngineInterface, step: (p: Progress) => Progress): Promise<void> {
  const before = growth.normalize(await $.store.get(STORE_KEY))
  const after = step(before)
  if (after === before) return
  await $.store.set(STORE_KEY, after)
  await update($, progress, () => after)
  for (const a of growth.unlocked(before, after)) $.ui.toast(t('unlockedToast', { name: t(`ach.${a}`) }))
  const form = growth.formAt(growth.level(after))
  if (form !== growth.formAt(growth.level(before))) $.ui.toast(t('evolvedToast', { form: t(`form.${form}`) }))
}

const use = ($: EngineInterface, feature: Feature) => change($, p => growth.used(p, feature))

export const register: Register = (on, options) => {
  language = options?.language === 'fr' ? 'fr' : 'en'
  ticking = false

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: t('commandHelp') })
    const stored = growth.normalize(await $.store.get(STORE_KEY))
    await update($, progress, () => stored)
    if (!ticking) {
      ticking = true
      $.clock.every(TICK_MS, () => void update($, tick, n => n + 1))
    }
    void $.ui.open({ id: PANE, title: t('paneTitle'), ...PANE_SIZE })      // waits for a window of 144 columns or more

    return next(e)
  })

  // A new or resumed session; /clear and compaction start no new one.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.source === 'startup' || e.source === 'resume') await change($, growth.startedSession)
    if (e.source === 'resume') await use($, 'burrow')

    return next(e)
  })

  // Only what the person typed: not notifications, peers or other plugins' prompts.
  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind !== 'composer' && e.origin.kind !== 'bridge') return next(e)
    const day = growth.dayOf(await $.clock.now())
    await change($, p => growth.prompted(p, day))

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const done = await next(e)
    if (done.isError || 'deny' in done) return done
    const tool: string = e.tool
    if (tool === 'ExitPlanMode') await use($, 'planner')
    if (tool === 'Agent' && !e.agentId) {
      agentsThisTurn += 1
      await use($, 'delegator')
      if (agentsThisTurn >= 3) await use($, 'crabTeam')
    }
    if (tool === 'Skill') await use($, 'skilledClaw')
    if (tool.startsWith('mcp__')) await use($, 'pluggedIn')
    if (tool === 'Write' || tool === 'Edit') {
      const path = (e as { file_path?: unknown }).file_path
      if (typeof path === 'string' && growth.isMemoryFile(path)) await use($, 'shellMemory')
    }

    return done
  })

  on('skill.prompt', async ($, e, next) => {
    await use($, 'skilledClaw')

    return next(e)
  })

  on('session.compact', async ($, e, next) => {
    const done = await next(e)
    if (e.trigger === 'manual' && !e.agentId) await use($, 'tidyTide')

    return done
  })

  on('turn.complete', async ($, e, next) => {
    if (e.usage) {
      const usage = e.usage
      await change($, p => growth.usedTokens(p, usage))
    }
    if (!e.agentId) agentsThisTurn = 0

    return next(e)
  })

  on('command.run', { command: COMMAND }, async $ => {
    await $.ui.open({ id: PANE, title: t('paneTitle'), ...PANE_SIZE })

    return { text: t('paneOpened') }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const p = await read($, progress)
    const lvl = growth.level(p)
    const form = growth.formAt(lvl)
    const next = growth.nextForm(lvl)
    const toTry = growth.FEATURES.filter(f => !p.features.includes(f))
    const pose = poseAt(await read($, tick))

    return (
      <Box flexDirection="column">
        {lines(SPRITES[form], pose).map((runs, r) => (
          <Box key={`sprite${r}`} flexDirection="row">
            {runs.map((run, i) => <Text key={`${r}.${i}`} color={run.color} backgroundColor={run.background}>{run.text}</Text>)}
          </Box>
        ))}
        <Text> </Text>
        {lvl === 0 && p.prompts === 0 && <Text>{t('hatching')}</Text>}
        <Text bold>{t(`form.${form}`)}</Text>
        <Text>{t('level', { n: lvl, max: growth.ACHIEVEMENTS.length })}</Text>
        {next
          ? <Text dimColor>{t('nextForm', { form: t(`form.${next.id}`), n: next.level })}</Text>
          : <Text>{t('lastForm')}</Text>}
        <Text dimColor>
          {t('stats', { days: p.days, streak: p.bestStreak, tokens: p.tokens.toLocaleString(language),
                        prompts: p.prompts, sessions: p.sessions })}
        </Text>
        {toTry.length > 0 && <Text> </Text>}
        {toTry.length > 0 && <Text>{t('toFind')} <Text bold>{t(`ach.${toTry[0]}`)}</Text></Text>}
        {toTry.length > 0 && <Text dimColor>{t(`how.${toTry[0]}`)}</Text>}
      </Box>
    )
  })
}

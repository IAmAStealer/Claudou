import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import * as growth from './growth'
import type { Feature, Form, Progress } from './growth'
import { LANGUAGES, MESSAGES, t as translate } from './messages'
import type { Language, MessageId } from './messages'
import { lines, poseAt, TICK_MS } from './sprite'
import { SPRITES } from './sprites'

export const COMMAND = 'claudou'
export const STORE_KEY = 'progress'
export const HIDDEN_KEY = 'hidden'
export const CHOSEN_KEY = 'chosen'
export const SPRITE_ROWS = 6                     // 12 pixel rows, two per line
export const SPRITE_COLUMNS = 17
export const FIRST_TALK = 250                    // ticks: the crab first speaks after 5 minutes,
export const TALK_EVERY = 750                    // then every 15 minutes,
export const BUBBLE_TICKS = 20                   // and its bubble stays 24 seconds
export const TIPS = ['clear', 'mention', 'rewind', 'init', 'bang', 'context', 'model', 'escape'] as const

const progress = atom({ plugin: 'claudou', key: 'progress' } as const, growth.fresh())
const tick = atom({ plugin: 'claudou', key: 'tick' } as const, 0)       // moves the crab: one pose per tick
const hidden = atom({ plugin: 'claudou', key: 'hidden' } as const, false)
const chosen = atom({ plugin: 'claudou', key: 'chosen' } as const, null as string | null)   // a form picked by swap
const bubble = atom({ plugin: 'claudou', key: 'bubble' } as const, null as string | null)   // what the crab says

// The player's language, from the mod's settings (/config): English unless they chose French.
let language: Language = 'en'
const t = (id: MessageId, values: Record<string, string | number> = {}) => translate(id, language, values)
let ticking = false
let ticks = 0
let talkAt = FIRST_TALK
let quietAt = 0
let tipsSaid = 0

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
  if (form !== growth.formAt(growth.level(before))) {
    $.ui.toast(t('evolvedToast', { form: t(`form.${form}`) }))
    await choose($, null)                         // a new form shows itself, even after a swap
  }
}

const use = ($: EngineInterface, feature: Feature) => change($, p => growth.used(p, feature))

export const register: Register = (on, options) => {
  language = options?.language === 'fr' ? 'fr' : 'en'
  ticking = false
  ticks = 0
  talkAt = FIRST_TALK

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: t('commandHelp') })
    const stored = growth.normalize(await $.store.get(STORE_KEY))
    await update($, progress, () => stored)
    const isHidden = (await $.store.get(HIDDEN_KEY)) === true
    await update($, hidden, () => isHidden)
    const picked = await $.store.get(CHOSEN_KEY)
    await update($, chosen, () => (typeof picked === 'string' ? picked : null))
    if (!ticking) {
      ticking = true
      $.clock.every(TICK_MS, () => void beat($))
    }

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

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = e.args.trim().toLowerCase()
    const p = await read($, progress)
    if (word === '') return { text: await show($, await read($, hidden)) }
    if (word === 'here' || word === 'show') return { text: await show($, true) }
    if (word === 'hide' || word === 'off') return { text: await show($, false) }
    if (word === 'hint') return { text: hint(p) }
    if (word === 'stats') return { text: stats(p) }
    if (word === 'talk') return { text: await say($, nextTip(p)) }
    if (word === 'pets') return { text: pets(p, await shown($)) }
    if (word === 'swap' || word.startsWith('swap ')) return { text: await swap($, p, word.slice(4).trim()) }

    return { text: t('help') }
  })

  // The crab on the right of the band just above the prompt, and what it says on its left.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const room = e.props.bodyColumns - SPRITE_COLUMNS
    if (e.props.hasSurvey || e.props.maxRows < SPRITE_ROWS || room < 0 || (await read($, hidden))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const form = await shown($)
    const pose = poseAt(await read($, tick))
    const said = await read($, bubble)
    const width = Math.min(48, room - 1)

    return (
      <Box flexDirection="row" width={e.props.bodyColumns} justifyContent="flex-end" alignItems="center">
        {said && width >= 16 ? (
          <Box borderStyle="round" borderColor="#e07a5f" paddingX={1} width={width} marginRight={1}>
            <Text wrap="wrap">{said}</Text>
          </Box>
        ) : null}
        <Box flexDirection="column">
          {lines(SPRITES[form], pose).map((runs, r) => (
            <Box key={`sprite${r}`} flexDirection="row">
              {runs.map((run, i) => <Text key={`${r}.${i}`} color={run.color} backgroundColor={run.background}>{run.text}</Text>)}
            </Box>
          ))}
        </Box>
      </Box>
    )
  })
}

// One tick: the crab moves, now and then it speaks, and its bubble goes after a while.
async function beat($: EngineInterface): Promise<void> {
  ticks += 1
  await update($, tick, n => n + 1)
  if (ticks >= talkAt) {
    talkAt = ticks + TALK_EVERY
    await say($, nextTip(await read($, progress)))
  } else if (ticks === quietAt) {
    await update($, bubble, () => null)
  }
}

async function say($: EngineInterface, text: string): Promise<string> {
  quietAt = ticks + BUBBLE_TICKS
  await update($, bubble, () => text)

  return text
}

// Features not tried yet come first, in order; after them, Claude Code tips in turn.
function nextTip(p: Progress): string {
  const untried = growth.FEATURES.find(f => !p.features.includes(f))
  if (untried) return `${t(`ach.${untried}`)}: ${t(`how.${untried}`)}`
  tipsSaid += 1

  return t(`tip.${TIPS[(tipsSaid - 1) % TIPS.length]}`)
}

// The form on screen: the one picked by swap while the crab has reached it, otherwise the newest.
async function shown($: EngineInterface): Promise<Form> {
  const lvl = growth.level(await read($, progress))
  const id = await read($, chosen)
  const picked = growth.FORMS.find(f => f.id === id)

  return picked && lvl >= picked.level ? picked.id : growth.formAt(lvl)
}

async function choose($: EngineInterface, form: Form | null): Promise<void> {
  await $.store.set(CHOSEN_KEY, form)
  await update($, chosen, () => form)
}

const simple = (name: string) => name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '')

// A form by its number in /claudou pets, its name in any language, or the start of it.
function findForm(name: string): (typeof growth.FORMS)[number] | undefined {
  const n = Number(name)
  if (Number.isInteger(n) && n >= 1) return growth.FORMS[n - 1]
  const wanted = simple(name)
  const names = (id: Form) => [id, ...LANGUAGES.map(l => MESSAGES[`form.${id}`][l])].map(simple)

  return growth.FORMS.find(f => names(f.id).includes(wanted)) ?? growth.FORMS.find(f => names(f.id).some(x => x.startsWith(wanted)))
}

async function swap($: EngineInterface, p: Progress, name: string): Promise<string> {
  const lvl = growth.level(p)
  if (name === '') {
    await choose($, null)
    return t('swapNewest', { form: t(`form.${growth.formAt(lvl)}`) })
  }
  const form = findForm(name)
  if (!form) return t('swapUnknown', { name })
  if (lvl < form.level) return t('swapLocked', { form: t(`form.${form.id}`), n: form.level })
  await choose($, form.id)

  return t('swapped', { form: t(`form.${form.id}`) })
}

function pets(p: Progress, current: Form): string {
  const lvl = growth.level(p)
  const reached = growth.FORMS.filter(f => lvl >= f.level)
  const list = reached.map((f, i) => `${f.id === current ? '▸' : ' '} ${i + 1}. ${t(`form.${f.id}`)}`)
  const next = growth.nextForm(lvl)

  return [t('pets', { n: reached.length, max: growth.FORMS.length }), ...list,
          next ? t('nextForm', { form: t(`form.${next.id}`), n: next.level }) : t('lastForm'), t('petsNext')].join('\n')
}

// Shows or hides the crab, everywhere and from now on; returns what to tell the person.
async function show($: EngineInterface, visible: boolean): Promise<string> {
  await $.store.set(HIDDEN_KEY, !visible)
  await update($, hidden, () => !visible)

  return visible ? t('shown') : t('hidden')
}

function hint(p: Progress): string {
  const next = growth.FEATURES.find(f => !p.features.includes(f))

  return next ? `${t('toFind')} ${t(`ach.${next}`)}\n${t(`how.${next}`)}` : t('allTried')
}

function stats(p: Progress): string {
  const lvl = growth.level(p)
  const next = growth.nextForm(lvl)
  const done = growth.achieved(p)

  return [
    `${t(`form.${growth.formAt(lvl)}`)} · ${t('level', { n: lvl, max: growth.ACHIEVEMENTS.length })}`,
    next ? t('nextForm', { form: t(`form.${next.id}`), n: next.level }) : t('lastForm'),
    t('stats', { days: p.days, streak: p.bestStreak, tokens: p.tokens.toLocaleString(language), prompts: p.prompts,
                 sessions: p.sessions }),
    `${t('achievements', { n: done.length, max: growth.ACHIEVEMENTS.length })} ${done.map(a => t(`ach.${a}`)).join(', ')}`,
  ].join('\n')
}

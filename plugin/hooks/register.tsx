import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import * as growth from './growth'
import type { CrabForm, Feature, Form, Progress, Starter } from './growth'
import { BASHOU_FAMILIES, BASHOU_NAMES } from './bashou'
import { LANGUAGES, MESSAGES, t as translate } from './messages'
import type { Language, MessageId } from './messages'
import { lines, poseAt, TICK_MS } from './sprite'
import { SPRITES } from './sprites'
import { VERSION } from './version'

export const COMMAND = 'claudou'
export const STORE_KEY = 'progress'
export const HIDDEN_KEY = 'hidden'
export const CHOSEN_KEY = 'chosen'
export const LAYOUT_KEY = 'layout'
export const STARTER_KEY = 'starter'
export const PANE = 'claudou'
export const SPRITE_ROWS = 6                     // 12 pixel rows, two per line
export const SPRITE_COLUMNS = 17
export const PANE_COLUMNS = 26                   // the vertical column: the crab and a narrow bubble
export const FIRST_TALK = 250                    // ticks: the crab first speaks after 5 minutes,
export const TALK_EVERY = 750                    // then every 15 minutes,
export const BUBBLE_MS = 10_000                  // and its bubble stays 10 seconds, by the clock
export const REACT_MS = 4000                     // a reaction beside the pet stays 4 seconds,
export const IDLE_MS = 300_000                   // it falls asleep after 5 minutes with nothing going on,
export const LONG_TURN_MS = 60_000               // and a turn of a minute or more ends with a ♪

// The reactions, Bashou's particles: rows of a 3-cell column on the pet's left, and their color.
type Reaction = 'pass' | 'fail' | 'done' | 'idle'
const REACTIONS: Record<Reaction, { rows: string[]; color: string }> = {
  pass: { rows: [' ✦ '], color: '#ffd060' },
  fail: { rows: [' ! '], color: '#e05a4a' },
  done: { rows: [' ♪ '], color: '#7ab8f0' },
  idle: { rows: ['  z', ' z '], color: '#a0a4b0' },
}
// A command that runs tests: npm test, cargo test, pytest, go test, python -m unittest…
const TEST_COMMAND = /\b(test|tests|pytest|jest|vitest|unittest|rspec|phpunit|ctest)\b/
export const TIPS = ['clear', 'mention', 'rewind', 'init', 'bang', 'context', 'model', 'escape'] as const

const progress = atom({ plugin: 'claudou', key: 'progress' } as const, growth.fresh())
const tick = atom({ plugin: 'claudou', key: 'tick' } as const, 0)       // moves the crab: one pose per tick
const hidden = atom({ plugin: 'claudou', key: 'hidden' } as const, false)
const chosen = atom({ plugin: 'claudou', key: 'chosen' } as const, null as string | null)   // a form picked by swap
const bubble = atom({ plugin: 'claudou', key: 'bubble' } as const, null as string | null)   // what the crab says
const layout = atom({ plugin: 'claudou', key: 'layout' } as const, 'horizontal' as Layout)  // band or side pane
type Layout = 'horizontal' | 'vertical'
const parade = atom({ plugin: 'claudou', key: 'parade' } as const, null as string | null)  // the form /claudou evolve shows
const line = atom({ plugin: 'claudou', key: 'starter' } as const, 'crab' as Starter)         // the pet's line
const reaction = atom({ plugin: 'claudou', key: 'reaction' } as const, null as Reaction | null)  // beside the pet

// The player's language, from the mod's settings (/config): English unless they chose French.
let language: Language = 'en'
const t = (id: MessageId, values: Record<string, string | number> = {}) => translate(id, language, values)
let ticking = false
let ticks = 0
let talkAt = FIRST_TALK
let quietAt = 0                                  // when the bubble goes, in ms; 0 with none
let calmAt = 0                                   // when the reaction goes, in ms; 0 while asleep or with none
let activeAt = 0                                 // the last time something happened, in ms
let tipsSaid = 0
let paradeLeft: Form[] = []                      // the forms /claudou evolve has still to show, one per tick

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
  for (const { form, joined } of growth.companionsGained(before, after))
    $.ui.toast(t(joined ? 'petJoined' : 'petGrew', { pet: nameOf(form) }))
  const l = await read($, line)
  const form = growth.formAt(l, growth.level(after))
  if (form !== growth.formAt(l, growth.level(before))) {
    $.ui.toast(t('evolvedToast', { form: nameOf(form) }))
    await choose($, null)                         // a new form shows itself, even after a swap
  }
}

// The pet as the store keeps it, into the session's state.
async function restore($: EngineInterface) {
  const stored = growth.normalize(await $.store.get(STORE_KEY))
  await update($, progress, () => stored)
  const isHidden = (await $.store.get(HIDDEN_KEY)) === true
  await update($, hidden, () => isHidden)
  const picked = await $.store.get(CHOSEN_KEY)
  await update($, chosen, () => (typeof picked === 'string' ? picked : null))
  const placed = await $.store.get(LAYOUT_KEY)
  await update($, layout, () => (placed === 'vertical' ? 'vertical' : 'horizontal'))
  const started = await $.store.get(STARTER_KEY)
  await update($, line, () => (growth.isStarter(started) ? started : 'crab'))
  return { stored, isHidden, placed, started }
}

const use = ($: EngineInterface, feature: Feature) => change($, p => growth.used(p, feature))

export const register: Register = (on, options) => {
  language = options?.language === 'fr' ? 'fr' : 'en'
  ticking = false
  ticks = 0
  talkAt = FIRST_TALK

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: t('commandHelp'), argumentHint: '[on|off|swap|pets|stats|help…]' })
    const { stored, isHidden, placed, started } = await restore($)
    if (placed === 'vertical' && !isHidden) void openPane($)
    const isNew = !growth.isStarter(started) && stored.days === 0 && stored.prompts === 0
    const isPlaced = placed === 'horizontal' || placed === 'vertical'
    if (e.isInteractive && (isNew || !isPlaced)) void firstStart($, isNew, isPlaced)
    activeAt = await $.clock.now()
    if (!ticking) {
      ticking = true
      $.clock.every(TICK_MS, () => void beat($))
    }

    return next(e)
  })

  // A new or resumed session; /clear and compaction start no new one. After a /clear or a resume the session
  // has a new id and its state starts empty, with no session.start: the pet comes back from the store.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.source === 'clear' || e.source === 'resume') await restore($)
    if (e.source === 'startup' || e.source === 'resume') await change($, growth.startedSession)
    if (e.source === 'resume') await use($, 'burrow')

    return next(e)
  })

  // Only what the person typed: not notifications, peers or other plugins' prompts.
  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind !== 'composer' && e.origin.kind !== 'bridge') return next(e)
    const day = growth.dayOf(await $.clock.now())
    await change($, p => growth.prompted(p, day))
    await wake($)

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const done = await next(e)
    const tool: string = e.tool
    await wake($)
    if (tool === 'Bash' && !e.agentId && !('deny' in done)) {
      if (done.isError) await react($, 'fail')
      else if (TEST_COMMAND.test(String((e as { command?: unknown }).command ?? ''))) await react($, 'pass')
    }
    if (done.isError || 'deny' in done) return done
    if (tool === 'ExitPlanMode') await use($, 'planner')
    if (tool === 'Agent' && !e.agentId) {
      agentsThisTurn += 1
      await use($, 'delegator')
      if (agentsThisTurn === 3) await use($, 'crabTeam')
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
    await wake($)
    if (!e.agentId && !e.isAborted && e.durationMs >= LONG_TURN_MS) await react($, 'done')

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = e.args.trim().toLowerCase()
    const p = await read($, progress)
    if (word === 'on' || word === 'here' || word === 'show') return { text: await show($, true) }
    if (word === 'hide' || word === 'off') return { text: await show($, false) }
    if (word === 'layout') return { text: await place($, await askLayout($)) }
    if (word.startsWith('layout ')) {
      const l = layoutOf(word.slice(7).trim())
      return { text: l ? await place($, l) : t('layoutUnknown') }
    }
    if (word === 'hint') return { text: hint(p) }
    if (word === 'level') return { text: levelLine(p, await read($, line)) }
    if (word === 'stats') return { text: stats(p, await read($, line)) }
    if (word === 'achievements') return { text: achievements(p) }
    if (word === 'talk') return { text: await say($, nextTip(p)) }
    if (word === 'pets') return { text: await pets($) }
    if (word === 'swap') return { text: await pick($) }
    if (word.startsWith('swap ')) return { text: await swap($, word.slice(5).trim()) }
    if (word === 'evolve') return { text: await evolve($) }
    if (word === 'share') return { text: share(p, await read($, line)) }
    if (word === 'config') return { text: config(await read($, layout)) }
    if (word === 'reset') return { text: await reset($) }
    if (word === 'start') return { text: await start($) }
    if (word === 'version') return { text: t('version', { version: VERSION }) }

    return { text: t('help') }
  })

  // Horizontal: the crab on the right of the band just above the prompt, and what it says on its left.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const room = e.props.bodyColumns - SPRITE_COLUMNS
    if (e.props.hasSurvey || e.props.maxRows < SPRITE_ROWS || room < 0 || (await read($, hidden))) return next(e)
    if ((await read($, layout)) === 'vertical') return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const form = await shown($)
    const pose = poseAt(await read($, tick))
    const said = await read($, bubble)
    const mood = await read($, reaction)
    const width = Math.min(48, room - 1)

    return (
      <Box flexDirection="row" width={e.props.bodyColumns} justifyContent="flex-end" alignItems="center">
        {said && width >= 16 ? (
          <Box borderStyle="round" borderColor="#e07a5f" paddingX={1} width={width} marginRight={1}>
            <Text wrap="wrap">{said}</Text>
          </Box>
        ) : null}
        <Box flexDirection="row">
          {mood ? moodColumn({ Box, Text }, mood) : null}
          <Box flexDirection="column">
            {lines(SPRITES[form], pose).map((runs, r) => (
              <Box key={`sprite${r}`} flexDirection="row">
                {runs.map((run, i) => <Text key={`${r}.${i}`} color={run.color} backgroundColor={run.background}>{run.text}</Text>)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    )
  })

  // The swap picker: the forms offered, in color and numbered as the options, drawn above the engine's dialog.
  on('ui.render', { component: 'AskUserQuestion' }, async ($, e, next) => {
    type Question = { question?: string; options?: { label: string }[] }
    const asked = (e.props.questions as Question[]).find(q => q?.question === t('swapQuestion'))
    if (!asked) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const byName = new Map(Object.keys(SPRITES).map(id => [nameOf(id as Form), id as Form]))
    const pose = poseAt(await read($, tick))
    const offered = (asked.options ?? []).flatMap((o, i) => {
      const id = byName.get(o.label)
      return id ? [{ id, n: i + 1 }] : []
    })
    const fit = Math.max(1, Math.floor(((e.viewport?.columns ?? 80) + 2) / (SPRITE_COLUMNS + 5)))
    const shownForms = offered.slice(0, fit).map(({ id, n }) => ({ n, rows: lines(SPRITES[id], pose) }))
    const dialog = await next(e)
    if (shownForms.length === 0) return dialog
    // The pictures side by side in the same 6 lines (the engine keeps 6 around its dialog), each after its
    // option's number.
    return (
      <Box flexDirection="column">
        {shownForms[0]!.rows.map((_, r) => (
          <Text key={`pick${r}`}>
            {shownForms.flatMap(({ n, rows }, i) => [
              <Text key={`n${r}.${i}`}>{r === 0 ? `${n}. ` : '   '}</Text>,
              ...rows[r]!.map((run, c) => <Text key={`${r}.${i}.${c}`} color={run.color} backgroundColor={run.background}>{run.text}</Text>),
              <Text key={`gap${r}.${i}`}>{'  '}</Text>,
            ])}
          </Text>
        ))}
        {dialog}
      </Box>
    )
  })

  // Vertical: a narrow column beside the conversation. Docked, the column is as tall as the screen: the crab
  // sits at its bottom, near the prompt, and what it says above it.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const form = await shown($)
    const pose = poseAt(await read($, tick))
    const said = await read($, bubble)
    const mood = await read($, reaction)
    const docked = e.props.placement === 'dock'

    return (
      <Box flexDirection="column" alignItems="center" width={e.props.bodyColumns}
        {...(docked ? { height: e.props.scroll.bodyRows, justifyContent: 'flex-end' as const } : {})}>
        {said ? (
          <Box borderStyle="round" borderColor="#e07a5f" paddingX={1} marginBottom={1} width={e.props.bodyColumns}>
            <Text wrap="wrap">{said}</Text>
          </Box>
        ) : null}
        <Box key="sprite" flexDirection="row">
          {mood ? moodColumn({ Box, Text }, mood) : null}
          <Box flexDirection="column">
            {lines(SPRITES[form], pose).map((runs, r) => (
              <Box key={`sprite${r}`} flexDirection="row">
                {runs.map((run, i) => <Text key={`${r}.${i}`} color={run.color} backgroundColor={run.background}>{run.text}</Text>)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    )
  })
}

const openPane = ($: EngineInterface) =>
  $.ui.open({ id: PANE, title: 'Claudou', columns: PANE_COLUMNS, rows: SPRITE_ROWS + 6 }).catch(() => undefined)

// The question asked once at first start, and by /claudou layout; dismissed, the crab stays above the prompt.
async function askLayout($: EngineInterface): Promise<Layout> {
  const options = [t('layout.horizontal'), t('layout.vertical')]
  const answer = await $.ui.ask(t('layoutQuestion'), { options, header: 'Claudou' }).catch(() => options[0])
  return answer === options[1] ? 'vertical' : 'horizontal'
}

function layoutOf(word: string): Layout | null {
  if (['horizontal', 'h', 'band', 'bande'].includes(word)) return 'horizontal'
  if (['vertical', 'v', 'side', 'pane', 'colonne', 'column'].includes(word)) return 'vertical'
  return null
}

// Puts the crab in the band or the side pane, from now on; returns what to tell the person.
async function place($: EngineInterface, l: Layout): Promise<string> {
  const before = await read($, layout)
  await $.store.set(LAYOUT_KEY, l)
  await update($, layout, () => l)
  if (l === 'vertical' && !(await read($, hidden))) await openPane($)
  if (l === 'horizontal' && before === 'vertical') await $.ui.close({ id: PANE })
  return l === 'vertical' ? t('shownVertical') : t('shown')
}

// One tick: the crab moves, now and then it speaks, and its bubble goes after a while.
async function beat($: EngineInterface): Promise<void> {
  ticks += 1
  await update($, tick, n => n + 1)
  if (paradeLeft.length > 0 || (await read($, parade)) !== null) {
    const next = paradeLeft.shift() ?? null
    await update($, parade, () => next)
  }
  if (ticks >= talkAt) {
    talkAt = ticks + TALK_EVERY
    await say($, nextTip(await read($, progress)))
  } else if (quietAt !== 0 && (await $.clock.now()) >= quietAt) {
    quietAt = 0
    await update($, bubble, () => null)
  }
  const now = await $.clock.now()
  if (calmAt !== 0 && now >= calmAt) {
    calmAt = 0
    await update($, reaction, () => null)
  }
  if ((await read($, reaction)) === null && now - activeAt >= IDLE_MS) await update($, reaction, () => 'idle')
}

// The reaction's column on the pet's left: its symbol on the top rows.
function moodColumn({ Box, Text }: Pick<ReturnType<EngineInterface['ui']['resolve']>, 'Box' | 'Text'>, r: Reaction) {
  return (
    <Box key="mood" flexDirection="column" width={3}>
      {REACTIONS[r].rows.map((row, i) => <Text key={`mood${i}`} color={REACTIONS[r].color}>{row}</Text>)}
    </Box>
  )
}

// Something happened: the pet wakes up if it slept.
async function wake($: EngineInterface): Promise<void> {
  activeAt = await $.clock.now()
  if ((await read($, reaction)) === 'idle') await update($, reaction, () => null)
}

async function react($: EngineInterface, r: Reaction): Promise<void> {
  calmAt = (await $.clock.now()) + REACT_MS
  await update($, reaction, () => r)
}

async function say($: EngineInterface, text: string): Promise<string> {
  quietAt = (await $.clock.now()) + BUBBLE_MS
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

// A form's name: a crab's from the messages, a Bashou pet's from Bashou.
const isCrab = (id: string): id is CrabForm => (growth.CRAB as readonly string[]).includes(id)
function nameOf(id: Form): string {
  if (isCrab(id)) return t(`form.${id}`)
  return BASHOU_NAMES[id]?.[language] ?? id
}

// The forms one may show: those of the line reached, then the pets found with Claude Code; numbered in that
// order. `others` holds the pets found.
async function choices($: EngineInterface): Promise<{ line: Starter; lvl: number; reached: Form[]; found: Form[]
                                                     others: Form[] }> {
  const l = await read($, line)
  const p = await read($, progress)
  const lvl = growth.level(p)
  const reached = growth.reached(l, lvl)
  const found = growth.companions(p).filter(id => !reached.includes(id))
  return { line: l, lvl, reached, found, others: found }
}

// The form on screen: the one walking in /claudou evolve, else the one picked by swap while one may show it,
// otherwise the newest of the line.
async function shown($: EngineInterface): Promise<Form> {
  const walking = await read($, parade)
  if (walking && SPRITES[walking]) return walking
  const { line: l, lvl, reached, others } = await choices($)
  const id = await read($, chosen)
  return id && (reached.includes(id) || others.includes(id)) ? id : growth.formAt(l, lvl)
}

async function choose($: EngineInterface, form: Form | null): Promise<void> {
  await $.store.set(CHOSEN_KEY, form)
  await update($, chosen, () => form)
}

const simple = (name: string) => name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '')

// A form by its number in /claudou pets, its name in any language, or the start of it: among the line's forms
// (reached or not) and the pets found.
function findForm(name: string, numbered: Form[], all: Form[]): Form | undefined {
  const n = Number(name)
  if (Number.isInteger(n) && n >= 1) return numbered[n - 1]
  const wanted = simple(name)
  const names = (id: Form) => [id, ...(isCrab(id) ? LANGUAGES.map(l => MESSAGES[`form.${id}`][l])
                                                   : Object.values(BASHOU_NAMES[id] ?? {}))].map(simple)
  return all.find(f => names(f).includes(wanted)) ?? all.find(f => names(f).some(x => x.startsWith(wanted)))
}

async function swap($: EngineInterface, name: string): Promise<string> {
  const { line: l, lvl, reached, others } = await choices($)
  if (name === 'new' || name === 'newest') {
    await choose($, null)
    return t('swapNewest', { form: nameOf(growth.formAt(l, lvl)) })
  }
  const form = findForm(name, [...reached, ...others], [...growth.LINES[l], ...others])
  if (!form) return t('swapUnknown', { name })
  const locked = growth.forms(l).find(f => f.id === form && f.level > lvl)
  if (locked) return t('swapLocked', { form: nameOf(form), n: locked.level })
  await choose($, form)

  return t('swapped', { form: nameOf(form) })
}

const lastForm = (l: Starter) => (l === 'crab' ? t('lastForm') : t('lastFormAny'))

async function pets($: EngineInterface): Promise<string> {
  const { line: l, lvl, reached, found } = await choices($)
  const current = await shown($)
  const mark = (id: Form, i: number) => `${id === current ? '▸' : ' '} ${i + 1}. ${nameOf(id)}`
  const next = growth.nextForm(l, lvl)
  const families = new Set(found.map(id => growth.FEATURES.find(f => BASHOU_FAMILIES[growth.COMPANIONS[f]]!.forms.includes(id))))
  const left = growth.FEATURES.length - families.size
  return [t('pets', { n: reached.length, max: growth.LINES[l].length }), ...reached.map(mark),
          next ? t('nextForm', { form: nameOf(next.id), n: next.level }) : lastForm(l),
          t('fromClaude', { n: families.size, max: growth.FEATURES.length }),
          ...found.map((id, i) => mark(id, reached.length + i)),
          ...(left > 0 ? [t('petsLeft', { n: left })] : []),
          t('petsNext')].join('\n')
}

// Shows or hides the pet, everywhere and from now on; returns what to tell the person.
async function show($: EngineInterface, visible: boolean): Promise<string> {
  await $.store.set(HIDDEN_KEY, !visible)
  await update($, hidden, () => !visible)
  const isVertical = (await read($, layout)) === 'vertical'
  if (isVertical && visible) await openPane($)
  if (isVertical && !visible) await $.ui.close({ id: PANE })

  return !visible ? t('hidden') : isVertical ? t('shownVertical') : t('shown')
}

function hint(p: Progress): string {
  const next = growth.FEATURES.find(f => !p.features.includes(f))

  if (!next) return t('allTried')
  const pet = nameOf(BASHOU_FAMILIES[growth.COMPANIONS[next]]!.forms[0]!)
  return `${t('toFind')} ${t(`ach.${next}`)}\n${t(`how.${next}`)}\n${t('hintPet', { pet })}`
}

function stats(p: Progress, l: Starter): string {
  const lvl = growth.level(p)
  const next = growth.nextForm(l, lvl)
  const done = growth.achieved(p)

  return [
    `${nameOf(growth.formAt(l, lvl))} · ${t('level', { n: lvl, max: growth.ACHIEVEMENTS.length })}`,
    next ? t('nextForm', { form: nameOf(next.id), n: next.level }) : lastForm(l),
    t('stats', { days: p.days, streak: p.bestStreak, tokens: p.tokens.toLocaleString(language), prompts: p.prompts,
                 sessions: p.sessions }),
    `${t('achievements', { n: done.length, max: growth.ACHIEVEMENTS.length })} ${done.map(a => t(`ach.${a}`)).join(', ')}`,
  ].join('\n')
}

// /claudou swap alone: a picker of the forms reached, newest first, then the pets found (4 at most; "Other"
// takes a name or number).
async function pick($: EngineInterface): Promise<string> {
  const { reached, others } = await choices($)
  const all = [...[...reached].reverse(), ...others]
  if (all.length === 1) return t('swapOnlyOne', { form: nameOf(all[0]!) })
  const options = all.slice(0, 4).map(nameOf)
  const answer = await $.ui.ask(t('swapQuestion'), { options, header: 'Claudou' }).catch(() => null)
  if (answer === null || answer.trim() === '') return t('swapKept', { form: nameOf(await shown($)) })
  const exact = all.find(id => nameOf(id) === answer)
  return swap($, exact ?? answer.trim())
}

function levelLine(p: Progress, l: Starter): string {
  const lvl = growth.level(p)
  const next = growth.nextForm(l, lvl)
  return [nameOf(growth.formAt(l, lvl)), t('level', { n: lvl, max: growth.ACHIEVEMENTS.length }),
          ...(next ? [t('nextForm', { form: nameOf(next.id), n: next.level })] : [])].join(' · ')
}

// Every achievement: earned ones ticked, the features with how to find them, the goals with how far along.
function achievements(p: Progress): string {
  const done = growth.achieved(p)
  const features = growth.FEATURES.map(f =>
    done.includes(f) ? `✓ ${t(`ach.${f}`)}` : `· ${t(`ach.${f}`)}: ${t(`how.${f}`)}`)
  const goals = growth.GROWTH.map(g => done.includes(g.id) ? `✓ ${t(`ach.${g.id}`)}`
    : `· ${t(`ach.${g.id}`)} (${p[g.counter].toLocaleString(language)}/${g.goal.toLocaleString(language)})`)
  return [t('achievements', { n: done.length, max: growth.ACHIEVEMENTS.length }), ...features, ...goals].join('\n')
}

// The pet walks through every form of its line it reached, one per tick, and comes back to the one it shows.
async function evolve($: EngineInterface): Promise<string> {
  if (await read($, hidden)) return t('evolveHidden')
  const { reached } = await choices($)
  paradeLeft = reached.slice(1)
  await update($, parade, () => reached[0]!)
  return t('evolve', { forms: reached.map(nameOf).join(' → ') })
}

function share(p: Progress, l: Starter): string {
  const lvl = growth.level(p)
  return [t('shareIntro'), '', t('shareCard', { form: nameOf(growth.formAt(l, lvl)), n: lvl,
    max: growth.ACHIEVEMENTS.length, done: growth.achieved(p).length, days: p.days, streak: p.bestStreak })].join('\n')
}

function config(l: Layout): string {
  return t('config', { language: t(`languageName.${language}`), layout: t(`layoutName.${l}`) })
}

// Starts over after the person confirms: the first form again, no achievement, no swapped form.
async function reset($: EngineInterface): Promise<string> {
  const options = [t('resetYes'), t('resetNo')]
  const answer = await $.ui.ask(t('resetQuestion'), { options, header: 'Claudou' }).catch(() => null)
  if (answer !== options[0]) return t('resetKept')
  const fresh = growth.fresh()
  await $.store.set(STORE_KEY, fresh)
  await update($, progress, () => fresh)
  await choose($, null)
  return t('resetDone')
}

// The line question: the crab, or one of Bashou's starter lines. Dismissed, null.
async function askStarter($: EngineInterface): Promise<Starter | null> {
  const options = growth.STARTERS.map(s => t(`starter.${s}`))
  const answer = await $.ui.ask(t('startQuestion'), { options, header: 'Claudou' }).catch(() => null)
  const i = answer === null ? -1 : options.indexOf(answer)
  return i >= 0 ? growth.STARTERS[i]! : null
}

async function settle($: EngineInterface, l: Starter): Promise<void> {
  await $.store.set(STARTER_KEY, l)
  await update($, line, () => l)
  await choose($, null)
}

// /claudou start: change line at any time; the level and achievements are the player's, they stay.
async function start($: EngineInterface): Promise<string> {
  const l = await askStarter($)
  if (l === null) return t('startKept', { form: nameOf(await shown($)) })
  await settle($, l)
  return t('startChosen', { form: nameOf(await shown($)) })
}

// The first start of a new player: which pet (dismissed: the crab), then where it sits.
async function firstStart($: EngineInterface, isNew: boolean, isPlaced: boolean): Promise<void> {
  if (isNew) await settle($, (await askStarter($)) ?? 'crab')
  if (!isPlaced) await place($, await askLayout($))
}

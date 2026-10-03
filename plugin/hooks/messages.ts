// Everything a player reads, in every language. A test checks each message has them all.
export const LANGUAGES = ['en', 'fr'] as const
export type Language = (typeof LANGUAGES)[number]

export const MESSAGES = {
  paneTitle: { en: 'Claudou', fr: 'Claudou' },
  hatching: {
    en: 'A Crabling is about to hatch. Keep working with Claude: it grows as you do.',
    fr: 'Un Crabling va bientôt éclore. Continue à travailler avec Claude : il grandit avec toi.',
  },
  commandHelp: { en: 'Show your crab in a side pane', fr: 'Afficher ton crabe dans un panneau' },
  paneOpened: { en: 'Your crab is in the side pane.', fr: 'Ton crabe est dans le panneau sur le côté.' },
  level: { en: 'Level {n} of {max}', fr: 'Niveau {n} sur {max}' },
  nextForm: { en: 'Next: {form} at level {n}', fr: 'Ensuite : {form} au niveau {n}' },
  lastForm: {
    en: 'Everything ends up a crab: nature evolved crabs at least five times. Now so did you.',
    fr: 'Tout finit en crabe : la nature a inventé le crabe au moins cinq fois. Toi aussi, maintenant.',
  },
  unlockedToast: { en: 'Claudou: {name}! Your crab grows.', fr: 'Claudou : {name} ! Ton crabe grandit.' },
  evolvedToast: { en: 'Claudou: your crab became a {form}!', fr: 'Claudou : ton crabe est devenu {form} !' },
  stats: {
    en: '{days} days · best streak {streak} · {tokens} tokens · {prompts} prompts · {sessions} sessions',
    fr: '{days} jours · meilleure série {streak} · {tokens} jetons · {prompts} messages · {sessions} sessions',
  },
  toFind: { en: 'Try next:', fr: 'À essayer :' },

  'form.crabling': { en: 'Crabling', fr: 'Crabichon' },
  'form.peaCrab': { en: 'Pea crab', fr: 'Pinnothère' },
  'form.hermitCrab': { en: 'Hermit crab', fr: 'Bernard-l\'ermite' },
  'form.boxerCrab': { en: 'Boxer crab', fr: 'Crabe boxeur' },
  'form.fiddlerCrab': { en: 'Fiddler crab', fr: 'Crabe violoniste' },
  'form.hornedGhostCrab': { en: 'Horned ghost crab', fr: 'Crabe fantôme à cornes' },
  'form.halloweenCrab': { en: 'Halloween moon crab', fr: 'Crabe d\'Halloween' },
  'form.coconutCrab': { en: 'Coconut crab', fr: 'Crabe de cocotier' },
  'form.tasmanianGiantCrab': { en: 'Tasmanian giant crab', fr: 'Crabe géant de Tasmanie' },
  'form.japaneseSpiderCrab': { en: 'Japanese spider crab', fr: 'Crabe-araignée géant du Japon' },
  'form.crabPlanet': { en: 'Crab planet', fr: 'Planète crabe' },

  'ach.planner': { en: 'Planner', fr: 'Planificateur' },
  'how.planner': {
    en: 'Plan before you build: press shift+tab until plan mode, and Claude proposes a plan you approve first.',
    fr: 'Planifie avant de construire : shift+tab jusqu\'au mode plan, et Claude propose un plan que tu valides.',
  },
  'ach.delegator': { en: 'Delegator', fr: 'Délégateur' },
  'how.delegator': {
    en: 'Have Claude start a subagent: it works in its own context and keeps yours small.',
    fr: 'Fais lancer un sous-agent à Claude : il travaille dans son propre contexte et garde le tien léger.',
  },
  'ach.crabTeam': { en: 'Crab team', fr: 'Équipe de crabes' },
  'how.crabTeam': {
    en: 'Three subagents in one answer: independent searches run side by side.',
    fr: 'Trois sous-agents dans une seule réponse : des recherches indépendantes tournent en parallèle.',
  },
  'ach.skilledClaw': { en: 'Skilled claw', fr: 'Pince experte' },
  'how.skilledClaw': {
    en: 'Use a skill: a packaged set of instructions Claude loads only when the task needs it.',
    fr: 'Utilise un skill : des instructions toutes prêtes que Claude charge seulement quand la tâche en a besoin.',
  },
  'ach.tidyTide': { en: 'Tidy tide', fr: 'Marée propre' },
  'how.tidyTide': {
    en: 'Type /compact: Claude sums up the conversation so a long session stays sharp.',
    fr: 'Tape /compact : Claude résume la conversation pour qu\'une longue session reste précise.',
  },
  'ach.shellMemory': { en: 'Shell memory', fr: 'Mémoire de carapace' },
  'how.shellMemory': {
    en: 'Have Claude write a CLAUDE.md or a memory: what it learns stays for the next sessions.',
    fr: 'Fais écrire à Claude un CLAUDE.md ou une mémoire : ce qu\'il apprend reste pour les sessions suivantes.',
  },
  'ach.pluggedIn': { en: 'Plugged in', fr: 'Branché' },
  'how.pluggedIn': {
    en: 'Use an MCP tool: a server that connects Claude to another app or service.',
    fr: 'Utilise un outil MCP : un serveur qui relie Claude à une autre application ou un autre service.',
  },
  'ach.burrow': { en: 'Back to the burrow', fr: 'Retour au terrier' },
  'how.burrow': {
    en: 'Resume a past session with claude --resume or --continue: pick up where you left off.',
    fr: 'Reprends une session avec claude --resume ou --continue : tu repars là où tu t\'étais arrêté.',
  },
  'ach.day1': { en: 'First day', fr: 'Premier jour' },
  'ach.day3': { en: '3 days', fr: '3 jours' },
  'ach.day7': { en: '7 days', fr: '7 jours' },
  'ach.day30': { en: '30 days', fr: '30 jours' },
  'ach.day100': { en: '100 days', fr: '100 jours' },
  'ach.streak3': { en: '3 days in a row', fr: '3 jours d\'affilée' },
  'ach.streak7': { en: '7 days in a row', fr: '7 jours d\'affilée' },
  'ach.streak30': { en: '30 days in a row', fr: '30 jours d\'affilée' },
  'ach.tokens100k': { en: '100k tokens', fr: '100k jetons' },
  'ach.tokens1m': { en: '1M tokens', fr: '1M jetons' },
  'ach.tokens10m': { en: '10M tokens', fr: '10M jetons' },
  'ach.tokens100m': { en: '100M tokens', fr: '100M jetons' },
  'ach.prompts10': { en: '10 prompts', fr: '10 messages' },
  'ach.prompts100': { en: '100 prompts', fr: '100 messages' },
  'ach.prompts1000': { en: '1,000 prompts', fr: '1 000 messages' },
  'ach.sessions10': { en: '10 sessions', fr: '10 sessions' },
  'ach.sessions100': { en: '100 sessions', fr: '100 sessions' },
} satisfies Record<string, Record<Language, string>>

export type MessageId = keyof typeof MESSAGES

// A message, with its {placeholders} filled in.
export function t(id: MessageId, language: Language = 'en', values: Record<string, string | number> = {}): string {
  return MESSAGES[id][language].replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all))
}

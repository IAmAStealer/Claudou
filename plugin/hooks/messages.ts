// Everything a player reads, in every language. A test checks each message has them all.
export const LANGUAGES = ['en', 'fr'] as const
export type Language = (typeof LANGUAGES)[number]

export const MESSAGES = {
  commandHelp: {
    en: 'Your crab: show or hide it, or ask hint, talk, stats, pets, swap, help',
    fr: 'Ton crabe : l\'afficher ou le cacher, ou demander hint, talk, stats, pets, swap, help',
  },
  help: {
    en: [
      '/claudou: show or hide your crab',
      '/claudou hint: the next Claude Code feature to try',
      '/claudou talk: your crab gives you a tip now',
      '/claudou stats: level, form, counters and achievements',
      '/claudou pets: the forms your crab reached',
      '/claudou swap <form>: show another form you reached (swap alone goes back to the newest)',
      '/claudou here: show your crab',
      '/claudou hide: hide it',
    ].join('\n'),
    fr: [
      '/claudou : afficher ou cacher ton crabe',
      '/claudou hint : la prochaine fonction de Claude Code à essayer',
      '/claudou talk : ton crabe te donne une astuce tout de suite',
      '/claudou stats : niveau, forme, compteurs et succès',
      '/claudou pets : les formes que ton crabe a atteintes',
      '/claudou swap <forme> : montrer une autre forme atteinte (swap seul revient à la plus récente)',
      '/claudou here : afficher ton crabe',
      '/claudou hide : le cacher',
    ].join('\n'),
  },
  pets: { en: 'Forms reached ({n}/{max}):', fr: 'Formes atteintes ({n}/{max}) :' },
  petsNext: { en: 'Swap with /claudou swap <name or number>.', fr: 'Change avec /claudou swap <nom ou numéro>.' },
  swapped: { en: 'Your crab is now a {form}.', fr: 'Ton crabe est maintenant {form}.' },
  swapNewest: { en: 'Your crab shows its newest form: {form}.', fr: 'Ton crabe montre sa forme la plus récente : {form}.' },
  swapLocked: {
    en: '{form} comes at level {n}. Keep using Claude Code to get there.',
    fr: '{form} arrive au niveau {n}. Continue à utiliser Claude Code pour y arriver.',
  },
  swapUnknown: { en: 'No form called "{name}". /claudou pets lists them.', fr: 'Aucune forme « {name} ». /claudou pets les liste.' },
  shown: {
    en: 'Your crab sits above the prompt, on the right.',
    fr: 'Ton crabe est au-dessus de la saisie, à droite.',
  },
  hidden: { en: 'Your crab is hiding. /claudou brings it back.', fr: 'Ton crabe se cache. /claudou le fait revenir.' },
  allTried: {
    en: 'You tried every feature! Days, streaks, tokens, prompts and sessions still make your crab grow.',
    fr: 'Tu as essayé toutes les fonctions ! Les jours, séries, jetons, messages et sessions font encore grandir ton crabe.',
  },
  achievements: { en: 'Achievements ({n}/{max}):', fr: 'Succès ({n}/{max}) :' },
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

  'tip.clear': {
    en: 'Starting a new task? /clear empties the conversation, so old context doesn\'t steer the new work.',
    fr: 'Nouvelle tâche ? /clear vide la conversation, pour que l\'ancien contexte ne guide pas le nouveau travail.',
  },
  'tip.mention': {
    en: 'Type @ and a file name to put that file in your prompt: Claude reads exactly what you point at.',
    fr: 'Tape @ et un nom de fichier pour le mettre dans ton message : Claude lit exactement ce que tu montres.',
  },
  'tip.rewind': {
    en: 'Took a wrong turn? Press Esc twice to go back to an earlier message and try again from there.',
    fr: 'Mauvaise piste ? Appuie deux fois sur Échap pour revenir à un message précédent et repartir de là.',
  },
  'tip.init': {
    en: '/init writes a CLAUDE.md for this project: Claude reads it at every start, so you explain things once.',
    fr: '/init écrit un CLAUDE.md pour ce projet : Claude le lit à chaque démarrage, tu n\'expliques qu\'une fois.',
  },
  'tip.bang': {
    en: 'Start a prompt with ! to run a shell command yourself: its output lands in the conversation for Claude.',
    fr: 'Commence un message par ! pour lancer une commande toi-même : sa sortie arrive dans la conversation.',
  },
  'tip.context': {
    en: '/context shows what fills the context window, so you know when it is time to /compact or /clear.',
    fr: '/context montre ce qui remplit le contexte, pour savoir quand faire /compact ou /clear.',
  },
  'tip.model': {
    en: '/model switches the model: a faster one for small edits, the strongest one for hard problems.',
    fr: '/model change de modèle : un rapide pour les petites retouches, le plus fort pour les problèmes durs.',
  },
  'tip.escape': {
    en: 'Claude going the wrong way? Press Esc once to stop it, then say what you want instead.',
    fr: 'Claude part dans la mauvaise direction ? Appuie une fois sur Échap pour l\'arrêter, puis dis ce que tu veux.',
  },

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

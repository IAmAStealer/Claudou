// Everything a player reads, in every language. A test checks each message has them all.
export const LANGUAGES = ['en', 'fr'] as const
export type Language = (typeof LANGUAGES)[number]

export const MESSAGES = {
  commandHelp: {
    en: 'Your pet: the list of commands, or on, off, level, stats, achievements, hint, talk, pets, swap, evolve, share, layout, config, start, reset, version, help',
    fr: 'Ton compagnon : la liste des commandes, ou on, off, level, stats, achievements, hint, talk, pets, swap, evolve, share, layout, config, start, reset, version, help',
  },
  petJoined: {
    en: 'Claudou: a new pet joined you: {pet}! See /claudou pets',
    fr: 'Claudou : un nouveau compagnon te rejoint : {pet} ! Vois /claudou pets',
  },
  hintPet: {
    en: 'A new pet comes with it: {pet}.',
    fr: 'Un nouveau compagnon vient avec : {pet}.',
  },
  petGrew: {
    en: 'Claudou: your pet grew into a {pet}!',
    fr: 'Claudou : ton compagnon est devenu {pet} !',
  },
  fromClaude: {
    en: 'Found with Claude Code ({n}/{max}):',
    fr: 'Trouvés avec Claude Code ({n}/{max}) :',
  },
  petsLeft: {
    en: '  {n} more to find: each Claude Code feature brings one (/claudou hint)',
    fr: '  encore {n} à trouver : chaque fonction de Claude Code en amène un (/claudou hint)',
  },
  help: {
    en: [
      '/claudou (or help): this list',
      '/claudou on (or here), /claudou off (or hide): show it, hide it',
      '/claudou level: form, level and next form, in one line',
      '/claudou stats: level, form, counters and achievements',
      '/claudou achievements: every achievement, and how to get the missing ones',
      '/claudou hint: the next Claude Code feature to try',
      '/claudou talk: your pet gives you a tip now',
      '/claudou pets: the forms your pet reached',
      '/claudou swap: pick another form you reached (swap <name or number>, swap new for the newest)',
      '/claudou evolve: watch your pet grow through its forms',
      '/claudou share: a card to copy and share',
      '/claudou layout horizontal|vertical: above the prompt, or in a column beside the conversation',
      '/claudou config: your settings and where to change them',
      '/claudou start: choose your pet: crab, star, sprout or pebble (your level stays)',
      '/claudou reset: start over from the first form',
      '/claudou version: the version of Claudou',
    ].join('\n'),
    fr: [
      '/claudou (ou help) : cette liste',
      '/claudou on (ou here), /claudou off (ou hide) : l\'afficher, le cacher',
      '/claudou level : forme, niveau et forme suivante, en une ligne',
      '/claudou stats : niveau, forme, compteurs et succès',
      '/claudou achievements : tous les succès, et comment obtenir ceux qui manquent',
      '/claudou hint : la prochaine fonction de Claude Code à essayer',
      '/claudou talk : ton compagnon te donne une astuce tout de suite',
      '/claudou pets : les formes que ton compagnon a atteintes',
      '/claudou swap : choisir une autre forme atteinte (swap <nom ou numéro>, swap new pour la plus récente)',
      '/claudou evolve : regarde ton compagnon grandir à travers ses formes',
      '/claudou share : une carte à copier et partager',
      '/claudou layout horizontal|vertical : au-dessus de la saisie, ou dans une colonne à côté de la conversation',
      '/claudou config : tes réglages et où les changer',
      '/claudou start : choisir ton compagnon : crabe, étoile, pousse ou caillou (ton niveau reste)',
      '/claudou reset : recommencer depuis la première forme',
      '/claudou version : la version de Claudou',
    ].join('\n'),
  },
  swapQuestion: { en: 'Which form should your pet show?', fr: 'Quelle forme ton compagnon doit-il montrer ?' },
  swapOnlyOne: {
    en: 'Your pet has only one form so far: {form}. It grows as you use Claude Code.',
    fr: 'Ton compagnon n\'a qu\'une forme pour l\'instant : {form}. Il grandit quand tu utilises Claude Code.',
  },
  swapKept: { en: 'Your pet stays a {form}.', fr: 'Ton compagnon reste {form}.' },
  evolve: { en: 'Watch your pet grow: {forms}', fr: 'Regarde ton compagnon grandir : {forms}' },
  evolveHidden: {
    en: 'Your pet is hiding: /claudou on, then /claudou evolve.',
    fr: 'Ton compagnon se cache : /claudou on, puis /claudou evolve.',
  },
  shareIntro: { en: 'Copy this card to share your pet:', fr: 'Copie cette carte pour partager ton compagnon :' },
  shareCard: {
    en: '🦀 My Claudou is a {form}, level {n} of {max}\n{done} achievements · {days} days · best streak {streak}\n'
      + 'A pet that grows in Claude Code: https://github.com/IAmAStealer/Claudou',
    fr: '🦀 Mon Claudou est {form}, niveau {n} sur {max}\n{done} succès · {days} jours · meilleure série {streak}\n'
      + 'Un compagnon qui grandit dans Claude Code : https://github.com/IAmAStealer/Claudou',
  },
  version: { en: 'Claudou v{version}', fr: 'Claudou v{version}' },
  config: {
    en: 'Language: {language} (change it in /config, Claudou plugin)\nLayout: {layout} (change it with /claudou layout)',
    fr: 'Langue : {language} (à changer dans /config, plugin Claudou)\nDisposition : {layout} (à changer avec /claudou layout)',
  },
  'languageName.en': { en: 'English', fr: 'anglais' },
  'languageName.fr': { en: 'French', fr: 'français' },
  'layoutName.horizontal': { en: 'horizontal, above the prompt', fr: 'horizontale, au-dessus de la saisie' },
  'layoutName.vertical': { en: 'vertical, a column beside the conversation', fr: 'verticale, une colonne à côté de la conversation' },
  resetQuestion: {
    en: 'Start over? Your pet goes back to its first form and loses every achievement.',
    fr: 'Recommencer ? Ton compagnon revient à sa première forme et perd tous ses succès.',
  },
  resetYes: { en: 'Start over', fr: 'Recommencer' },
  resetNo: { en: 'Keep my pet', fr: 'Garder mon compagnon' },
  resetDone: { en: 'Your pet starts over from its first form. Have fun!', fr: 'Ton compagnon repart de sa première forme. Amuse-toi bien !' },
  resetKept: { en: 'Your pet stays as it is.', fr: 'Ton compagnon reste comme il est.' },
  pets: { en: 'Forms reached ({n}/{max}):', fr: 'Formes atteintes ({n}/{max}) :' },
  petsNext: { en: 'Swap with /claudou swap <name or number>.', fr: 'Change avec /claudou swap <nom ou numéro>.' },
  swapped: { en: 'Your pet is now a {form}.', fr: 'Ton compagnon est maintenant {form}.' },
  swapNewest: { en: 'Your pet shows its newest form: {form}.', fr: 'Ton compagnon montre sa forme la plus récente : {form}.' },
  swapLocked: {
    en: '{form} comes at level {n}. Keep using Claude Code to get there.',
    fr: '{form} arrive au niveau {n}. Continue à utiliser Claude Code pour y arriver.',
  },
  swapUnknown: { en: 'No form called "{name}". /claudou pets lists them.', fr: 'Aucune forme « {name} ». /claudou pets les liste.' },
  shown: {
    en: 'Your pet sits above the prompt, on the right.',
    fr: 'Ton compagnon est au-dessus de la saisie, à droite.',
  },
  shownVertical: {
    en: 'Your pet sits in a column beside the conversation (in fullscreen from 110 columns, above the prompt otherwise).',
    fr: 'Ton compagnon est dans une colonne à côté de la conversation (en plein écran dès 110 colonnes, sinon au-dessus de la saisie).',
  },
  layoutQuestion: { en: 'Where should your pet sit?', fr: 'Où doit s\'installer ton compagnon ?' },
  'layout.horizontal': {
    en: 'Horizontal: above the prompt, on the right',
    fr: 'Horizontal : au-dessus de la saisie, à droite',
  },
  'layout.vertical': {
    en: 'Vertical: a column beside the conversation',
    fr: 'Vertical : une colonne à côté de la conversation',
  },
  layoutUnknown: {
    en: 'Choose with /claudou layout horizontal or /claudou layout vertical.',
    fr: 'Choisis avec /claudou layout horizontal ou /claudou layout vertical.',
  },
  hidden: { en: 'Your pet is hiding. /claudou brings it back.', fr: 'Ton compagnon se cache. /claudou le fait revenir.' },
  allTried: {
    en: 'You tried every feature! Days, streaks, tokens, prompts and sessions still make your pet grow.',
    fr: 'Tu as essayé toutes les fonctions ! Les jours, séries, jetons, messages et sessions font encore grandir ton compagnon.',
  },
  achievements: { en: 'Achievements ({n}/{max}):', fr: 'Succès ({n}/{max}) :' },
  level: { en: 'Level {n} of {max}', fr: 'Niveau {n} sur {max}' },
  nextForm: { en: 'Next: {form} at level {n}', fr: 'Ensuite : {form} au niveau {n}' },
  lastFormAny: { en: 'Your pet reached its last form so far.', fr: 'Ton compagnon a atteint sa dernière forme pour l\'instant.' },
  startQuestion: { en: 'Which pet do you want?', fr: 'Quel compagnon veux-tu ?' },
  'starter.crab': { en: 'Crab: from a tiny Crabling to a crab planet', fr: 'Crabe : du minuscule Crabichon à la planète crabe' },
  'starter.star': { en: 'Star: from stardust to the stars', fr: 'Étoile : de la poussière aux étoiles' },
  'starter.sprout': { en: 'Sprout: from a seedling to a tree spirit', fr: 'Pousse : de la graine à l\'esprit de l\'arbre' },
  'starter.pebble': { en: 'Pebble: from a grain of sand to a jade golem', fr: 'Caillou : du grain de sable au golem de jade' },
  startChosen: {
    en: 'Your pet is now a {form}. Your level and achievements stay.',
    fr: 'Ton compagnon est maintenant {form}. Ton niveau et tes succès restent.',
  },
  startKept: { en: 'Your pet stays a {form}.', fr: 'Ton compagnon reste {form}.' },
  lastForm: {
    en: 'Everything ends up a crab: nature evolved crabs at least five times. Now so did you.',
    fr: 'Tout finit en crabe : la nature a inventé le crabe au moins cinq fois. Toi aussi, maintenant.',
  },
  unlockedToast: { en: 'Claudou: {name}! Your pet grows.', fr: 'Claudou : {name} ! Ton compagnon grandit.' },
  evolvedToast: { en: 'Claudou: your pet became a {form}!', fr: 'Claudou : ton compagnon est devenu {form} !' },
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

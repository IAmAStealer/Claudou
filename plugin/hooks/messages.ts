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
} satisfies Record<string, Record<Language, string>>

export type MessageId = keyof typeof MESSAGES

export function t(id: MessageId, language: Language = 'en'): string {
  return MESSAGES[id][language]
}

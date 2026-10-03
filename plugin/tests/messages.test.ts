import { expect, test } from 'claude-code/testing'

import { LANGUAGES, MESSAGES } from '../hooks/messages'

test('every message is in every language, and never empty', () => {
  for (const [id, texts] of Object.entries(MESSAGES)) {
    for (const language of LANGUAGES) {
      expect(typeof texts[language]).toBe('string')
      expect(texts[language].trim().length > 0).toBe(true)
    }
    expect(Object.keys(texts).sort()).toEqual([...LANGUAGES].sort())
    expect(id.length > 0).toBe(true)
  }
})

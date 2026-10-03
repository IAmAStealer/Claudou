import { expect, test } from 'claude-code/testing'

import { t } from '../hooks/messages'

test('/claudou opens the pane and says so', async ($, on) => {
  const opened: string[] = []
  on('ui.open', async (_$, e) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  const { text } = await $.command.run({
    command: 'claudou', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 },
  })
  expect(text).toBe(t('paneOpened'))
  expect(opened).toEqual(['claudou'])
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`the pane draws the hatching crab on ${surface}`, async $ => {
    const pane = await $.ui.mount({ plugin: 'claudou', surface, component: 'Pane', requestId: 'claudou',
      props: { title: 'Claudou', isFocused: false, bodyColumns: 40, placement: 'dock',
               scroll: { offset: 0, bodyRows: 20 }, view: {} } })
    expect(JSON.stringify(await pane.drawn())).toContain(t('hatching'))
  })
}

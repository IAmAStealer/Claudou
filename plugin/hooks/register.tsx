import type { Register } from 'claude-code'

import { t } from './messages'

export const PANE = 'claudou'
export const COMMAND = 'claudou'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: t('commandHelp') })
    void $.ui.open({ id: PANE, title: t('paneTitle') })      // waits for a window of 144 columns or more

    return next(e)
  })

  on('command.run', { command: COMMAND }, async $ => {
    await $.ui.open({ id: PANE, title: t('paneTitle') })

    return { text: t('paneOpened') }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Text>{t('hatching')}</Text>
      </Box>
    )
  })
}

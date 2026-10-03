// Drawing a 17x12 sprite with half blocks: each text cell shows two pixels, the top one as the character's
// color, the bottom one as its background. Pure functions; the pane turns the runs into Text elements.

export type Sprite = {
  palette: Record<string, string>
  base: string[]
  poses: Record<string, Record<string, string>>     // row index -> row painted over base, '-' keeps the pixel
}

// The order the poses come in, one step per tick: mostly still, breathing, a blink, a look around, a fidget.
export const SEQUENCE = [
  'base', 'base', 'inhale', 'base', 'base', 'base', 'closed', 'base',
  'left', 'base', 'right', 'base', 'inhale', 'base', 'base', 'fidget',
] as const
export const TICK_MS = 1200

export function poseAt(tick: number): string {
  return SEQUENCE[((tick % SEQUENCE.length) + SEQUENCE.length) % SEQUENCE.length]
}

export function frame(sprite: Sprite, pose: string): string[] {
  const rows = [...sprite.base]
  for (const [r, line] of Object.entries(sprite.poses[pose] ?? {})) {
    const i = Number(r)
    rows[i] = [...rows[i]].map((pixel, c) => (line[c] === '-' || line[c] === undefined ? pixel : line[c])).join('')
  }
  return rows
}

export type Run = { text: string; color?: string; background?: string }

// One line of text per two pixel rows, as runs of cells sharing their colors.
export function lines(sprite: Sprite, pose: string): Run[][] {
  const rows = frame(sprite, pose)
  const color = (ch: string | undefined) => (ch === undefined ? undefined : sprite.palette[ch])
  const out: Run[][] = []
  for (let r = 0; r < rows.length; r += 2) {
    const runs: Run[] = []
    for (let c = 0; c < rows[r].length; c++) {
      const top = color(rows[r][c])
      const bottom = color(rows[r + 1]?.[c])
      const cell: Run = top && bottom ? (top === bottom ? { text: '█', color: top } : { text: '▀', color: top, background: bottom })
        : top ? { text: '▀', color: top }
        : bottom ? { text: '▄', color: bottom }
        : { text: ' ' }
      const last = runs[runs.length - 1]
      if (last && last.color === cell.color && last.background === cell.background) last.text += cell.text
      else runs.push(cell)
    }
    out.push(runs)
  }
  return out
}

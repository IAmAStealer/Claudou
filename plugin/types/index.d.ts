// The mod's state contract (self-contained, as the engine requires): what growth.ts keeps across sessions.
export type Feature =
  'planner' | 'delegator' | 'crabTeam' | 'skilledClaw' | 'tidyTide' | 'shellMemory' | 'pluggedIn' | 'burrow'

export type Progress = {
  days: number            // distinct days with at least one prompt
  lastDay: string         // YYYY-MM-DD of the last of them, '' before the first
  streak: number          // days in a row, ending on lastDay
  bestStreak: number
  tokens: number          // input + output; cache reads and writes don't count
  prompts: number
  sessions: number
  features: Feature[]
  uses: Partial<Record<Feature, number>>   // how many times each feature was used: its pet grows with it
}

declare module 'claude-code' {
  interface PluginState {
    claudou: { progress: Progress; tick: number; hidden: boolean; chosen: string | null; bubble: string | null
               layout: 'horizontal' | 'vertical'; parade: string | null
               starter: 'crab' | 'star' | 'sprout' | 'pebble'
               reaction: 'pass' | 'fail' | 'done' | 'idle' | null }
  }
}

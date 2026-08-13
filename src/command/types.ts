export type CommandAction =
  | { kind: 'navigate'; to: string; highlight?: string }
  | { kind: 'external'; url: string; label: string }
  | { kind: 'answer' }
  | { kind: 'effect'; effect: 'drs' | 'boxbox' | 'lights' | 'radio' }
  | { kind: 'unknown' }

export interface Intent {
  id: string
  /** Single tokens. Matched exactly (+2), by prefix (+1) or within edit distance 1 (+1). */
  keywords: string[]
  /** Multi-word fragments matched against the raw normalized text (+3). */
  phrases?: string[]
  /**
   * Identity tokens — words that name this intent and nothing else, so a hit is
   * worth a phrase (+3). Keeps a project's own name ahead of the generic route
   * intent that shares its vocabulary.
   */
  strong?: string[]
  reply: string
  action: CommandAction
  /** Surfaced as a suggestion chip / in the filtered list while typing. */
  example?: string
}

export interface CommandResult {
  reply: string
  action: CommandAction
  confidence: number
  /** Populated only inside the ambiguous band, for a "did you mean" row. */
  alternates: Intent[]
  source: 'rules' | 'llm'
}

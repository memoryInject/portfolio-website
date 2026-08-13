import { intents } from './intents'
import { correctWord, editDistance, normalize, tokenize } from './text'
import type { CommandResult, Intent } from './types'

/** Score bands. At or above CONFIDENT we just run it; between the two we offer alternates. */
const CONFIDENT = 2.0
const AMBIGUOUS = 1.0

/**
 * Keyword-count damping. The plan calls for dividing by √(keywords.length); the
 * reference point is 4 keywords, so an intent of average length keeps its raw
 * score and the bands above stay meaningful.
 */
const NEUTRAL_KEYWORDS = 4

const UNKNOWN_REPLY =
  "That one's not in my telemetry. Try a page name, a technology, a project, or ask what I can do."

/** Every keyword the engine knows, used to spell-correct incoming prompts. */
const vocabulary = new Set<string>(intents.flatMap((intent) => [...intent.keywords, ...(intent.strong ?? [])]))

function scoreIntent(intent: Intent, norm: string, tokens: string[], corrected: Set<string>): number {
  let raw = 0

  for (const phrase of intent.phrases ?? []) {
    if (!phrase) continue
    // Multi-word phrases match anywhere; a single-word phrase only counts as the whole prompt.
    const hit = phrase.includes(' ') ? norm.includes(phrase) : norm === phrase
    if (hit) raw += 3
  }

  // Identity tokens carry phrase weight and stay out of the keyword-count damping.
  for (const token of intent.strong ?? []) {
    if (tokens.includes(token)) raw += 3
  }

  for (const keyword of intent.keywords) {
    let best = 0
    for (const token of tokens) {
      if (token === keyword) {
        // A token we had to spell-correct is worth slightly less than one typed cleanly.
        best = Math.max(best, corrected.has(token) ? 1.6 : 2)
        if (best === 2) break
        continue
      }
      if (keyword.length >= 4 && token.length >= 4) {
        if (token.startsWith(keyword) || keyword.startsWith(token)) best = Math.max(best, 1)
        else if (editDistance(token, keyword) <= 1) best = Math.max(best, 1)
      }
    }
    raw += best
  }

  const n = Math.max(intent.keywords.length, 1)
  return raw / Math.sqrt(n / NEUTRAL_KEYWORDS)
}

function rank(text: string): { intent: Intent; score: number }[] {
  const raw = normalize(text)
  if (!raw) return []

  // Spell-correct against the vocabulary first, so "abuot page" still matches the
  // "about page" phrase and not just the fuzzy keyword.
  const corrected = new Set<string>()
  const words = raw.split(' ').map((word) => {
    const fixed = correctWord(word, vocabulary)
    if (!fixed) return word
    corrected.add(fixed)
    return fixed
  })

  const norm = words.join(' ')
  const tokens = tokenize(norm)
  return intents
    .map((intent) => ({ intent, score: scoreIntent(intent, norm, tokens, corrected) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function resolvePrompt(text: string): CommandResult {
  const ranked = rank(text)
  const top = ranked[0]

  if (!top || top.score < AMBIGUOUS) {
    return {
      reply: UNKNOWN_REPLY,
      action: { kind: 'unknown' },
      confidence: top?.score ?? 0,
      alternates: [],
      source: 'rules',
    }
  }

  return {
    reply: top.intent.reply,
    action: top.intent.action,
    confidence: top.score,
    alternates: top.score >= CONFIDENT ? [] : ranked.slice(1, 4).map((r) => r.intent),
    source: 'rules',
  }
}

/** Live suggestion list while typing. Falls back to the broad examples on an empty prompt. */
export function suggestIntents(text: string, limit = 5): Intent[] {
  const withExamples = (list: Intent[]) => list.filter((i) => i.example).slice(0, limit)
  if (!normalize(text)) return withExamples(intents)
  return withExamples(rank(text).map((r) => r.intent))
}

export function resultForIntent(intent: Intent): CommandResult {
  return { reply: intent.reply, action: intent.action, confidence: CONFIDENT, alternates: [], source: 'rules' }
}

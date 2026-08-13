/** Shared text utilities for the intent engine. No dependencies — ~40 lines. */

export const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'is', 'are', 'was', 'were',
  'be', 'do', 'does', 'did', 'i', 'me', 'my', 'you', 'your', 'yours', 'we', 'us', 'it', 'its',
  'can', 'could', 'would', 'should', 'please', 'page', 'go', 'goto', 'show', 'open', 'take',
  'tell', 'give', 'get', 'see', 'want', 'any', 'some', 'with', 'now', 'up', 'over', 'through',
])

/** lowercase, strip punctuation, collapse whitespace. Keeps stopwords. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Content tokens — stopwords removed, but never down to nothing. */
export function tokenize(normalized: string): string[] {
  const all = normalized.split(' ').filter(Boolean)
  const kept = all.filter((t) => !STOPWORDS.has(t))
  return kept.length ? kept : all
}

/** Every content token of a phrase, for building keyword lists from data. */
export function keywordsFrom(...values: string[]): string[] {
  const out = new Set<string>()
  for (const value of values) {
    for (const token of tokenize(normalize(value))) {
      if (token.length > 1) out.add(token)
    }
  }
  return [...out]
}

/**
 * Damerau-Levenshtein distance, bailing out as soon as it exceeds `max`.
 * Transposition counts as one edit — "abuot" is one slip away from "about",
 * which plain Levenshtein would score as two.
 */
export function editDistance(a: string, b: string, max = 1): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  let twoBack: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, twoBack[j - 2] + 1)
      }
      row[j] = value
      if (value < best) best = value
    }
    if (best > max) return max + 1
    twoBack = prev
    prev = row
  }
  return prev[b.length]
}

/**
 * Snap a misspelled word onto the intent vocabulary. Only fires for words the
 * vocabulary doesn't already contain, and only when the nearest match is
 * unambiguous, so "react" never silently becomes "redux".
 */
export function correctWord(word: string, vocabulary: Set<string>): string | null {
  if (word.length < 4 || vocabulary.has(word)) return null
  let match: string | null = null
  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - word.length) > 1) continue
    if (editDistance(word, candidate) > 1) continue
    if (match && match !== candidate) return null // ambiguous — leave the word alone
    match = candidate
  }
  return match
}

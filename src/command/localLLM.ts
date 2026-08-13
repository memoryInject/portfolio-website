import { siteSummary } from './knowledge'
import { knownExternalUrls, knownRoutes } from './intents'
import { projects } from '../data/projects'
import type { CommandAction } from './types'

/**
 * Chrome's built-in Prompt API, used strictly as progressive enhancement.
 * Absent in Firefox/Safari/mobile and gated behind a multi-GB download in Chrome,
 * so every path here degrades to `null` and the caller keeps the rules result.
 */

export type LocalAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available'

interface LanguageModelSession {
  prompt(input: string, options?: { signal?: AbortSignal; responseConstraint?: object }): Promise<string>
  destroy?(): void
}

interface LanguageModelOptions {
  initialPrompts?: { role: string; content: string }[]
  expectedOutputs?: { type: string; languages: string[] }[]
  monitor?: (m: { addEventListener(type: 'downloadprogress', fn: (e: { loaded: number }) => void): void }) => void
  signal?: AbortSignal
}

interface LanguageModelStatic {
  availability(options?: LanguageModelOptions): Promise<LocalAvailability>
  create(options?: LanguageModelOptions): Promise<LanguageModelSession>
}

const STORAGE_KEY = 'mi.localAI'
const TIMEOUT_MS = 4000

// Chrome requires an explicit output language for both the capability check and session creation.
const expectedOutputs = [{ type: 'text', languages: ['en'] }]

function api(): LanguageModelStatic | null {
  const global = globalThis as unknown as { LanguageModel?: LanguageModelStatic }
  return global.LanguageModel ?? null
}

export function isSupported(): boolean {
  return api() !== null
}

export async function getAvailability(): Promise<LocalAvailability> {
  const model = api()
  if (!model) return 'unavailable'
  try {
    return await model.availability({ expectedOutputs })
  } catch {
    return 'unavailable'
  }
}

export function isEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    /* private mode — the toggle just won't persist */
  }
  if (!enabled) destroySession()
}

const responseConstraint = {
  type: 'object',
  required: ['reply', 'action'],
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    action: {
      type: 'object',
      required: ['kind'],
      properties: {
        kind: { type: 'string', enum: ['navigate', 'external', 'answer', 'unknown'] },
        to: { type: 'string' },
        highlight: { type: 'string' },
        url: { type: 'string' },
        label: { type: 'string' },
      },
    },
  },
} as const

const systemPrompt = [
  'You are the command bar on a personal portfolio site. Answer as the site, in one or two short sentences, in a dry technical tone.',
  'Reply ONLY with JSON: {"reply": string, "action": {"kind": "navigate"|"external"|"answer"|"unknown", ...}}.',
  'Use kind "navigate" with "to" set to one of the routes below (optionally "highlight" set to a project id) when the visitor wants to see a page.',
  'Use kind "external" with "url" and "label" only for the listed links. Use kind "answer" for questions. Use kind "unknown" if it is off-topic.',
  'Never invent facts, routes, links or project ids that are not listed here.',
  '',
  siteSummary,
].join('\n')

let sessionPromise: Promise<LanguageModelSession | null> | null = null

export function destroySession(): void {
  const pending = sessionPromise
  sessionPromise = null
  pending?.then((s) => s?.destroy?.()).catch(() => {})
}

/**
 * Creates the session. Only ever called from an explicit user opt-in, so a
 * `downloadable` model never downloads on page load.
 */
export function startSession(onProgress?: (loaded: number) => void): Promise<LanguageModelSession | null> {
  const model = api()
  if (!model) return Promise.resolve(null)
  if (!sessionPromise) {
    sessionPromise = model
      .create({
        initialPrompts: [{ role: 'system', content: systemPrompt }],
        expectedOutputs,
        monitor: (m) => m.addEventListener('downloadprogress', (e) => onProgress?.(e.loaded)),
      })
      .catch(() => null)
  }
  return sessionPromise
}

const projectIds = new Set(projects.map((p) => p.id))

/** Rejects anything pointing outside the routes and links the rules engine already knows. */
function validateAction(action: unknown): CommandAction | null {
  if (!action || typeof action !== 'object') return null
  const candidate = action as Record<string, unknown>
  switch (candidate.kind) {
    case 'navigate': {
      const to = typeof candidate.to === 'string' ? candidate.to.replace(/\/$/, '') || '/' : ''
      if (!knownRoutes.includes(to)) return null
      const highlight = typeof candidate.highlight === 'string' && projectIds.has(candidate.highlight)
        ? candidate.highlight
        : undefined
      return { kind: 'navigate', to, highlight }
    }
    case 'external': {
      const url = typeof candidate.url === 'string' ? candidate.url : ''
      if (!knownExternalUrls.includes(url)) return null
      const label = typeof candidate.label === 'string' && candidate.label ? candidate.label : url
      return { kind: 'external', url, label }
    }
    case 'answer':
      return { kind: 'answer' }
    default:
      return null
  }
}

function parsePayload(raw: string): { reply: string; action: CommandAction } | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = (fenced ? fenced[1] : raw).trim()
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(body.slice(start, end + 1))
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const { reply, action } = parsed as { reply?: unknown; action?: unknown }
  if (typeof reply !== 'string' || !reply.trim()) return null
  const validated = validateAction(action)
  if (!validated) return null
  return { reply: reply.trim(), action: validated }
}

/**
 * Returns `null` on absolutely any failure — unsupported, disabled, timed out,
 * malformed JSON, or an action pointing somewhere the router doesn't recognise.
 */
export async function askLocalLLM(text: string): Promise<{ reply: string; action: CommandAction } | null> {
  if (!isEnabled() || !isSupported()) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const session = await startSession()
    if (!session) return null
    let raw: string
    try {
      raw = await session.prompt(text, { signal: controller.signal, responseConstraint })
    } catch {
      // responseConstraint is unsupported on some builds — retry plain, same deadline.
      raw = await session.prompt(text, { signal: controller.signal })
    }
    return parsePayload(raw)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

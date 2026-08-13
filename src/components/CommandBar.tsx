import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCommandBar } from './CommandBarProvider'
import CommandEffect, { type EffectName } from './CommandEffects'
import { resolvePrompt, resultForIntent, suggestIntents } from '../command/router'
import { suggestions as exampleSuggestions } from '../command/intents'
import {
  askLocalLLM,
  getAvailability,
  isEnabled,
  isSupported,
  setEnabled,
  startSession,
  type LocalAvailability,
} from '../command/localLLM'
import type { CommandResult, Intent } from '../command/types'

type Phase = 'idle' | 'thinking' | 'streaming' | 'confirm' | 'countdown'

interface Exchange {
  id: number
  prompt: string
  reply: string
  source: 'rules' | 'llm'
}

const HISTORY_KEY = 'mi.cmdHistory'
const HISTORY_MAX = 5
const TYPE_MS = 18
const COUNTDOWN_MS = 700

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string').slice(0, HISTORY_MAX) : []
  } catch {
    return []
  }
}

function saveHistory(list: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)))
  } catch {
    /* private mode */
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function CommandBar() {
  const { isOpen, close } = useCommandBar()
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [transcript, setTranscript] = useState<Exchange[]>([])
  const [activePrompt, setActivePrompt] = useState('')
  const [result, setResult] = useState<CommandResult | null>(null)
  const [revealed, setRevealed] = useState('')
  const [selected, setSelected] = useState(-1)
  const [effect, setEffect] = useState<EffectName | null>(null)
  const [availability, setAvailability] = useState<LocalAvailability>('unavailable')
  const [localOn, setLocalOn] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const runIdRef = useRef(0)
  const historyRef = useRef<string[]>([])
  const historyPosRef = useRef(-1)
  const exchangeIdRef = useRef(0)
  const activePromptRef = useRef('')
  const resultRef = useRef<CommandResult | null>(null)

  const reduced = prefersReducedMotion()

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }, [])

  /* ---------------------------------------------------------------- lifecycle */

  useEffect(() => {
    if (!isOpen) return
    historyRef.current = loadHistory()
    historyPosRef.current = -1
    inputRef.current?.focus()
    let cancelled = false
    getAvailability().then((value) => {
      if (cancelled) return
      setAvailability(value)
      setLocalOn(isEnabled() && value === 'available')
    })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Session transcript lives only as long as the bar is open.
  useEffect(() => {
    if (isOpen) return
    runIdRef.current += 1
    clearTimers()
    activePromptRef.current = ''
    resultRef.current = null
    setInput('')
    setPhase('idle')
    setTranscript([])
    setActivePrompt('')
    setResult(null)
    setRevealed('')
    setSelected(-1)
  }, [isOpen, clearTimers])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    if (!isOpen || input || phase !== 'idle' || reduced) return
    const id = window.setInterval(() => setPlaceholderIndex((i) => (i + 1) % exampleSuggestions.length), 2800)
    return () => clearInterval(id)
  }, [isOpen, input, phase, reduced])

  /* ------------------------------------------------------------------ running */

  /** Fold the exchange on screen into the scrollback before starting the next one. */
  const commitActive = useCallback(() => {
    const prompt = activePromptRef.current
    const current = resultRef.current
    if (prompt && current) {
      exchangeIdRef.current += 1
      const entry: Exchange = {
        id: exchangeIdRef.current,
        prompt,
        reply: current.reply,
        source: current.source,
      }
      setTranscript((list) => [...list, entry])
    }
    activePromptRef.current = ''
    resultRef.current = null
    setActivePrompt('')
    setResult(null)
    setRevealed('')
  }, [])

  const execute = useCallback(
    (current: CommandResult) => {
      switch (current.action.kind) {
        case 'navigate': {
          const { to, highlight } = current.action
          setPhase('countdown')
          later(() => {
            navigate(highlight ? `${to}?p=${highlight}` : to)
            close()
          }, reduced ? 120 : COUNTDOWN_MS)
          break
        }
        case 'external':
          setPhase('confirm')
          break
        case 'effect':
          setEffect(current.action.effect)
          setPhase('idle')
          break
        default:
          setPhase('idle')
      }
    },
    [close, later, navigate, reduced],
  )

  const stream = useCallback(
    (current: CommandResult, runId: number) => {
      setPhase('streaming')
      if (reduced) {
        setRevealed(current.reply)
        execute(current)
        return
      }
      let i = 0
      const tick = () => {
        if (runIdRef.current !== runId) return
        i += 1
        setRevealed(current.reply.slice(0, i))
        if (i < current.reply.length) later(tick, TYPE_MS)
        else execute(current)
      }
      tick()
    },
    [execute, later, reduced],
  )

  const runResult = useCallback(
    async (prompt: string, forced?: CommandResult) => {
      clearTimers()
      commitActive()
      runIdRef.current += 1
      const runId = runIdRef.current

      const history = [prompt, ...historyRef.current.filter((h) => h !== prompt)].slice(0, HISTORY_MAX)
      historyRef.current = history
      historyPosRef.current = -1
      saveHistory(history)

      setInput('')
      setSelected(-1)
      setActivePrompt(prompt)
      setRevealed('')
      setPhase('thinking')

      // Rules first, always — the model can only ever upgrade the answer.
      const rules = forced ?? resolvePrompt(prompt)
      const think = reduced ? 0 : 350 + Math.random() * 250
      const [, llm] = await Promise.all([
        new Promise((resolve) => later(() => resolve(null), think)),
        forced ? Promise.resolve(null) : askLocalLLM(prompt),
      ])
      if (runIdRef.current !== runId) return

      const current: CommandResult = llm
        ? { reply: llm.reply, action: llm.action, confidence: 3, alternates: [], source: 'llm' }
        : rules

      setResult(current)
      stream(current, runId)
    },
    [clearTimers, commitActive, later, reduced, stream],
  )

  const runIntent = useCallback(
    (intent: Intent) => {
      void runResult(intent.example ?? intent.id, resultForIntent(intent))
    },
    [runResult],
  )

  const openExternal = useCallback(() => {
    if (result?.action.kind !== 'external') return
    window.open(result.action.url, '_blank', 'noopener,noreferrer')
    close()
  }, [close, result])

  /* ----------------------------------------------------------------- keyboard */

  const liveSuggestions = useMemo(
    () => (phase === 'idle' && input.trim() ? suggestIntents(input, 5) : []),
    [input, phase],
  )

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (phase === 'confirm') {
        setPhase('idle')
        return
      }
      close()
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (phase === 'confirm') {
        openExternal()
        return
      }
      if (phase === 'thinking' || phase === 'streaming' || phase === 'countdown') return
      if (selected >= 0 && liveSuggestions[selected]) {
        runIntent(liveSuggestions[selected])
        return
      }
      if (input.trim()) void runResult(input.trim())
      return
    }

    if (e.key === 'ArrowDown') {
      if (!liveSuggestions.length) return
      e.preventDefault()
      setSelected((s) => (s + 1) % liveSuggestions.length)
      return
    }

    if (e.key === 'ArrowUp') {
      if (liveSuggestions.length) {
        e.preventDefault()
        setSelected((s) => (s <= 0 ? liveSuggestions.length - 1 : s - 1))
        return
      }
      // No suggestions on screen — walk the saved prompt history instead.
      if (!historyRef.current.length) return
      e.preventDefault()
      const next = Math.min(historyPosRef.current + 1, historyRef.current.length - 1)
      historyPosRef.current = next
      setInput(historyRef.current[next])
    }
  }

  // Focus trap — the panel holds the input plus a handful of buttons.
  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, input, a[href], [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  /* -------------------------------------------------------------- local model */

  const enableLocalAI = async () => {
    setDownloading(true)
    setEnabled(true)
    const session = await startSession()
    setDownloading(false)
    if (!session) {
      setEnabled(false)
      setLocalOn(false)
      setAvailability('unavailable')
      return
    }
    setAvailability('available')
    setLocalOn(true)
  }

  const disableLocalAI = () => {
    setEnabled(false)
    setLocalOn(false)
  }

  /* ------------------------------------------------------------------ render */

  const showChips = phase === 'idle' && !liveSuggestions.length && (!activePrompt || result?.action.kind === 'unknown')
  const busy = phase === 'thinking' || phase === 'streaming'

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="command-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0A]/80 backdrop-blur-md flex justify-center px-4 pt-[18vh] md:pt-[22vh]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Command prompt"
              onKeyDown={onPanelKeyDown}
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
              className="w-full max-w-2xl h-fit max-h-[70vh] flex flex-col bg-[#161616] border border-[#00D2BE]/30 corner-box carbon-weave shadow-2xl"
            >
              <div className="h-0.5 bg-[#00D2BE]" />

              {/* Transcript */}
              {(transcript.length > 0 || activePrompt) && (
                <div className="flex-1 overflow-y-auto px-5 pt-4 space-y-4 min-h-0">
                  {transcript.map((entry) => (
                    <div key={entry.id} className="space-y-1">
                      <div className="font-mono text-xs text-[#666]">
                        <span className="text-[#00D2BE]/60">&gt;</span> {entry.prompt}
                      </div>
                      <p className="text-[#888888] text-sm leading-relaxed">{entry.reply}</p>
                    </div>
                  ))}

                  {activePrompt && (
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-[#888]">
                        <span className="text-[#00D2BE]">&gt;</span> {activePrompt}
                      </div>

                      {phase === 'thinking' ? (
                        <div className="h-px w-full bg-white/8 overflow-hidden">
                          <div className="h-px w-1/3 bg-[#00D2BE] telemetry-scan" />
                        </div>
                      ) : (
                        <p className="text-[#F0F0F0] text-sm leading-relaxed" aria-live="polite">
                          {revealed}
                          {phase === 'streaming' && <span className="caret-blink text-[#00D2BE]">▍</span>}
                        </p>
                      )}

                      {result && phase !== 'thinking' && (
                        <div className="font-display text-[10px] tracking-[0.3em] uppercase text-[#555] pt-1">
                          {result.source === 'llm' ? 'On-device model' : 'Rules engine'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Prompt row */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-white/8">
                <span className="font-mono text-[#00D2BE] text-sm select-none">&gt;</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setSelected(-1)
                  }}
                  onKeyDown={onInputKeyDown}
                  disabled={phase === 'countdown'}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Ask or navigate"
                  placeholder={
                    phase === 'confirm'
                      ? 'Enter to open · Esc to cancel'
                      : `Try "${exampleSuggestions[placeholderIndex]}"`
                  }
                  className="flex-1 bg-transparent outline-none text-[#F0F0F0] text-sm placeholder:text-[#555] font-mono"
                />
                {busy && <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[#00D2BE]">···</span>}
                {phase === 'countdown' && (
                  <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[#00D2BE]">GO</span>
                )}
              </div>

              {/* Suggestions while typing */}
              {liveSuggestions.length > 0 && (
                <ul className="border-t border-white/8 max-h-52 overflow-y-auto">
                  {liveSuggestions.map((intent, i) => (
                    <li key={intent.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setSelected(i)}
                        onClick={() => runIntent(intent)}
                        className={`w-full text-left px-5 py-2 font-mono text-xs transition-colors ${
                          selected === i ? 'bg-[#00D2BE]/10 text-[#00D2BE]' : 'text-[#888] hover:text-[#F0F0F0]'
                        }`}
                      >
                        {intent.example}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Did you mean */}
              {phase !== 'thinking' && result && result.alternates.length > 0 && (
                <div className="border-t border-white/8 px-5 py-3 flex flex-wrap items-center gap-2">
                  <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[#555]">Did you mean</span>
                  {result.alternates.map((intent) => (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => runIntent(intent)}
                      className="px-3 py-1 font-mono text-xs text-[#00D2BE] border border-[#00D2BE]/30 hover:bg-[#00D2BE]/10 transition-colors"
                    >
                      {intent.example ?? intent.id}
                    </button>
                  ))}
                </div>
              )}

              {/* External confirm — nothing opens without this */}
              {phase === 'confirm' && result?.action.kind === 'external' && (
                <div className="border-t border-white/8 px-5 py-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-[#888] truncate">{result.action.label} ↗</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={openExternal}
                      className="px-3 py-1 font-display font-bold text-[10px] tracking-[0.2em] uppercase bg-[#00D2BE] text-[#0A0A0A]"
                    >
                      Enter to open
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase('idle')}
                      className="px-3 py-1 font-display font-bold text-[10px] tracking-[0.2em] uppercase border border-white/15 text-[#888]"
                    >
                      Esc
                    </button>
                  </div>
                </div>
              )}

              {/* Example chips */}
              {showChips && (
                <div className="border-t border-white/8 px-5 py-3 flex flex-wrap gap-2">
                  {exampleSuggestions.slice(0, 4).map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => void runResult(text)}
                      className="px-3 py-1 font-mono text-xs text-[#888] border border-white/12 hover:border-[#00D2BE]/40 hover:text-[#00D2BE] transition-colors"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-white/8 px-5 py-2.5 flex items-center justify-between gap-3">
                <span className="font-display text-[10px] tracking-[0.25em] uppercase text-[#555]">
                  ↑↓ select · Enter run · Esc close
                </span>
                {isSupported() && availability !== 'unavailable' && (
                  <button
                    type="button"
                    onClick={() => (localOn ? disableLocalAI() : void enableLocalAI())}
                    disabled={downloading}
                    className={`font-display text-[10px] tracking-[0.25em] uppercase transition-colors ${
                      localOn ? 'text-[#00D2BE]' : 'text-[#666] hover:text-[#F0F0F0]'
                    }`}
                  >
                    {downloading
                      ? 'Downloading model…'
                      : localOn
                      ? 'On-device AI · on'
                      : availability === 'available'
                      ? 'Enable on-device AI'
                      : 'Enable on-device AI (downloads)'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {effect && <CommandEffect effect={effect} reduced={reduced} onDone={() => setEffect(null)} />}
      </AnimatePresence>
    </>
  )
}

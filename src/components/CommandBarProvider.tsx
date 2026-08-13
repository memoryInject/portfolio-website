import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

interface CommandBarContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const CommandBarContext = createContext<CommandBarContextValue | null>(null)

export function useCommandBar(): CommandBarContextValue {
  const ctx = useContext(CommandBarContext)
  if (!ctx) throw new Error('useCommandBar must be used inside <CommandBarProvider>')
  return ctx
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable
}

export function CommandBarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const open = useCallback(() => {
    setIsOpen((wasOpen) => {
      if (!wasOpen) restoreFocusRef.current = document.activeElement as HTMLElement | null
      return true
    })
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    const target = restoreFocusRef.current
    restoreFocusRef.current = null
    if (target && document.contains(target)) target.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const cmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)
      if (!cmdK && !slash) return
      e.preventDefault()
      if (cmdK && isOpen) close()
      else open()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, open, close])

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])

  return <CommandBarContext.Provider value={value}>{children}</CommandBarContext.Provider>
}

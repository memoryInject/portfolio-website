import { useEffect } from 'react'
import { motion } from 'framer-motion'

export type EffectName = 'drs' | 'boxbox' | 'lights' | 'radio'

const DURATIONS: Record<EffectName, number> = { drs: 1100, boxbox: 1600, lights: 2800, radio: 2400 }

/** Transient full-screen F1 easter eggs. Auto-dismiss, skipped under reduced motion. */
export default function CommandEffect({
  effect,
  reduced,
  onDone,
}: {
  effect: EffectName
  reduced: boolean
  onDone: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, reduced ? 600 : DURATIONS[effect])
    return () => clearTimeout(timer)
  }, [effect, reduced, onDone])

  if (reduced) return null

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden" aria-hidden="true">
      {effect === 'drs' && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#00D2BE]/30 to-transparent"
        />
      )}

      {effect === 'boxbox' && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, times: [0, 0.15, 0.8, 1] }}
          className="absolute top-0 left-0 right-0 h-14 flex items-center justify-center bg-[#0A0A0A] border-b-2 border-[#00D2BE]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(0,210,190,0.16) 0 14px, transparent 14px 28px)',
          }}
        >
          <span className="font-display font-bold text-lg tracking-[0.4em] text-[#00D2BE] uppercase">
            Box Box Box
          </span>
        </motion.div>
      )}

      {effect === 'lights' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ backgroundColor: '#1A1A1A', scale: 0.9 }}
                animate={{
                  backgroundColor: ['#1A1A1A', '#E10600', '#E10600', '#1A1A1A'],
                  scale: [0.9, 1, 1, 0.9],
                }}
                transition={{ duration: 2.6, times: [0, 0.12 + i * 0.1, 0.82, 0.86], ease: 'easeOut' }}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/15"
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.35, 0] }}
            transition={{ duration: 2.6, times: [0, 0.84, 0.9, 1] }}
            className="absolute inset-0 bg-[#00D2BE]"
          />
        </div>
      )}

      {effect === 'radio' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: 0 }}
          transition={{ duration: 2.3, times: [0, 0.12, 0.82, 1] }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#0A0A0A]/95 border border-[#00D2BE]/40 corner-box"
        >
          <div className="font-mono text-xs tracking-[0.2em] text-[#00D2BE] uppercase">
            ▮▯▮▯▯ Radio check — loud and clear
          </div>
        </motion.div>
      )}
    </div>
  )
}

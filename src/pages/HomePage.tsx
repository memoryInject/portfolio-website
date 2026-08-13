import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { tags } from '../data/skills'
import { profile } from '../data/profile'
import { useCommandBar } from '../components/CommandBarProvider'

/** Touch devices have no keyboard shortcut to advertise, so the hint becomes a tap target. */
function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    setCoarse(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return coarse
}

export default function HomePage() {
  const { open } = useCommandBar()
  const coarse = useCoarsePointer()

  return (
    <div className="flex-1 flex flex-col justify-center carbon-fiber relative overflow-hidden">

      {/* F1 / AMG carbon side panel — left */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute left-0 top-0 bottom-0 w-44 md:w-52 pointer-events-none select-none hidden md:block carbon-weave"
        style={{ background: 'linear-gradient(180deg, #141414 0%, #0F0F0F 100%)' }}
      >
        {/* Vertical teal accent stripe — Petronas signature */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00D2BE]/0 via-[#00D2BE] to-[#00D2BE]/0" />

        {/* Right edge silver hairline */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C0C0C0]/30 to-transparent" />

        {/* Brake disc + caliper — theme colors */}
        <svg
          viewBox="0 0 100 100"
          className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-16"
        >
          {/* Spinning disc group — rotates around centre (50,50) */}
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: 1080 }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: '50px 50px', transformBox: 'view-box' }}
          >
            {/* Disc outer edge — animates hot → silver */}
            <motion.circle
              cx="50" cy="50" r="38"
              fill="none"
              initial={{ stroke: '#FFB347' }}
              animate={{ stroke: '#C0C0C0' }}
              transition={{ duration: 9, ease: [0.16, 1, 0.3, 1] }}
              strokeOpacity="0.7"
              strokeWidth="1.3"
            />
            {/* Inner disc edge — animates hot → silver */}
            <motion.circle
              cx="50" cy="50" r="34"
              fill="none"
              initial={{ stroke: '#FF6A1A' }}
              animate={{ stroke: '#C0C0C0' }}
              transition={{ duration: 9, ease: [0.16, 1, 0.3, 1] }}
              strokeOpacity="0.35"
              strokeWidth="0.7"
            />

            {/* Drilled cooling holes — 12 around disc face */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180
              const cx = 50 + 26 * Math.cos(a)
              const cy = 50 + 26 * Math.sin(a)
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="1.8"
                  fill="#0c0c0c"
                  stroke="#00D2BE"
                  strokeOpacity="0.8"
                  strokeWidth="0.6"
                />
              )
            })}

            {/* Hub ring */}
            <circle cx="50" cy="50" r="11" fill="none" stroke="#C0C0C0" strokeOpacity="0.65" strokeWidth="1.2" />
            {/* Hub mounting bolts — 5 */}
            {Array.from({ length: 5 }).map((_, i) => {
              const a = (i * 72 * Math.PI) / 180 - Math.PI / 2
              const cx = 50 + 8 * Math.cos(a)
              const cy = 50 + 8 * Math.sin(a)
              return <circle key={i} cx={cx} cy={cy} r="1.1" fill="#C0C0C0" fillOpacity="0.7" />
            })}
            {/* Centre spindle */}
            <circle cx="50" cy="50" r="2.2" fill="#00D2BE" />
          </motion.g>

          {/* Brembo monobloc caliper — 9 o'clock, static teal */}
          <path
            d="M 20,42
               L 20,58
               A 1.5 1.5 0 0 1 18.5,59.5
               L 18.5,63
               L 12,63
               L 12,59.5
               A 2 2 0 0 1 10,57.5
               L 10,42.5
               A 2 2 0 0 1 12,40.5
               L 12,37
               L 18.5,37
               L 18.5,40.5
               A 1.5 1.5 0 0 1 20,42 Z"
            fill="#00D2BE"
            fillOpacity="0.22"
            stroke="#00D2BE"
            strokeOpacity="0.95"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* 4 brake pots — 2x2 */}
          {[
            [16.5, 45], [13, 45],
            [16.5, 55], [13, 55],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="0.9"
              fill="#0c0c0c"
              stroke="#00D2BE"
              strokeOpacity="0.9"
              strokeWidth="0.4"
            />
          ))}

          {/* Mounting tab bolts — silver, static */}
          <circle cx="16.5" cy="38.7" r="0.7" fill="#C0C0C0" fillOpacity="0.8" />
          <circle cx="13.5" cy="38.7" r="0.7" fill="#C0C0C0" fillOpacity="0.8" />
          <circle cx="16.5" cy="61.3" r="0.7" fill="#C0C0C0" fillOpacity="0.8" />
          <circle cx="13.5" cy="61.3" r="0.7" fill="#C0C0C0" fillOpacity="0.8" />
          {/* Central bridge line */}
          <line x1="19" y1="50" x2="10.5" y2="50" stroke="#C0C0C0" strokeOpacity="0.4" strokeWidth="0.5" />
        </svg>

        {/* Vertical brand text — centred */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display font-bold text-[#00D2BE] text-[10px] tracking-[0.55em] uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Memory · Inject
          </span>
        </div>

        {/* Bottom telemetry strip */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="font-display font-bold text-[9px] tracking-[0.4em] text-[#C0C0C0]/60 uppercase">W15</div>
          <div className="w-8 h-px bg-[#00D2BE]/50" />
          <div className="font-display font-bold text-[8px] tracking-[0.3em] text-[#666] uppercase">PU 106</div>
        </div>

        {/* Corner ticks */}
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#00D2BE]/40" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#00D2BE]/40" />
      </motion.div>

      {/* Right-side speed lines */}
      <div className="absolute right-32 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00D2BE]/20 to-transparent pointer-events-none hidden md:block" />
      <div className="absolute right-52 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C0C0C0]/15 to-transparent pointer-events-none hidden md:block" />

      {/* Content */}
      <div className="w-full pl-12 pr-12 md:pl-64 md:pr-20 lg:pl-72 lg:pr-28 py-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.55 } } }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-8 h-px bg-[#00D2BE]" />
            <span className="font-display font-semibold text-xs tracking-[0.35em] text-[#00D2BE] uppercase">
              {profile.role}
            </span>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.75 } } }}
            className="font-display font-bold leading-[0.9] tracking-tight mb-10"
          >
            {profile.headline.map((line, i) => (
              <span
                key={line}
                className={`block text-[clamp(2.8rem,8vw,7.5rem)] ${i === 1 ? 'text-[#00D2BE]' : 'text-[#F0F0F0]'}`}
              >
                {line}
              </span>
            ))}
          </motion.h1>

          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="w-14 h-0.5 bg-[#00D2BE]" />
            <div className="w-5 h-0.5 bg-[#C0C0C0]" />
            <div className="w-2 h-0.5 bg-white/12" />
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {tags.map((tag) => (
              <span
                key={tag.label}
                className={`px-3 py-1 font-display font-semibold text-xs tracking-[0.15em] uppercase border ${
                  tag.group === 'ai'
                    ? 'text-[#00D2BE] border-[#00D2BE]/40 bg-[#00D2BE]/8'
                    : tag.group === 'web'
                    ? 'text-[#C0C0C0] border-[#C0C0C0]/30 bg-[#C0C0C0]/6'
                    : 'text-[#888] border-white/15 bg-white/4'
                }`}
              >
                {tag.label}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
            className="flex items-center gap-4 flex-wrap"
          >
            <Link
              to="/work"
              className="font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3 bg-[#00D2BE] text-[#0A0A0A] hover:bg-[#00b8a6] transition-colors duration-200"
            >
              View Work
            </Link>
            <Link
              to="/contact"
              className="font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3 border-2 border-[#F0F0F0] text-[#F0F0F0] hover:bg-[#F0F0F0] hover:text-[#0A0A0A] transition-colors duration-200"
            >
              Contact
            </Link>
          </motion.div>

          {/* Command bar hint — W15 telemetry strip */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35 } },
            }}
            className="mt-8"
          >
            <button
              type="button"
              onClick={open}
              className="group inline-flex items-center gap-3 pl-3 pr-4 py-2 border border-[#00D2BE]/20 bg-[#00D2BE]/4 hint-pulse hover:bg-[#00D2BE]/10 transition-colors duration-200"
            >
              <span className="w-6 h-px bg-[#00D2BE]" />
              <span className="font-display font-semibold text-[10px] md:text-[11px] tracking-[0.28em] uppercase text-[#888888] group-hover:text-[#F0F0F0] transition-colors">
                {coarse ? (
                  'Tap to run a prompt'
                ) : (
                  <>
                    Press <span className="text-[#00D2BE]">[ / ]</span> to run a prompt
                  </>
                )}
              </span>
              <span className="caret-blink font-mono text-[#00D2BE] text-xs leading-none">▍</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

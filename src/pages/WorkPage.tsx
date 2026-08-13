import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import { socialById } from '../data/profile'

const colorValues: Record<string, string> = {
  teal: '#00D2BE',
  silver: '#C0C0C0',
  mute: '#888888',
}

function ProjectIllustration({ id, color }: { id: string; color: string }) {
  if (id === 'nutri-strat') {
    return (
      <svg viewBox="0 0 480 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="480" height="220" fill="#101010" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 53} y1="0" x2={i * 53} y2="220" stroke={color} strokeOpacity="0.08" strokeWidth="1" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 55} x2="480" y2={i * 55} stroke={color} strokeOpacity="0.08" strokeWidth="1" />
        ))}
        {[30, 145, 260, 375].map((x, i) => (
          <g key={x}>
            <rect x={x} y="20" width="95" height="130" rx="1" fill="#1A1A1A" stroke={color} strokeOpacity={0.55 - i * 0.1} strokeWidth="1.5" />
            <rect x={x + 8} y="28" width="79" height="58" fill={color} fillOpacity={0.16 - i * 0.02} />
            <rect x={x + 8} y="96" width="55" height="7" rx="1" fill={color} fillOpacity="0.25" />
            <rect x={x + 8} y="110" width="38" height="5" rx="1" fill={color} fillOpacity="0.15" />
            <rect x={x + 8} y="122" width="45" height="16" rx="1" fill={color} fillOpacity={0.5 - i * 0.08} />
          </g>
        ))}
        <polyline points="0,0 16,0 16,3 3,3 3,16 0,16" fill={color} fillOpacity="0.6" />
        <text x="16" y="212" fill={color} fillOpacity="0.5" fontSize="8" fontFamily="monospace" letterSpacing="3">ECOMMERCE // NODE · EXPRESS · MONGODB · REACT</text>
      </svg>
    )
  }

  if (id === 'media-review') {
    return (
      <svg viewBox="0 0 480 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="480" height="220" fill="#101010" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 53} y1="0" x2={i * 53} y2="220" stroke={color} strokeOpacity="0.08" strokeWidth="1" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 55} x2="480" y2={i * 55} stroke={color} strokeOpacity="0.08" strokeWidth="1" />
        ))}
        <rect x="25" y="15" width="290" height="180" rx="1" fill="#1A1A1A" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />
        <rect x="33" y="23" width="274" height="148" fill={color} fillOpacity="0.1" />
        <polygon points="155,97 192,75 192,119" fill={color} fillOpacity="0.65" />
        <rect x="33" y="162" width="274" height="3" rx="1" fill={color} fillOpacity="0.15" />
        <rect x="33" y="162" width="148" height="3" rx="1" fill={color} fillOpacity="0.7" />
        <circle cx="181" cy="163" r="5" fill={color} fillOpacity="0.85" />
        {[90, 148, 218].map((x) => (
          <line key={x} x1={x} y1="157" x2={x} y2="170" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" />
        ))}
        <rect x="330" y="15" width="130" height="180" rx="1" fill="#1A1A1A" stroke={color} strokeOpacity="0.28" strokeWidth="1" />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x="342" y={28 + i * 24} width={58 + (i % 3) * 18} height="13" rx="1" fill={color} fillOpacity={0.1 + (i % 2) * 0.05} />
        ))}
        <polyline points="0,0 16,0 16,3 3,3 3,16 0,16" fill={color} fillOpacity="0.6" />
        <text x="16" y="212" fill={color} fillOpacity="0.5" fontSize="8" fontFamily="monospace" letterSpacing="3">PWA // DJANGO · REDIS · POSTGRES · REACT</text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 480 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="480" height="220" fill="#101010" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 53} y1="0" x2={i * 53} y2="220" stroke={color} strokeOpacity="0.08" strokeWidth="1" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 55} x2="480" y2={i * 55} stroke={color} strokeOpacity="0.08" strokeWidth="1" />
      ))}
      <rect x="25" y="15" width="430" height="185" rx="1" fill="#1A1A1A" stroke={color} strokeOpacity="0.4" strokeWidth="1.5" />
      <rect x="25" y="15" width="430" height="28" fill={color} fillOpacity="0.12" />
      {[44, 60, 76].map((x, i) => (
        <circle key={x} cx={x} cy="29" r="5.5" fill={color} fillOpacity={0.55 - i * 0.12} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={38 + (i % 2) * 16} y={58 + i * 17} width={85 + ((i * 53) % 150)} height="9" rx="1" fill={color} fillOpacity={0.1 + (i % 3) * 0.05} />
      ))}
      <rect x="315" y="53" width="118" height="130" rx="1" fill={color} fillOpacity="0.06" stroke={color} strokeOpacity="0.18" strokeWidth="1" />
      {['✓ UNIT TESTS', '✓ INTEGRATION', '✓ E2E CYPRESS', '✓ CI/CD'].map((t, i) => (
        <text key={t} x="327" y={76 + i * 22} fill={color} fillOpacity={0.65 - i * 0.06} fontSize="9" fontFamily="monospace">{t}</text>
      ))}
      <polyline points="0,0 16,0 16,3 3,3 3,16 0,16" fill={color} fillOpacity="0.6" />
      <text x="16" y="212" fill={color} fillOpacity="0.5" fontSize="8" fontFamily="monospace" letterSpacing="3">BLOG // NODE · EXPRESS · POSTGRES · CYPRESS</text>
    </svg>
  )
}

export default function WorkPage() {
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('p')
  const target = projects.some((p) => p.id === requested) ? requested : null
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

  // Deep link from the command bar: "show me the ecommerce project" → /work?p=nutri-strat
  useEffect(() => {
    if (!target) return
    const card = cardRefs.current[target]
    if (!card) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
    setHighlighted(target)
    const timer = window.setTimeout(() => setHighlighted(null), 1300)
    return () => window.clearTimeout(timer)
  }, [target])

  return (
    <div className="flex-1 flex flex-col carbon-fiber">
      <div className="w-full px-12 md:px-20 lg:px-28 pt-14 pb-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#00D2BE]" />
            <span className="font-display font-semibold text-xs tracking-[0.35em] text-[#00D2BE] uppercase">Work</span>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl text-[#F0F0F0] mb-2">SELECTED PROJECTS</h1>
          <p className="text-[#888888] text-sm">
            More on{' '}
            <a href={socialById.github.url} target="_blank" rel="noopener noreferrer" className="text-[#00D2BE] hover:underline">
              {socialById.github.label}
            </a>
          </p>
        </motion.div>

        <div className="space-y-6 max-w-5xl">
          {projects.map((project, i) => {
            const c = colorValues[project.color]
            return (
              <motion.article
                key={project.id}
                ref={(el: HTMLElement | null) => {
                  cardRefs.current[project.id] = el
                }}
                id={`project-${project.id}`}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: i * 0.1 }}
                className={`group relative bg-[#161616] border border-white/10 overflow-hidden corner-box carbon-weave scroll-mt-24 ${
                  highlighted === project.id ? 'deep-link-pulse' : ''
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: c }} />

                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2 h-52 md:h-auto overflow-hidden border-r border-white/8">
                    <ProjectIllustration id={project.id} color={c} />
                  </div>

                  <div className="md:col-span-3 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-0.5" style={{ background: c }} />
                        <h2 className="font-display font-bold text-2xl text-[#F0F0F0]">{project.title}</h2>
                      </div>
                      <p className="text-[#AAAAAA] text-[15px] leading-relaxed mb-6">{project.description}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 font-display font-semibold text-xs tracking-wider uppercase border"
                            style={{ color: c, borderColor: `${c}38`, background: `${c}10` }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-start font-display font-bold text-xs tracking-[0.2em] uppercase px-6 py-2.5 border transition-colors duration-200"
                      style={{ borderColor: `${c}55`, color: c }}
                      onMouseEnter={e => { e.currentTarget.style.background = c; e.currentTarget.style.color = '#0A0A0A' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c }}
                    >
                      View on GitHub →
                    </a>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

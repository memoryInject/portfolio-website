import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { profile, socialById, stats } from '../data/profile'

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col carbon-fiber">
      <div className="w-full px-12 md:px-20 lg:px-28 pt-14 pb-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3 mb-14"
        >
          <div className="w-8 h-px bg-[#C0C0C0]" />
          <span className="font-display font-semibold text-xs tracking-[0.35em] text-[#C0C0C0] uppercase">About</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start max-w-4xl">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-64 h-64 mb-10 corner-box border border-white/12 bg-[#141414] carbon-weave">
              <svg viewBox="0 0 256 256" className="w-full h-full">
                <rect width="256" height="256" fill="#141414" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 64} y1="0" x2={i * 64} y2="256" stroke="#00D2BE" strokeOpacity="0.08" strokeWidth="1" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 64} x2="256" y2={i * 64} stroke="#00D2BE" strokeOpacity="0.08" strokeWidth="1" />
                ))}
                <circle cx="128" cy="95" r="42" fill="none" stroke="#00D2BE" strokeWidth="1.5" strokeOpacity="0.5" />
                <ellipse cx="128" cy="210" rx="65" ry="42" fill="none" stroke="#00D2BE" strokeWidth="1.5" strokeOpacity="0.25" />
                <line x1="86" y1="53" x2="170" y2="137" stroke="#C0C0C0" strokeOpacity="0.25" strokeWidth="1" />
                <line x1="170" y1="53" x2="86" y2="137" stroke="#C0C0C0" strokeOpacity="0.25" strokeWidth="1" />
                <text x="128" y="248" textAnchor="middle" fill="#00D2BE" fillOpacity="0.4" fontSize="8" fontFamily="monospace" letterSpacing="4">MAHESH MS</text>
              </svg>
            </div>

            <div className="flex gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display font-bold text-3xl text-[#00D2BE] leading-none">{s.value}</div>
                  <div className="text-[11px] text-[#888] mt-1 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight mb-6 text-[#F0F0F0]">
              HI, I'M{' '}
              <span className="text-[#00D2BE]">MAHESH.</span>
            </h1>

            <div className="w-12 h-0.5 bg-[#00D2BE] mb-6" />

            <div className="space-y-4 text-[#AAAAAA] leading-relaxed mb-8 text-[15px]">
              {profile.bio.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={socialById.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-bold text-xs tracking-[0.2em] uppercase px-6 py-2.5 border border-[#C0C0C0]/40 text-[#C0C0C0] hover:bg-[#C0C0C0]/10 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={socialById.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-bold text-xs tracking-[0.2em] uppercase px-6 py-2.5 border border-white/20 text-[#AAAAAA] hover:bg-white/5 transition-colors"
              >
                GitHub
              </a>
              <Link
                to="/skills"
                className="font-display font-bold text-xs tracking-[0.2em] uppercase px-6 py-2.5 border border-[#00D2BE]/50 text-[#00D2BE] hover:bg-[#00D2BE]/10 transition-colors"
              >
                View Skills →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

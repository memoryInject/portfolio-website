import { motion } from 'framer-motion'
import { profile, socialById } from '../data/profile'

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col justify-center carbon-fiber">
      <div className="w-full px-12 md:px-20 lg:px-28 py-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl"
        >
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-8 h-px bg-[#00D2BE]" />
            <span className="font-display font-semibold text-xs tracking-[0.35em] text-[#00D2BE] uppercase">Contact</span>
            <div className="w-8 h-px bg-[#00D2BE]" />
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl text-[#F0F0F0] leading-tight mb-2">
            LET'S BUILD
          </h1>
          <h1 className="font-display font-bold text-5xl md:text-7xl text-[#00D2BE] leading-tight mb-10">
            SOMETHING.
          </h1>

          <p className="text-[#AAAAAA] leading-relaxed mb-10 text-[15px]">
            {profile.availability}
          </p>

          <a
            href={socialById.email.url}
            className="inline-block font-display font-bold text-base tracking-[0.2em] uppercase px-10 py-4 bg-[#00D2BE] text-[#0A0A0A] hover:bg-[#00b8a6] transition-colors duration-200 mb-10"
          >
            {profile.email}
          </a>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-display text-xs tracking-[0.3em] text-[#666666] uppercase whitespace-nowrap">or find me on</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex justify-center gap-4">
            <a
              href={socialById.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-bold text-xs tracking-[0.2em] uppercase px-7 py-3 border border-[#C0C0C0]/40 text-[#C0C0C0] hover:bg-[#C0C0C0]/10 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={socialById.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-bold text-xs tracking-[0.2em] uppercase px-7 py-3 border border-white/20 text-[#AAAAAA] hover:bg-white/5 transition-colors"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCommandBar } from './CommandBarProvider'

const links = [
  { label: 'About', to: '/about' },
  { label: 'Skills', to: '/skills' },
  { label: 'Work', to: '/work' },
  { label: 'Contact', to: '/contact' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { open } = useCommandBar()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/8">
      <div className="w-full px-12 md:px-20 lg:px-28 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-bold text-sm tracking-[0.25em] text-[#F0F0F0] hover:text-[#00D2BE] transition-colors duration-200 uppercase"
        >
          Memory<span className="text-[#00D2BE]">.</span>Inject
        </Link>

        <div className="flex items-center gap-6 md:gap-8">
        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-10">
          {links.map(({ label, to }) => {
            const active = location.pathname === to
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`font-display font-semibold text-xs tracking-[0.25em] uppercase transition-all duration-200 pb-0.5 ${
                    active
                      ? 'text-[#00D2BE] border-b border-[#00D2BE]'
                      : 'text-[#888888] border-b border-transparent hover:text-[#F0F0F0]'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Command bar trigger — same overlay the ⌘K / "/" shortcuts open */}
        <button
          type="button"
          onClick={open}
          aria-label="Open command prompt"
          className="flex items-center gap-1.5 px-2.5 py-1 border border-white/12 text-[#888888] hover:text-[#00D2BE] hover:border-[#00D2BE]/40 transition-colors duration-200"
        >
          <span className="font-mono text-[11px] leading-none text-[#00D2BE]">&gt;</span>
          <span className="font-display font-semibold text-[10px] tracking-[0.2em] uppercase leading-none">
            <span className="hidden md:inline">⌘K</span>
            <span className="md:hidden">Ask</span>
          </span>
        </button>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px bg-[#F0F0F0] transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-px bg-[#F0F0F0] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-[#F0F0F0] transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0A0A0A] border-t border-white/8 overflow-hidden"
          >
            <ul className="flex flex-col py-2">
              {links.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-12 py-3 font-display font-semibold text-xs tracking-[0.25em] uppercase text-[#888888] hover:text-[#00D2BE] hover:bg-[#00D2BE]/5 transition-all"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

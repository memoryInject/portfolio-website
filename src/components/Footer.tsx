export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/8 py-6 bg-[#0A0A0A]">
      <div className="w-full px-12 md:px-20 lg:px-28 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="font-display font-bold text-xs tracking-[0.25em] text-[#666666] uppercase">
          Memory<span className="text-[#00D2BE]/70">.</span>Inject
        </span>
        <span className="font-['Inter'] text-xs text-[#666666]">
          memoryinject.io © {currentYear}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] tracking-wider text-[#666666] uppercase">Built with</span>
          <span className="font-display font-semibold text-[10px] text-[#00D2BE] tracking-wider">React</span>
          <span className="text-[#444444] text-xs">+</span>
          <span className="font-display font-semibold text-[10px] text-[#C0C0C0] tracking-wider">Tailwind</span>
        </div>
      </div>
    </footer>
  )
}

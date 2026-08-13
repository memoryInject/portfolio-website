import { motion } from 'framer-motion'
import { groups } from '../data/skills'

export default function SkillsPage() {
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
            <span className="font-display font-semibold text-xs tracking-[0.35em] text-[#00D2BE] uppercase">Skills</span>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl text-[#F0F0F0]">TECH STACK</h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          {groups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: i * 0.12 }}
              className={`relative bg-[#161616] carbon-weave border ${group.borderColor} p-7 corner-box`}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: group.color }} />

              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-7" style={{ background: group.color }} />
                <span className="font-display font-bold text-2xl tracking-widest uppercase" style={{ color: group.color }}>
                  {group.label}
                </span>
              </div>
              <p className="text-xs text-[#777] mb-5 tracking-wide">{group.description}</p>

              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 font-display font-semibold text-xs tracking-wider uppercase border"
                    style={{
                      color: group.color,
                      borderColor: `${group.color}38`,
                      background: `${group.color}10`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

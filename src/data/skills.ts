export interface SkillGroup {
  id: string
  label: string
  color: string
  borderColor: string
  description: string
  skills: string[]
}

export const groups: SkillGroup[] = [
  {
    id: 'web',
    label: 'Web',
    color: '#C0C0C0',
    borderColor: 'border-white/12',
    description: 'Full-stack web development',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'REST APIs', 'CI/CD'],
  },
  {
    id: 'ai',
    label: 'AI',
    color: '#00D2BE',
    borderColor: 'border-[#00D2BE]/25',
    description: 'AI-powered application development',
    skills: ['LangChain', 'RAG Pipelines', 'LLMs', 'OpenAI API', 'Vector Databases', 'Prompt Engineering', 'Embeddings'],
  },
  {
    id: 'web3',
    label: 'Web3',
    color: '#888888',
    borderColor: 'border-white/10',
    description: 'Blockchain & decentralized apps',
    skills: ['Viem', 'Wagmi', 'TronWeb', 'Smart Contracts', 'Ethereum', 'Tron Network', 'Wallet Integration'],
  },
]

export const groupById = Object.fromEntries(groups.map((g) => [g.id, g])) as Record<string, SkillGroup>

export interface HomeTag {
  label: string
  group: 'web' | 'ai' | 'web3'
}

export const tags: HomeTag[] = [
  { label: 'TypeScript', group: 'web' },
  { label: 'React', group: 'web' },
  { label: 'Next.js', group: 'web' },
  { label: 'Node.js', group: 'web' },
  { label: 'LangChain', group: 'ai' },
  { label: 'RAG', group: 'ai' },
  { label: 'LLMs', group: 'ai' },
  { label: 'Viem', group: 'web3' },
  { label: 'Wagmi', group: 'web3' },
  { label: 'TronWeb', group: 'web3' },
]

/** Flat lookup: normalized skill name -> the group it belongs to. */
export const skillIndex: { skill: string; group: SkillGroup }[] = groups.flatMap((group) =>
  group.skills.map((skill) => ({ skill, group })),
)

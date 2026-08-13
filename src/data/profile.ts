export interface Stat {
  value: string
  label: string
}

export interface Social {
  id: string
  label: string
  url: string
  host: string
}

export const profile = {
  name: 'Mahesh MS',
  handle: 'memoryInject',
  brand: 'Memory.Inject',
  role: 'Full-Stack Developer',
  years: '6+',
  email: 'msmahesh@live.com',
  headline: ['BUILDING', 'AI-POWERED', 'WEB APPS'],
  bio: [
    "I build AI-powered web applications — full stack, end to end. Over 6+ years I've shipped production software across web, desktop, and cloud platforms for companies spanning multiple disciplines.",
    'Current focus: integrating LLMs into real products using LangChain and RAG pipelines, building Web3 interfaces with Viem and Wagmi, shipping fast clean TypeScript across the full stack.',
    'Naturally curious, quietly confident, and always shipping.',
  ],
  availability:
    'Open to full-time opportunities, freelance projects, and interesting collaborations — especially anything involving AI, Web3, or full-stack development.',
}

export const stats: Stat[] = [
  { value: '6+', label: 'Years building' },
  { value: 'AI', label: 'LangChain · RAG · LLMs' },
  { value: 'Web3', label: 'Viem · Wagmi · Tron' },
]

export const socials: Social[] = [
  {
    id: 'github',
    label: 'GitHub',
    url: 'https://github.com/memoryInject/',
    host: 'github.com/memoryInject',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/maxcolor/',
    host: 'linkedin.com/in/maxcolor',
  },
  {
    id: 'email',
    label: 'Email',
    url: `mailto:${profile.email}`,
    host: profile.email,
  },
]

export const socialById = Object.fromEntries(socials.map((s) => [s.id, s])) as Record<string, Social>

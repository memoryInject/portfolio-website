export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  github: string
  color: 'teal' | 'silver' | 'mute'
}

export const projects: Project[] = [
  {
    id: 'nutri-strat',
    title: 'Nutri-Strat Ecommerce',
    description: 'Full-stack ecommerce platform for a supplement store. Complete shopping cart, user auth, payment flow, and admin dashboard.',
    tech: ['Node.js', 'Express', 'MongoDB', 'React', 'Redux'],
    github: 'https://github.com/memoryInject/ecommerce-supplement-store',
    color: 'teal',
  },
  {
    id: 'media-review',
    title: 'Media Review PWA',
    description: 'Team collaboration platform for cloud-based media review. Integrates reviewers, creators, and tools for an effective review workflow.',
    tech: ['Python', 'Django', 'Redis', 'PostgreSQL', 'React'],
    github: 'https://github.com/memoryInject/media-review-app',
    color: 'silver',
  },
  {
    id: 'blog-snippet',
    title: 'Blog Snippet',
    description: 'Full-stack blog application built to master testing strategy — unit, integration, and end-to-end — with a complete CI/CD pipeline.',
    tech: ['Node.js', 'Express', 'PostgreSQL', 'React', 'Cypress'],
    github: 'https://github.com/memoryInject/blog_snippet_unit_ci_test',
    color: 'mute',
  },
]

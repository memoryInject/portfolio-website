import { profile, stats, socials } from '../data/profile'
import { groups, skillIndex } from '../data/skills'
import { projects } from '../data/projects'
import type { SkillGroup } from '../data/skills'
import type { Project } from '../data/projects'

const groupSkills = (id: string) => groups.find((g) => g.id === id)?.skills.join(', ') ?? ''

/**
 * Long-form replies. Every string is built from the same data the pages render,
 * so the command bar can never drift from /about, /skills or /work.
 */
export const answers = {
  who: `${profile.name} — ${profile.role}, going by ${profile.handle}. ${profile.bio[0]}`,

  experience: `${profile.years} years. ${profile.bio[0]} ${stats.map((s) => `${s.value} · ${s.label}`).join(' — ')}.`,

  ai: `AI is the current focus: ${groupSkills('ai')}. ${profile.bio[1].split('.')[0]}.`,

  web3: `Web3 work runs on ${groupSkills('web3')} — wallet integration and contract-facing UIs on Ethereum and Tron.`,

  stack: `Day to day: ${groupSkills('web')}. Plus ${groupSkills('ai')} on the AI side.`,

  availability: profile.availability,

  capabilities:
    'I can take you to any page, answer questions about experience, AI work, Web3 or the tech stack, open GitHub / LinkedIn / email, and deep-link straight to a project. Try "show me the ecommerce project" or "do you know postgres?".',

  bio: profile.bio.join(' '),
}

export function skillReply(skill: string, group: SkillGroup): string {
  return `Yes — ${skill}. Part of the ${group.label} stack: ${group.description}. Alongside it: ${group.skills
    .filter((s) => s !== skill)
    .slice(0, 4)
    .join(', ')}.`
}

export function projectReply(project: Project): string {
  return `${project.title} — ${project.description} Built with ${project.tech.join(', ')}. Pulling it up.`
}

/** Compact plaintext brief used as the on-device model's system prompt. */
export const siteSummary = [
  `${profile.name} (${profile.handle}), ${profile.role}, ${profile.years} years experience. Email ${profile.email}.`,
  profile.bio.join(' '),
  `Availability: ${profile.availability}`,
  ...groups.map((g) => `${g.label} — ${g.description}: ${g.skills.join(', ')}.`),
  ...projects.map((p) => `Project "${p.title}" (id ${p.id}): ${p.description} Tech: ${p.tech.join(', ')}.`),
  `Links: ${socials.map((s) => `${s.label} ${s.url}`).join(', ')}.`,
  `Routes: / (home), /about, /skills, /work, /contact. Project deep links use /work?p=<project id>.`,
  `Known skills: ${skillIndex.map((s) => s.skill).join(', ')}.`,
].join('\n')

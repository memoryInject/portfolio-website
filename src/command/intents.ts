import { socials } from '../data/profile'
import { skillIndex } from '../data/skills'
import { projects } from '../data/projects'
import { answers, projectReply, skillReply } from './knowledge'
import { keywordsFrom, normalize } from './text'
import type { Intent } from './types'

/** Routes. */
const routeIntents: Intent[] = [
  {
    id: 'route-home',
    keywords: ['home', 'start', 'landing', 'index', 'top', 'back'],
    phrases: ['take me home', 'go home', 'front page'],
    reply: 'Heading home.',
    action: { kind: 'navigate', to: '/' },
    example: 'take me home',
  },
  {
    id: 'route-about',
    keywords: ['about', 'bio', 'background', 'story', 'yourself', 'profile'],
    phrases: ['about page', 'about you', 'who are you', 'tell me about yourself'],
    reply: 'Opening the about page.',
    action: { kind: 'navigate', to: '/about' },
    example: 'take me to about',
  },
  {
    id: 'route-skills',
    keywords: ['skills', 'skill', 'tech', 'stack', 'technologies', 'tools', 'expertise'],
    phrases: ['skills page', 'what can you build', 'tech stack'],
    reply: 'Opening skills.',
    action: { kind: 'navigate', to: '/skills' },
    example: 'show me your skills',
  },
  {
    id: 'route-work',
    keywords: ['work', 'projects', 'project', 'portfolio', 'built', 'shipped', 'case'],
    phrases: ['your work', 'work page', 'what have you built'],
    reply: 'Opening the work page.',
    action: { kind: 'navigate', to: '/work' },
    example: 'show me your work',
  },
  {
    id: 'route-contact',
    keywords: ['contact', 'hire', 'reach', 'talk', 'message', 'touch', 'available'],
    phrases: ['get in touch', 'contact page', 'how do i reach you', 'work together'],
    reply: 'Opening contact.',
    action: { kind: 'navigate', to: '/contact' },
    example: 'how do i reach you',
  },
]

/** Questions answered in place, without navigating. */
const answerIntents: Intent[] = [
  {
    id: 'answer-experience',
    keywords: ['experience', 'years', 'long', 'senior', 'career', 'worked'],
    phrases: ['how many years', 'how long have you', 'years of experience'],
    reply: answers.experience,
    action: { kind: 'answer' },
    example: 'how many years experience',
  },
  {
    id: 'answer-ai',
    keywords: ['ai', 'llm', 'llms', 'langchain', 'rag', 'embeddings', 'openai', 'vector', 'prompt'],
    phrases: ['do you do ai', 'ai work', 'machine learning'],
    reply: answers.ai,
    action: { kind: 'answer' },
    example: 'what ai work do you do',
  },
  {
    id: 'answer-web3',
    keywords: ['web3', 'blockchain', 'crypto', 'ethereum', 'tron', 'wallet', 'contracts', 'viem', 'wagmi'],
    phrases: ['do you do web3', 'smart contracts'],
    reply: answers.web3,
    action: { kind: 'answer' },
    example: 'do you do web3',
  },
  {
    id: 'answer-stack',
    keywords: ['stack', 'languages', 'frameworks', 'typescript', 'react', 'node', 'backend', 'frontend'],
    phrases: ['what do you use', 'your stack', 'what languages'],
    reply: answers.stack,
    action: { kind: 'answer' },
    example: 'what is your stack',
  },
  {
    id: 'answer-availability',
    keywords: ['available', 'availability', 'hiring', 'freelance', 'opportunities', 'open', 'job'],
    phrases: ['are you available', 'looking for work', 'can i hire you'],
    reply: answers.availability,
    action: { kind: 'answer' },
    example: 'are you available for work',
  },
  {
    id: 'answer-who',
    keywords: ['who', 'name', 'mahesh', 'memoryinject'],
    phrases: ['who are you', 'what is your name'],
    reply: answers.who,
    action: { kind: 'answer' },
    example: 'who are you',
  },
  {
    id: 'answer-capabilities',
    keywords: ['help', 'commands', 'examples', 'usage'],
    phrases: ['what can you do', 'how does this work', 'what can i ask'],
    reply: answers.capabilities,
    action: { kind: 'answer' },
    example: 'what can you do',
  },
]

/** Outbound links — never opened without an explicit confirm. */
const socialIntents: Intent[] = socials.map((social) => ({
  id: `social-${social.id}`,
  keywords: keywordsFrom(social.label, social.host, social.id),
  phrases: [social.label.toLowerCase()],
  reply: `${social.label} — ${social.host}`,
  action: { kind: 'external', url: social.url, label: social.host },
  example: social.id === 'email' ? 'email him' : `open ${social.label.toLowerCase()}`,
}))

/** Generated from the project list — title words, tech and id all become keywords. */
const projectIntents: Intent[] = projects.map((project) => ({
  id: `project-${project.id}`,
  keywords: keywordsFrom(project.title, project.id, ...project.tech),
  // Title and id name this project specifically; its tech list is shared with the others.
  strong: keywordsFrom(project.title, project.id),
  phrases: [normalize(project.title), normalize(project.id)],
  reply: projectReply(project),
  action: { kind: 'navigate', to: '/work', highlight: project.id },
  example: `show me the ${normalize(project.title).split(' ')[0]} project`,
}))

/** Generated from the skill list, so "do you know postgres?" resolves without hand-listing. */
const skillIntents: Intent[] = skillIndex.map(({ skill, group }) => ({
  id: `skill-${normalize(skill).replace(/ /g, '-')}`,
  keywords: keywordsFrom(skill),
  phrases: [normalize(skill)],
  reply: skillReply(skill, group),
  action: { kind: 'answer' },
  example: `do you know ${normalize(skill)}`,
}))

/** F1 easter eggs. */
const effectIntents: Intent[] = [
  {
    id: 'egg-drs',
    keywords: ['drs'],
    phrases: ['drs enabled', 'drs open'],
    reply: 'DRS ENABLED — detection zone cleared.',
    action: { kind: 'effect', effect: 'drs' },
    example: 'drs',
  },
  {
    id: 'egg-boxbox',
    keywords: ['box', 'pit', 'stop'],
    phrases: ['box box', 'box this lap', 'pit stop'],
    reply: 'BOX BOX BOX — pit lane limiter on.',
    action: { kind: 'effect', effect: 'boxbox' },
    example: 'box box',
  },
  {
    id: 'egg-lights',
    keywords: ['lights', 'start', 'race'],
    phrases: ['lights out', 'lights out and away we go'],
    reply: "IT'S LIGHTS OUT AND AWAY WE GO.",
    action: { kind: 'effect', effect: 'lights' },
    example: 'lights out',
  },
  {
    id: 'egg-radio',
    keywords: ['radio', 'check', 'copy'],
    phrases: ['radio check', 'do you copy'],
    reply: 'Radio check — loud and clear. Box for suggestions any time.',
    action: { kind: 'effect', effect: 'radio' },
    example: 'radio check',
  },
]

export const intents: Intent[] = [
  ...routeIntents,
  ...answerIntents,
  ...socialIntents,
  ...projectIntents,
  ...skillIntents,
  ...effectIntents,
]

export const intentById = Object.fromEntries(intents.map((i) => [i.id, i])) as Record<string, Intent>

/** Chips shown on an empty prompt / after an unknown. */
export const suggestions: string[] = [
  'take me to about',
  'show me the ecommerce project',
  'what ai work do you do',
  'how many years experience',
  'open github',
  'lights out',
]

/** Every route the router is willing to send a visitor to. Used to validate LLM output. */
export const knownRoutes = ['/', '/about', '/skills', '/work', '/contact']

export const knownExternalUrls = socials.map((s) => s.url)

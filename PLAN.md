# Spotlight Command Bar — "fake LLM" prompt interface

## Context

The portfolio (Vite + React 19 + Tailwind 4 + framer-motion, AMG/Petronas F1 theme) is visually strong but interactively conventional — five routes, nav links, buttons. The goal is one memorable, unique interaction: a macOS-Spotlight-style prompt bar that a visitor summons with a keystroke, types natural language into ("take me to about", "what do you know about react?", "show me the ecommerce project"), and which then *actually executes* — navigating, opening links, or answering.

It must genuinely work without a hosted LLM and without an API key. So the guaranteed engine is a deterministic local intent router built over the site's own data. Chrome's built-in Prompt API (`LanguageModel`, on by default in Chrome 148 desktop since May 2026) is layered on top as strictly optional progressive enhancement — it needs ~22GB free disk, 4GB VRAM, a multi-GB one-time model download, and doesn't exist in Firefox/Safari/mobile, so it can never be the base path.

Intended outcome: every visitor on every browser gets a fully functional, live-feeling prompt bar; visitors on capable Chrome desktop can opt in to a real on-device model for freeform questions.

## Decisions locked

- **Trigger**: `⌘K` / `Ctrl+K` and `/`, both global. Not Space (scroll collision).
- **Scope**: global overlay mounted in `App.tsx`; large animated hint on home, small hint in nav elsewhere.
- **Brain**: deterministic rules always; Chrome Prompt API as opt-in enhancement with silent fallback.
- **Commands**: navigate, answer-about-me, external links, project deep-links, F1 easter eggs.

---

## Step 1 — Lift page content into shared data

The command bar's answers must not drift from what the pages render, so both read one source.

- **New `src/data/profile.ts`** — name, role, years, the three About paragraphs (moved from `AboutPage.tsx:72-80`), the `stats` array (`AboutPage.tsx:4-8`), and a `socials` record for GitHub / LinkedIn / `mailto:msmahesh@live.com` (currently hardcoded across `AboutPage.tsx`, `ContactPage.tsx`, `WorkPage.tsx:110`).
- **New `src/data/skills.ts`** — the `groups` array moved verbatim out of `SkillsPage.tsx:3-28`, plus the home `tags` array from `HomePage.tsx:4-15`.
- `src/data/projects.ts` already has the right shape — leave it, just import it.
- Update `SkillsPage.tsx`, `HomePage.tsx`, `AboutPage.tsx`, `ContactPage.tsx` to import instead of declaring inline. Pure refactor, zero visual change.

## Step 2 — Intent engine (`src/command/`)

**`types.ts`**

```ts
export type CommandAction =
  | { kind: 'navigate'; to: string; highlight?: string }
  | { kind: 'external'; url: string; label: string }
  | { kind: 'answer' }
  | { kind: 'effect'; effect: 'drs' | 'boxbox' | 'lights' | 'radio' }
  | { kind: 'unknown' }

export interface Intent {
  id: string
  keywords: string[]        // single tokens
  phrases?: string[]        // multi-word, scored higher
  reply: string
  action: CommandAction
  example?: string          // surfaced as a suggestion chip
}

export interface CommandResult {
  reply: string
  action: CommandAction
  confidence: number
  alternates: Intent[]      // populated only in the ambiguous band
  source: 'rules' | 'llm'
}
```

**`intents.ts`** — static intents for the four routes, about-me answers (experience, AI/LangChain/RAG, Web3, tech-stack, availability/hire, "what can you do"), the three socials, and the easter eggs. **Project intents are generated at module load** by mapping over `projects` from `src/data/projects.ts` — title words, `tech[]` entries and `id` become keywords, action is `{ kind: 'navigate', to: '/work', highlight: project.id }`. Same generation for skill lookups from `src/data/skills.ts`, so "do you know postgres?" resolves without hand-listing every skill.

**`router.ts`** — `resolvePrompt(text): CommandResult`

- Normalize: lowercase, strip punctuation, collapse whitespace, tokenize, drop stopwords (`the`, `me`, `to`, `your`, `you`, `page`, `go`, `show`, `open`…) but keep them for phrase matching.
- Score per intent: phrase hit `+3`, exact token hit `+2`, prefix hit (≥4 chars) `+1`, Levenshtein ≤1 on tokens ≥4 chars `+1` (small local implementation, no dependency). Divide by `Math.sqrt(intent.keywords.length)` so intents with long keyword lists don't dominate.
- Bands: `≥2.0` confident → return it; `1.0–2.0` → return top intent with `alternates` (top 3) so the UI can render "did you mean"; `<1.0` → `{ kind: 'unknown' }` with a friendly reply plus suggestion chips.

**`knowledge.ts`** — builds the long-form answer strings and, separately, a compact plaintext site summary used as the LLM system prompt. Both derived from `profile.ts` / `skills.ts` / `projects.ts`.

## Step 3 — Optional on-device model (`src/command/localLLM.ts`)

- `getAvailability()` → wraps `LanguageModel.availability()`, returns `'unavailable'` when the global is absent (all non-Chrome browsers) so no code path throws.
- **Never auto-downloads.** If availability is `'downloadable'`, the bar shows a small "enable on-device AI" toggle; only an explicit click calls `create()` with the download monitor. Choice persisted in `localStorage` under `mi.localAI`.
- `askLocalLLM(text, signal)` — session created once with `initialPrompts: [{ role: 'system', content: <site summary + action schema> }]`, prompted with `responseConstraint` (JSON schema: `{ reply: string, action: {...} }`), parsing a fenced JSON block as fallback if the constraint is unsupported.
- Wrapped in a 4s `AbortController` timeout. **Any** failure — unavailable, timeout, malformed JSON, action pointing at a route that isn't in the router table — silently returns `null` and the caller uses the rules result. The rules result is computed first, always, so the LLM path can only ever upgrade the answer.

## Step 4 — The overlay (`src/components/CommandBar.tsx` + `CommandBarProvider.tsx`)

`CommandBarProvider` holds open/close state, registers the global `keydown` listener (`⌘K`/`Ctrl+K`/`/`, ignoring events whose target is an input/textarea), and exposes `useCommandBar()` so `HomePage` and `Nav` can open it by click for touch users. Mounted in `App.tsx` wrapping the existing tree, with `<CommandBar />` rendered as a sibling of `Nav` above `z-50`.

Visual language reuses what's already there — `carbon-weave`, `corner-box`, `font-display`, `#00D2BE`/`#C0C0C0`/`#161616`:

- Backdrop `bg-[#0A0A0A]/80 backdrop-blur-md`, click-outside closes.
- Panel: `max-w-2xl`, top ~22vh, `border border-[#00D2BE]/30`, teal top hairline like the project cards (`WorkPage.tsx:127`), corner ticks, framer-motion scale/fade in (`0.98 → 1`, 180ms).
- Input row: teal `>` prompt glyph, blinking block caret, placeholder cycling through examples.
- State machine: `idle → typing → thinking → streaming → confirm/execute`.
  - **typing** — live filtered suggestion list from `intents.ts`, ↑/↓ to select, Enter to run.
  - **thinking** — 350–600ms jittered delay with an F1 telemetry-style scanning teal bar. This is what sells "live model".
  - **streaming** — typewriter reveal ~18ms/char (instant under `prefers-reduced-motion`).
  - **navigate** → 700ms countdown then `navigate(to)`, bar closes. **external** → confirm row ("Enter to open github.com ↗ · Esc cancel"), never auto-opens a tab. **answer** → text stays, bar waits. **effect** → runs the easter egg.
- Session transcript persists while open (prior prompt/response pairs scroll above the input), cleared on close. Last 5 prompts kept in `localStorage` for ↑-history recall.
- A11y: `role="dialog" aria-modal="true"`, focus trapped and restored on close, reply region `aria-live="polite"`, Esc closes at every state.

## Step 5 — Entry points and payoffs

- **`HomePage.tsx`** — hint block below the existing CTA row (`HomePage.tsx:229-245`), styled like the W15 telemetry strip: `── PRESS [ / ] TO RUN A PROMPT ▍` with a blinking caret and a slow teal pulse, fading in after the stagger completes. On touch (`pointer: coarse`) the label becomes "TAP TO RUN A PROMPT" and the whole chip is a button.
- **`Nav.tsx`** — compact `⌘K` pill between the links and the mobile toggle, opens the same bar.
- **`WorkPage.tsx`** — read `?p=<id>` on mount; if it matches a project, scroll that `motion.article` into view and pulse its border teal for ~1.2s. This is the deep-link payoff for "show me the ecommerce project".
- **`index.css`** — add `@keyframes` for caret blink, telemetry scan, and the deep-link pulse, next to the existing `corner-box` block.

## Step 6 — Easter eggs

Small, self-contained, rendered by `CommandBar` as transient full-screen overlays: `drs` (teal wipe left→right), `box box` (pit-limiter stripe across the top), `lights out` (five red lights sequence then teal flash), `radio check` (static-styled monospace radio reply). All skipped under `prefers-reduced-motion`, all auto-dismiss.

---

## Verification

1. `npm run dev`, open the printed URL.
2. **Trigger** — `⌘K` and `/` open from every route; `/` typed inside a form field does *not* open it; Esc closes and returns focus to the trigger.
3. **Navigate** — "take me to about", "abuot page" (typo → fuzzy hit), "contact" all route correctly with the countdown.
4. **Answer** — "what do you know about react", "how many years experience", "do you do web3" stream text and stay put; verify the text matches what `/about` and `/skills` actually render.
5. **External** — "github" shows the confirm row and opens nothing until Enter.
6. **Deep-link** — "show me the ecommerce project" lands on `/work?p=nutri-strat` with that card scrolled to and pulsing.
7. **Easter eggs** — "drs", "box box", "lights out", "radio check".
8. **Unknown** — "asdfgh" returns the fallback plus suggestion chips, never a crash.
9. **Fallback proof** — in DevTools console run `delete window.LanguageModel` before opening the bar; every case above must still pass. Then repeat in Safari or Firefox.
10. **Reduced motion** — enable it in OS settings; typewriter and effects become instant, nothing breaks.
11. **Mobile** — narrow the viewport: hint becomes tappable, panel fits, on-screen keyboard doesn't cover the input.
12. `npm run build` — `tsc -b` must pass clean.

## Out of scope

No hosted LLM, no API keys, no network calls, no new runtime dependencies (fuzzy matching is ~20 lines of local code). No changes to the existing page designs beyond the data refactor and the two hint entry points.

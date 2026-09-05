# Resume Maker — Design Document

A professional, portfolio-quality resume maker: multi-template editor with live preview, pixel-perfect ATS-parseable PDF export, provider-agnostic AI assistance (rewrite, tailor, score), a job application tracker, and an AI cover letter builder.

## 1. Goals

- Build resumes in a live side-by-side editor with drag-and-drop section/item reordering and autosave.
- 6 polished, customizable templates (accent color, fonts, sizing, spacing, margins) — trivially extensible via a registry.
- Export PDFs that are pixel-identical to the preview and fully text-parseable by ATS systems.
- AI assistance that works with any provider (Claude, OpenAI, Gemini, …) selected purely by configuration.
- Tailor a resume to a pasted job description with accept/reject suggestions and a deterministic ATS match score.
- Track every job application and the exact resume version sent to it.
- Generate cover letters styled to match the linked resume's template.
- Import an existing resume (PDF/DOCX/TXT upload or pasted text): server extracts text (unpdf/mammoth), AI parses it into the structured `ResumeContent` via `generateObject` (`POST /api/import`, `lib/ai/import.ts`).

Out of scope: public share links, separate backend server.

## 2. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript, React 19) | Full-stack: server actions for mutations, route handlers for streaming/binary responses (AI, PDF) |
| Database | PostgreSQL (local) + Prisma 6 | Typed client, migrations, Prisma Studio |
| Auth | NextAuth v5 (Auth.js) + Prisma adapter + bcryptjs | Credentials (email/password) + Google OAuth. JWT session strategy (required by the Credentials provider). `bcryptjs` avoids native builds on Windows |
| Styling | Tailwind CSS v4 + shadcn/ui | App chrome only. Templates use CSS Modules so print output is decoupled from Tailwind preflight |
| Editor state | Zustand (+ zundo for undo/redo) | Selector-based granular re-renders for keystroke-level live preview |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable | Accessible, standard, vertical list sorting |
| Validation | Zod | Single source of truth: resume content shape, server-action inputs, AI structured outputs |
| PDF | Puppeteer (full package) | Renders the real template HTML headlessly → pixel-perfect PDF with a genuine text layer |
| AI | Vercel AI SDK (`ai`) + `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google` | Provider-agnostic: `streamText` / `generateObject` work identically across providers; active provider chosen via env |
| Misc | nanoid, sonner, lucide-react, react-hook-form (discrete forms only), next/font | |

### AI provider configuration

```
AI_PROVIDER=anthropic | openai | google      # extendable
AI_MODEL=<model id for that provider>
ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY
```

`src/lib/ai/provider.ts` resolves these to an AI SDK model instance. Swapping providers is an env change — zero code change. Adding a new provider = one entry in the resolver map.

## 3. Data Model

**Core decision: resume content lives in a single `Json` (jsonb) column**, validated by a Zod schema carrying a `schemaVersion` — not normalized tables. Sections are heterogeneous and user-ordered; autosave is one atomic UPDATE; duplication is a row copy; snapshots are row copies; content is never queried across users.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?          // null for OAuth-only users
  name         String?
  image        String?
  // relations: accounts, resumes, applications, coverLetters, aiUsage
}

model Resume {
  id         String   @id @default(cuid())
  userId     String
  title      String   @default("Untitled Resume")
  content    Json     // Zod-validated ResumeContent
  templateId String   @default("ats-classic")
  settings   Json     // TemplateSettings: accentColor, fontFamily, fontSize, lineSpacing, margins, sectionSpacing
  // snapshots, applications; @@index([userId, updatedAt])
}

model ResumeSnapshot {  // immutable version: captured at export / "mark as sent"
  id, resumeId, content, templateId, settings, label?, createdAt
}

enum ApplicationStatus { SAVED APPLIED INTERVIEWING OFFER REJECTED }

model JobApplication {
  id, userId, company, role, status, jobUrl?, jdText?, jdKeywords Json?,
  notes?, resumeId?, snapshotId?, appliedAt?, timestamps
  // jdText reused by tailoring + cover letters; jdKeywords caches the AI extraction
}

model CoverLetter {
  id, userId, applicationId? @unique, resumeId?, title, body, templateId, settings, timestamps
}

model AiUsage {
  id, userId, feature, provider, model, inputTokens, outputTokens, createdAt
}
```

Auth.js standard `Account` and `VerificationToken` models included; no `Session` model (JWT strategy).

### ResumeContent (Zod, `src/lib/schemas/resume.ts`)

```ts
{
  schemaVersion: 1,
  personal: { fullName, headline, email, phone, location, website, linkedin, github },
  sectionOrder: SectionId[],          // drives render order
  hiddenSections: SectionId[],
  sections: {
    summary: string,
    experience: [{ id, role, company, location, startDate, endDate, current, bullets: string[] }],
    education:  [{ id, degree, institution, location, startDate, endDate, details }],
    skills:     [{ id, group, items: string[] }],
    projects:   [{ id, name, link, description, bullets, tech: string[] }],
    certifications: [{ id, name, issuer, date, link }],
    languages:  [{ id, name, level }],
    custom:     [{ id, title, items: [{ id, heading, subheading, date, bullets }] }],
  },
}
```

Every item carries a `nanoid` `id` (dnd-kit keys, stable React keys, AI suggestion targeting).

## 4. Project Structure

```
├── design.md
├── prisma/schema.prisma
├── src/
│   ├── auth.ts                      # NextAuth v5 config
│   ├── middleware.ts                # protects (dashboard) + /editor
│   ├── app/
│   │   ├── (marketing)/page.tsx     # landing
│   │   ├── (auth)/login, register
│   │   ├── (dashboard)/             # sidebar shell: resumes, tracker, cover-letters
│   │   ├── editor/[resumeId]/       # full-screen editor, own layout
│   │   ├── print/[resumeId]/        # token-gated chrome-less render (Puppeteer + browser print)
│   │   ├── print/cover-letter/[id]/
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── export/[resumeId]/   # GET → PDF bytes
│   │       └── ai/{rewrite,summary,tailor,ats-score,cover-letter}/
│   ├── actions/                     # server actions: resume, application, coverLetter, auth
│   ├── components/ui|editor|tracker|dashboard/
│   ├── templates/
│   │   ├── registry.ts              # id → { name, category, component, defaults, thumbnail }
│   │   ├── types.ts                 # TemplateProps = { content, settings, mode: "preview" | "print" }
│   │   ├── shared/                  # SectionHeading, DateRange, ContactLine
│   │   └── <template-id>/index.tsx + styles.module.css   # 6 self-contained templates
│   └── lib/
│       ├── prisma.ts, print-token.ts
│       ├── schemas/resume.ts
│       ├── ai/provider.ts, ai/prompts.ts, ai/ats.ts
│       ├── pdf/browser.ts           # Puppeteer singleton
│       └── stores/editor-store.ts
```

Adding template #7 = one new folder + one registry entry. Nothing else changes.

## 5. Key Architecture

### 5.1 Editor & autosave
The Zustand store is the in-session source of truth. Every mutation marks the store dirty; a 1.5 s debounce calls the `saveResume` server action with `{ id, title, content, settings, templateId }`. Header shows `saved / saving / error`; a `beforeunload` guard fires while dirty. Last-write-wins is fine (one user per resume).

### 5.2 One source of truth for preview and PDF
Templates are pure server-renderable React components: `({ content, settings, mode }) => JSX`, styled with CSS Modules + CSS variables derived from `settings` (`--accent`, `--fs-base`, `--page-margin`, …). The editor preview renders the same component scaled to fit (`transform: scale()`); `/print/[resumeId]` renders it at true A4 with `@page` CSS. Pixel parity is structural, not best-effort. Fonts are self-hosted via `next/font`, so Puppeteer needs no network fetches.

### 5.3 PDF export pipeline
`GET /api/export/[resumeId]`:
1. Authenticate session, verify resume ownership.
2. Mint a short-lived HMAC token (resumeId + 60 s expiry, signed with `AUTH_SECRET`).
3. Reuse a singleton headless browser (cached on `globalThis` in dev to survive HMR).
4. `page.goto(origin + /print/{id}?token=…, { waitUntil: "networkidle0" })`, await `document.fonts.ready`.
5. `page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true })` → `Content-Disposition: attachment`.

Token auth (not cookie forwarding) keeps `/print` closed to the public and avoids fragile cookie plumbing. The PDF has a real text layer — ATS-parseable by construction. The same `/print` page powers the browser's native print dialog.

### 5.4 AI endpoints
Route handlers (server actions can't stream). Two shapes:
- **Streaming** (`rewrite`, `summary`, `cover-letter`): `streamText` piped to the response; a `useAiStream` client hook types the result into the field live.
- **Structured** (`ats-score` keyword extraction, `tailor`): `generateObject` with Zod schemas; one retry on parse failure. Tailor returns `{ suggestions: [{ sectionId, itemId, field, original, proposed, rationale }] }` rendered as accept/reject diffs that patch the store directly.

Prompts centralized in `lib/ai/prompts.ts`; resume content serialized to compact plain text for all AI features. Token usage logged to `AiUsage` with provider + model.

### 5.5 ATS scoring — hybrid
1. One AI call extracts structured keywords from the JD: `{ hardSkills: [{ term, synonyms }], titles, qualifications, softSkills }` — cached on the `JobApplication` (`jdKeywords`).
2. A deterministic matcher (`lib/ai/ats.ts`) normalizes resume text and computes a weighted score: hard skills 50 %, titles 20 %, qualifications 20 %, soft skills 10 %.
3. Report: score, per-category matched/missing lists, "add these keywords" panel.

The score is stable, explainable, and recomputes instantly as the user edits — the AI runs once per JD, not per keystroke.

## 6. Templates

| ID | Category | Description |
|---|---|---|
| `ats-classic` | ATS | Single column, serif headings, zero decoration — maximum parser compatibility |
| `ats-clean` | ATS | Single column, sans-serif, subtle rules |
| `modern-accent` | Modern | Accent-colored headings and rule lines, single column |
| `modern-columns` | Modern | Two-column: sidebar (contact, skills, languages) + main flow |
| `creative-sidebar` | Creative | Colored sidebar band, distinctive typography |
| `compact-one` | Compact | Dense one-page layout, tight spacing |

All respect `TemplateSettings`; each supports a cover-letter render mode (Phase 6).

## 7. Roadmap

| Phase | Deliverable | Verification |
|---|---|---|
| 0 | design.md, scaffold, Prisma schema + migration, NextAuth (credentials + Google), dashboard shell | register/login/logout, Google sign-in, guarded routes redirect, rows in Prisma Studio |
| 1 | Resume CRUD, editor (all sections, dnd reorder, autosave), registry + `ats-classic`, live preview | fill every section, drag reorder, refresh persists, duplicate |
| 2 | PDF export pipeline + print page | PDF matches preview, text selectable/copyable, browser print clean |
| 3 | Templates 2–6 + customization panel + switcher | lossless template switching, every setting reflected in preview and PDF |
| 4 | AI: provider layer, rewrite, summary, tailoring diffs, ATS score panel | streaming works, real JD → score + missing keywords, provider swap via env works |
| 5 | Job tracker board + snapshots | drag through pipeline, export exact snapshot sent |
| 6 | Cover letters (AI generation + templated PDF export) | generated letter matches linked resume's template |
| 7 | Polish: undo/redo, states, landing, shortcuts, seed, README | full walkthrough, clean `npm run build` |

## 8. Environment

```
DATABASE_URL=postgresql://user:pass@localhost:5432/resume_maker
AUTH_SECRET=...
GOOGLE_CLIENT_ID=... / GOOGLE_CLIENT_SECRET=...   # optional until configured
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-5
ANTHROPIC_API_KEY=... (or OPENAI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY)
```

## 9. Known Gotchas

- NextAuth v5 is beta — version pinned; Credentials provider forces JWT sessions (Prisma adapter still persists OAuth users/accounts).
- First `npm i puppeteer` downloads Chrome (~150 MB); Windows Defender may prompt once on first headless launch.
- dnd-kit + React 19 peer-dep warnings are benign (`--legacy-peer-deps` if npm blocks).
- `next.config.ts` needs `serverExternalPackages: ["puppeteer"]`.

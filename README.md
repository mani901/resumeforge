# ResumeForge — AI Resume Builder with ATS Score, Job Tracker & Cover Letter Generator

**ResumeForge** is a free, open-source **AI resume builder** built with **Next.js 15, React 19, TypeScript, PostgreSQL, and Prisma**. Create professional, **ATS-friendly resumes** with a live preview editor, export **pixel-perfect PDF resumes** with a real text layer that applicant tracking systems can parse, score your resume against any **job description with an ATS match score**, and generate tailored **AI cover letters** — all with the AI provider of your choice (**Google Gemini, OpenAI GPT, or Anthropic Claude**).

> A full-stack resume maker and job application tracker for developers and job seekers who want more than an ordinary online CV builder.

## 📸 Screenshots

![ResumeForge AI resume builder — editor with live preview](docs/screenshots/resume-builder-1.png)

| | |
|---|---|
| ![ResumeForge resume templates and ATS tailoring](docs/screenshots/resume-builder-2.png) | ![ResumeForge job application tracker](docs/screenshots/resume-builder-3.png) |

## ✨ Features

- **Live resume editor** — all standard resume sections (summary, work experience, education, skills, projects, certifications, languages) plus unlimited custom sections, with drag-and-drop reordering of sections, entries, and bullet points, autosave, undo/redo, and collapsible entries
- **AI resume import / CV parser** — upload your existing resume (PDF, DOCX, or TXT) or paste the text, and AI converts it into structured, editable data
- **6 professional resume templates** — ATS-minimal, modern two-column, creative sidebar, and compact one-page layouts, all customizable: accent color, font family, font size, line spacing, margins, header alignment
- **ATS-parseable PDF export** — Puppeteer renders the exact template you preview into a **selectable-text PDF** with clickable email, LinkedIn, GitHub, and project hyperlinks (no images of text, no ATS parsing failures)
- **ATS resume checker / keyword match score** — paste a job description; AI extracts hard skills, titles, qualifications, and soft skills, then a deterministic matcher scores your resume 0–100 live as you edit, with matched/missing keyword reports
- **AI resume tailoring** — job-description-aware suggestions with accept/reject diffs; AI bullet point rewriting (improve, shorten, quantify) and professional summary generation
- **Job application tracker** — kanban board (saved → applied → interviewing → offer → rejected) that links each application to the exact resume snapshot you sent
- **AI cover letter generator** — writes a cover letter from your resume + the job description, styled to match your resume template, exportable to PDF
- **Provider-agnostic AI layer** — switch between **Gemini, GPT, and Claude** by changing two environment variables; zero code changes (Vercel AI SDK)
- **Multi-user authentication** — email/password + Google OAuth (NextAuth v5), with every resume, application, and letter scoped to its owner
- **Fully responsive** — desktop split-pane editing, mobile edit/preview toggle, drawer navigation

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Actions, TypeScript) + React 19 |
| Database | [PostgreSQL](https://www.postgresql.org) + [Prisma ORM](https://www.prisma.io) |
| Auth | [NextAuth v5 (Auth.js)](https://authjs.dev) — credentials + Google OAuth |
| UI | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com), [dnd-kit](https://dndkit.com) drag-and-drop, [Zustand](https://zustand.docs.pmnd.rs) state |
| AI | [Vercel AI SDK](https://ai-sdk.dev) — `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic` |
| PDF | [Puppeteer](https://pptr.dev) headless Chrome rendering |

See [design.md](design.md) for the full architecture: data model, template registry, autosave, print-token PDF pipeline, and the hybrid AI + deterministic ATS scoring design.

## 🚀 Getting Started

Requirements: Node.js 20+, PostgreSQL running locally.

```bash
git clone https://github.com/<you>/resumeforge.git
cd resumeforge
npm install
cp .env.example .env   # then edit:
```

| Variable | Notes |
|---|---|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@localhost:5432/resume_maker` |
| `AUTH_SECRET` | any random string (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID/SECRET` | optional — Google sign-in hides itself when unset |
| `AI_PROVIDER` | `google`, `openai`, or `anthropic` |
| `AI_MODEL` | model id for that provider (e.g. `gemini-flash-latest`, `gpt-4o`, `claude-sonnet-4-5`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` etc. | only the active provider's key is required |

```bash
# create the database, then:
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000, register, and build your resume.

**Notes**
- The first `npm install` downloads Chrome for Puppeteer (~150 MB); Windows Defender may prompt once on the first PDF export.
- `npx prisma studio` opens a GUI over your data.
- `node scripts/seed-test-user.mjs` creates a demo account (`test@example.com` / `password123`) with a filled-in resume.
- Free-tier AI quotas are small (e.g. Gemini free tier: ~20 requests/day per model); the app surfaces rate-limit errors clearly so you can switch `AI_MODEL` or wait.

## 🔑 Keywords

AI resume builder · ATS-friendly resume maker · resume checker · ATS score · CV builder · resume parser · job application tracker · AI cover letter generator · resume to PDF · Next.js resume builder · open source resume builder · React resume editor · resume templates · job search tools · Gemini / GPT / Claude integration

## 📄 License

MIT — use it, fork it, ship it.

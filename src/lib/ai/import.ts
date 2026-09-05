import { z } from "zod";
import { nanoid } from "nanoid";
import { defaultResumeContent, type ResumeContent } from "@/lib/schemas/resume";

const importedLinkSchema = z.object({ label: z.string(), url: z.string() });

export const importedResumeSchema = z.object({
  personal: z.object({
    fullName: z.string(),
    headline: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: importedLinkSchema,
    linkedin: importedLinkSchema,
    github: importedLinkSchema,
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      current: z.boolean(),
      bullets: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      details: z.string(),
    })
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
  projects: z.array(
    z.object({
      name: z.string(),
      link: importedLinkSchema,
      description: z.string(),
      bullets: z.array(z.string()),
      tech: z.array(z.string()),
    })
  ),
  certifications: z.array(
    z.object({ name: z.string(), issuer: z.string(), date: z.string(), link: z.string() })
  ),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
});

export type ImportedResume = z.infer<typeof importedResumeSchema>;

export function importParsePrompt(resumeText: string) {
  return `Parse this resume text into structured data. Rules:
- Extract everything present; use "" for missing string fields and [] for missing lists
- Keep bullet points as separate array entries, verbatim (fix only broken line-wrapping)
- Dates as they appear (e.g. "Jan 2023", "2019"); current=true when an end date reads "Present" or similar
- Group skills the way the resume groups them; if ungrouped, use one group with group=""
- headline is the professional title line near the name, if any
- For every link field (website/linkedin/github and project links): label is short display text ("LinkedIn", "GitHub", "Live demo"); url is the full https:// URL if the text contains one or an obvious handle/domain (e.g. "linkedin.com/in/jane" → "https://linkedin.com/in/jane"), else ""
- Do not invent or embellish anything

RESUME TEXT:
${resumeText}`;
}

export function importedToContent(imported: ImportedResume): ResumeContent {
  const content = defaultResumeContent();
  content.personal = imported.personal;
  content.sections.summary = imported.summary;
  content.sections.experience = imported.experience.map((e) => ({ ...e, id: nanoid() }));
  content.sections.education = imported.education.map((e) => ({ ...e, id: nanoid() }));
  content.sections.skills = imported.skills.map((s) => ({ ...s, id: nanoid() }));
  content.sections.projects = imported.projects.map((p) => ({ ...p, id: nanoid() }));
  content.sections.certifications = imported.certifications.map((c) => ({ ...c, id: nanoid() }));
  content.sections.languages = imported.languages.map((l) => ({ ...l, id: nanoid() }));
  return content;
}

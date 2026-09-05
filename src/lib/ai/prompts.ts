import type { ResumeContent } from "@/lib/schemas/resume";
import { formatDateRange } from "@/templates/shared/helpers";

export function resumeToPlainText(content: ResumeContent): string {
  const { personal, sections } = content;
  const lines: string[] = [];

  lines.push(personal.fullName, personal.headline);
  const links = [personal.website, personal.linkedin, personal.github]
    .map((l) => l.url.trim() || l.label.trim())
    .filter(Boolean);
  if (links.length) lines.push(links.join(" | "));
  if (sections.summary) lines.push("", "SUMMARY", sections.summary);

  if (sections.experience.length) {
    lines.push("", "EXPERIENCE");
    for (const e of sections.experience) {
      lines.push(`${e.role} at ${e.company} (${formatDateRange(e.startDate, e.endDate, e.current)})`);
      for (const b of e.bullets) if (b.trim()) lines.push(`- ${b}`);
    }
  }

  if (sections.education.length) {
    lines.push("", "EDUCATION");
    for (const e of sections.education) {
      lines.push(`${e.degree}, ${e.institution} (${formatDateRange(e.startDate, e.endDate)})`);
      if (e.details) lines.push(e.details);
    }
  }

  if (sections.skills.length) {
    lines.push("", "SKILLS");
    for (const g of sections.skills) lines.push(`${g.group}: ${g.items.join(", ")}`);
  }

  if (sections.projects.length) {
    lines.push("", "PROJECTS");
    for (const p of sections.projects) {
      lines.push(`${p.name}${p.tech.length ? ` (${p.tech.join(", ")})` : ""}`);
      if (p.description) lines.push(p.description);
      for (const b of p.bullets) if (b.trim()) lines.push(`- ${b}`);
    }
  }

  if (sections.certifications.length) {
    lines.push("", "CERTIFICATIONS");
    for (const c of sections.certifications) lines.push(`${c.name} — ${c.issuer} ${c.date}`);
  }

  if (sections.languages.length) {
    lines.push("", "LANGUAGES");
    lines.push(sections.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", "));
  }

  for (const cs of sections.custom) {
    if (!cs.items.length) continue;
    lines.push("", cs.title.toUpperCase());
    for (const item of cs.items) {
      lines.push(`${item.heading}${item.subheading ? `, ${item.subheading}` : ""} ${item.date}`.trim());
      for (const b of item.bullets) if (b.trim()) lines.push(`- ${b}`);
    }
  }

  return lines.filter((l) => l !== undefined).join("\n").trim();
}

export const REWRITE_STYLES = {
  improve: "Rewrite it to be stronger and more impactful. Lead with an action verb, be specific about what was done and its impact.",
  concise: "Rewrite it to be as concise as possible while keeping the key achievement. One line.",
  quantify: "Rewrite it to emphasize measurable impact. If the original has no numbers, restructure so the achievement is concrete and specific (do NOT invent numbers — use placeholders like [X%] where a metric belongs).",
} as const;

export type RewriteStyle = keyof typeof REWRITE_STYLES;

export function rewriteBulletPrompt(bullet: string, style: RewriteStyle, resumeContext: string) {
  return `You are an expert resume writer. Here is a resume for context:

${resumeContext}

Rewrite this single resume bullet point. ${REWRITE_STYLES[style]}

Never invent facts: no technologies, numbers, or achievements that are not in the original bullet or elsewhere in the resume. Where a metric would strengthen the bullet but none exists, use a [X%]-style placeholder the writer can fill in.

Bullet: "${bullet}"

Reply with ONLY the rewritten bullet text — no quotes, no explanation, no leading dash.`;
}

export function summaryPrompt(resumeContext: string) {
  return `You are an expert resume writer. Based on this resume, write a professional summary of 2-3 sentences. Highlight years of experience, core stack/skills, and one distinguishing strength. Write in first person implied (no "I"), confident but factual — do not invent anything not in the resume.

${resumeContext}

Reply with ONLY the summary text.`;
}

export function extractKeywordsPrompt(jdText: string) {
  return `Extract ATS-relevant keywords from this job description. For each hard skill include common synonyms/variants (e.g. "PostgreSQL" → ["postgres", "psql"]). Titles are job titles mentioned. Qualifications are degrees, years-of-experience requirements, and certifications. Soft skills are interpersonal/work-style traits.

Job description:
${jdText}`;
}

export function tailorPrompt(resumeContext: string, jdText: string) {
  return `You are an expert resume coach. Compare this resume against the job description and propose concrete edits that tailor the resume to the job. Only propose edits to the summary or to existing bullet points (rewrite them to emphasize relevant experience and naturally include missing keywords). Never invent experience the candidate does not have. Propose at most 8 high-impact edits.

For each bullet edit, the BULLET IDS list below shows [section/itemId/bulletIndex] before each bullet. You MUST copy these values exactly: "section" is the part before the first slash, "itemId" is the part between the slashes (copy it character-for-character, it is a random id), and "bulletIndex" is the number after the last slash. "original" must be the bullet text verbatim, unmodified.

RESUME (bullet ids are in [brackets]):
${resumeContext}

JOB DESCRIPTION:
${jdText}`;
}

export function resumeToAnnotatedText(content: ResumeContent): string {
  const lines: string[] = [resumeToPlainText(content), "", "BULLET IDS:"];
  for (const e of content.sections.experience) {
    e.bullets.forEach((b, i) => {
      if (b.trim()) lines.push(`[experience/${e.id}/${i}] ${b}`);
    });
  }
  for (const p of content.sections.projects) {
    p.bullets.forEach((b, i) => {
      if (b.trim()) lines.push(`[projects/${p.id}/${i}] ${b}`);
    });
  }
  return lines.join("\n");
}

import type { ResumeContent, SectionId } from "@/lib/schemas/resume";

export const SECTION_TITLES: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  custom: "",
};

export function sectionHasContent(content: ResumeContent, id: SectionId): boolean {
  const s = content.sections;
  switch (id) {
    case "summary":
      return s.summary.trim().length > 0;
    case "experience":
      return s.experience.length > 0;
    case "education":
      return s.education.length > 0;
    case "skills":
      return s.skills.length > 0;
    case "projects":
      return s.projects.length > 0;
    case "certifications":
      return s.certifications.length > 0;
    case "languages":
      return s.languages.length > 0;
    case "custom":
      return s.custom.some((cs) => cs.items.length > 0);
  }
}

export function visibleSections(content: ResumeContent): SectionId[] {
  return content.sectionOrder.filter(
    (id) => !content.hiddenSections.includes(id) && sectionHasContent(content, id)
  );
}

export function formatDateRange(start: string, end: string, current?: boolean): string {
  const from = start.trim();
  const to = current ? "Present" : end.trim();
  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;
  return `${from} – ${to}`;
}

export interface ContactPart {
  text: string;
  url?: string;
}

export function hrefFor(url: string): string {
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function contactParts(personal: ResumeContent["personal"]): ContactPart[] {
  const parts: ContactPart[] = [];
  const email = personal.email.trim();
  if (email) parts.push({ text: email, url: `mailto:${email}` });
  const phone = personal.phone.trim();
  if (phone) parts.push({ text: phone, url: `tel:${phone.replace(/[^\d+]/g, "")}` });
  if (personal.location.trim()) parts.push({ text: personal.location.trim() });
  for (const link of [personal.website, personal.linkedin, personal.github]) {
    const text = link.label.trim() || link.url.trim();
    if (text) parts.push({ text, url: link.url.trim() || undefined });
  }
  return parts;
}

export function ContactText({ part }: { part: ContactPart }) {
  return part.url ? <a href={hrefFor(part.url)}>{part.text}</a> : <>{part.text}</>;
}

export function linkPart(link: { label: string; url: string }): ContactPart | null {
  const text = link.label.trim() || link.url.trim();
  return text ? { text, url: link.url.trim() || undefined } : null;
}

export function nonEmptyBullets(bullets: string[]): string[] {
  return bullets.map((b) => b.trim()).filter(Boolean);
}

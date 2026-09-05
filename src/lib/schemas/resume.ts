import { z } from "zod";
import { nanoid } from "nanoid";

export const SECTION_IDS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "custom",
] as const;

export const sectionIdSchema = z.enum(SECTION_IDS);
export type SectionId = z.infer<typeof sectionIdSchema>;

// Accepts a legacy plain string (pre-link-support content) or {label, url}
export const linkFieldSchema = z
  .union([
    z.string(),
    z.object({ label: z.string().default(""), url: z.string().default("") }),
  ])
  .transform((v) => (typeof v === "string" ? { label: v, url: "" } : v));

export type LinkField = { label: string; url: string };

export const emptyLink = (): LinkField => ({ label: "", url: "" });

export const personalSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: linkFieldSchema.default(""),
  linkedin: linkFieldSchema.default(""),
  github: linkFieldSchema.default(""),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  role: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string().default(""),
  institution: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default(""),
});

export const skillGroupSchema = z.object({
  id: z.string(),
  group: z.string().default(""),
  items: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  link: linkFieldSchema.default(""),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  link: z.string().default(""),
});

export const languageItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  level: z.string().default(""),
});

export const customItemSchema = z.object({
  id: z.string(),
  heading: z.string().default(""),
  subheading: z.string().default(""),
  date: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().default("Custom Section"),
  items: z.array(customItemSchema).default([]),
});

export const resumeContentSchema = z.object({
  schemaVersion: z.literal(1),
  personal: personalSchema,
  sectionOrder: z.array(sectionIdSchema),
  hiddenSections: z.array(sectionIdSchema).default([]),
  sectionTitles: z.record(z.string()).default({}),
  sections: z.object({
    summary: z.string().default(""),
    experience: z.array(experienceItemSchema).default([]),
    education: z.array(educationItemSchema).default([]),
    skills: z.array(skillGroupSchema).default([]),
    projects: z.array(projectItemSchema).default([]),
    certifications: z.array(certificationItemSchema).default([]),
    languages: z.array(languageItemSchema).default([]),
    custom: z.array(customSectionSchema).default([]),
  }),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;
export type CustomItem = z.infer<typeof customItemSchema>;
export type Personal = z.infer<typeof personalSchema>;

export const templateSettingsSchema = z.object({
  accentColor: z.string().default("#2563eb"),
  headerAlign: z.enum(["left", "center"]).default("center"),
  fontFamily: z.enum(["inter", "source-serif", "ibm-plex", "lora"]).default("inter"),
  fontSize: z.number().min(8).max(13).default(10),
  lineSpacing: z.number().min(1).max(1.8).default(1.35),
  pageMargin: z.number().min(8).max(30).default(16),
  sectionSpacing: z.number().min(4).max(24).default(12),
});

export type TemplateSettings = z.infer<typeof templateSettingsSchema>;

export function defaultResumeContent(): ResumeContent {
  return {
    schemaVersion: 1,
    personal: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: emptyLink(),
      linkedin: emptyLink(),
      github: emptyLink(),
    },
    sectionOrder: [
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "languages",
      "custom",
    ],
    hiddenSections: [],
    sectionTitles: {},
    sections: {
      summary: "",
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      custom: [],
    },
  };
}

export function defaultTemplateSettings(): TemplateSettings {
  return templateSettingsSchema.parse({});
}

export function newExperienceItem(): ExperienceItem {
  return { id: nanoid(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] };
}

export function newEducationItem(): EducationItem {
  return { id: nanoid(), degree: "", institution: "", location: "", startDate: "", endDate: "", details: "" };
}

export function newSkillGroup(): SkillGroup {
  return { id: nanoid(), group: "", items: [] };
}

export function newProjectItem(): ProjectItem {
  return { id: nanoid(), name: "", link: emptyLink(), description: "", bullets: [""], tech: [] };
}

export function newCertificationItem(): CertificationItem {
  return { id: nanoid(), name: "", issuer: "", date: "", link: "" };
}

export function newLanguageItem(): LanguageItem {
  return { id: nanoid(), name: "", level: "" };
}

export function newCustomSection(): CustomSection {
  return { id: nanoid(), title: "Custom Section", items: [] };
}

export function newCustomItem(): CustomItem {
  return { id: nanoid(), heading: "", subheading: "", date: "", bullets: [""] };
}

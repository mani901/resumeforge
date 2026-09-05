import type { ComponentType, CSSProperties } from "react";
import type { ResumeContent, TemplateSettings } from "@/lib/schemas/resume";
import { fontFamilyCss } from "@/lib/fonts";

export type TemplateMode = "preview" | "print";

export interface TemplateProps {
  content: ResumeContent;
  settings: TemplateSettings;
  mode: TemplateMode;
}

export type TemplateCategory = "ats" | "modern" | "creative" | "compact";

export interface TemplateDef {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  component: ComponentType<TemplateProps>;
  defaults?: Partial<TemplateSettings>;
}

export function settingsToCssVars(settings: TemplateSettings): CSSProperties {
  return {
    "--accent": settings.accentColor,
    "--header-align": settings.headerAlign,
    "--font-body": fontFamilyCss[settings.fontFamily],
    "--fs-base": `${settings.fontSize}pt`,
    "--line-spacing": settings.lineSpacing,
    "--page-margin": `${settings.pageMargin}mm`,
    "--section-spacing": `${settings.sectionSpacing}pt`,
  } as CSSProperties;
}

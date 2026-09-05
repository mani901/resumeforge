import type { TemplateDef } from "@/templates/types";
import AtsClassic from "@/templates/ats-classic";
import AtsClean from "@/templates/ats-clean";
import ModernAccent from "@/templates/modern-accent";
import ModernColumns from "@/templates/modern-columns";
import CreativeSidebar from "@/templates/creative-sidebar";
import CompactOne from "@/templates/compact-one";

export const templates: TemplateDef[] = [
  {
    id: "ats-classic",
    name: "ATS Classic",
    category: "ats",
    description: "Single column, zero decoration — maximum parser compatibility.",
    component: AtsClassic,
  },
  {
    id: "ats-clean",
    name: "ATS Clean",
    category: "ats",
    description: "Centered header with subtle rules. Quiet and professional.",
    component: AtsClean,
  },
  {
    id: "modern-accent",
    name: "Modern Accent",
    category: "modern",
    description: "Accent-colored headings with ruled section titles.",
    component: ModernAccent,
  },
  {
    id: "modern-columns",
    name: "Modern Columns",
    category: "modern",
    description: "Two columns: gray sidebar for contact and skills, main flow for experience.",
    component: ModernColumns,
  },
  {
    id: "creative-sidebar",
    name: "Creative Sidebar",
    category: "creative",
    description: "Bold colored sidebar with white text. Stands out in a stack.",
    component: CreativeSidebar,
  },
  {
    id: "compact-one",
    name: "Compact One-Pager",
    category: "compact",
    description: "Dense one-page layout that fits the most content.",
    component: CompactOne,
  },
];

export function getTemplate(id: string): TemplateDef {
  return templates.find((t) => t.id === id) ?? templates[0];
}

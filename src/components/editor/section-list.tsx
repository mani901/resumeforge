"use client";

import type { SectionId } from "@/lib/schemas/resume";
import { useEditorStore } from "@/lib/stores/editor-store";
import { SortableList, SortableItem } from "@/components/editor/sortable-list";
import { SectionPanel } from "@/components/editor/section-panel";
import { SummaryForm } from "@/components/editor/sections/summary-form";
import { ExperienceForm } from "@/components/editor/sections/experience-form";
import { EducationForm } from "@/components/editor/sections/education-form";
import { SkillsForm } from "@/components/editor/sections/skills-form";
import { ProjectsForm } from "@/components/editor/sections/projects-form";
import { CertificationsForm } from "@/components/editor/sections/certifications-form";
import { LanguagesForm } from "@/components/editor/sections/languages-form";
import { CustomForm } from "@/components/editor/sections/custom-form";

const SECTION_META: Record<SectionId, { title: string; form: React.ComponentType }> = {
  summary: { title: "Summary", form: SummaryForm },
  experience: { title: "Experience", form: ExperienceForm },
  education: { title: "Education", form: EducationForm },
  skills: { title: "Skills", form: SkillsForm },
  projects: { title: "Projects", form: ProjectsForm },
  certifications: { title: "Certifications", form: CertificationsForm },
  languages: { title: "Languages", form: LanguagesForm },
  custom: { title: "Custom Sections", form: CustomForm },
};

export function SectionList() {
  const sectionOrder = useEditorStore((s) => s.content.sectionOrder);
  const reorderSections = useEditorStore((s) => s.reorderSections);

  return (
    <SortableList
      ids={sectionOrder}
      onMove={(from, to) => reorderSections(from as SectionId, to as SectionId)}
    >
      <div className="space-y-3">
        {sectionOrder.map((id) => {
          const { title, form: Form } = SECTION_META[id];
          return (
            <SortableItem key={id} id={id} handle>
              <SectionPanel sectionId={id} title={title}>
                <Form />
              </SectionPanel>
            </SortableItem>
          );
        })}
      </div>
    </SortableList>
  );
}

import type { TemplateProps } from "@/templates/types";
import { settingsToCssVars } from "@/templates/types";
import type { SectionId } from "@/lib/schemas/resume";
import { contactParts, ContactText } from "@/templates/shared/helpers";
import { StandardSections, type SectionStyles } from "@/templates/shared/standard-sections";
import styles from "./styles.module.css";

const SIDEBAR_SECTIONS: SectionId[] = ["skills", "languages", "certifications"];

const sideStyles: SectionStyles = {
  section: styles.sideSection,
  sectionTitle: styles.sideSectionTitle,
  item: styles.sideItem,
  itemHeader: styles.sideItemHeader,
  itemTitle: styles.sideItemTitle,
  itemSub: styles.sideItemSub,
  itemDate: styles.sideItemDate,
  bullets: styles.sideBullets,
  skillRow: styles.sideSkillRow,
  skillGroup: styles.sideSkillGroup,
  summary: styles.sideSummary,
  inlineList: styles.sideInlineList,
};

export default function CreativeSidebar({ content, settings }: TemplateProps) {
  const parts = contactParts(content.personal);

  return (
    <div className={styles.page} style={settingsToCssVars(settings)}>
      <aside className={styles.side}>
        <h1 className={styles.name}>{content.personal.fullName || "Your Name"}</h1>
        {content.personal.headline && <p className={styles.headline}>{content.personal.headline}</p>}
        {parts.length > 0 && (
          <div className={styles.contactBlock}>
            {parts.map((p, i) => (
              <p key={i}>
                <ContactText part={p} />
              </p>
            ))}
          </div>
        )}
        <StandardSections
          content={content}
          styles={sideStyles}
          only={(id) => SIDEBAR_SECTIONS.includes(id)}
        />
      </aside>
      <main className={styles.main}>
        <StandardSections
          content={content}
          styles={styles as unknown as SectionStyles}
          only={(id) => !SIDEBAR_SECTIONS.includes(id)}
        />
      </main>
    </div>
  );
}

import type { TemplateProps } from "@/templates/types";
import { settingsToCssVars } from "@/templates/types";
import { contactParts, ContactText } from "@/templates/shared/helpers";
import { StandardSections, type SectionStyles } from "@/templates/shared/standard-sections";
import styles from "./styles.module.css";

export default function CompactOne({ content, settings }: TemplateProps) {
  const parts = contactParts(content.personal);

  return (
    <div className={styles.page} style={settingsToCssVars(settings)}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.name}>{content.personal.fullName || "Your Name"}</h1>
          {content.personal.headline && <p className={styles.headline}>{content.personal.headline}</p>}
        </div>
        {parts.length > 0 && (
          <div className={styles.contact}>
            {parts.map((p, i) => (
              <p key={i}>
                <ContactText part={p} />
              </p>
            ))}
          </div>
        )}
      </header>
      <StandardSections content={content} styles={styles as SectionStyles} />
    </div>
  );
}

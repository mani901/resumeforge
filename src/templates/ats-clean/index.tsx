import type { TemplateProps } from "@/templates/types";
import { settingsToCssVars } from "@/templates/types";
import { contactParts, ContactText } from "@/templates/shared/helpers";
import { StandardSections, type SectionStyles } from "@/templates/shared/standard-sections";
import styles from "./styles.module.css";

export default function AtsClean({ content, settings }: TemplateProps) {
  const parts = contactParts(content.personal);

  return (
    <div className={styles.page} style={settingsToCssVars(settings)}>
      <header className={styles.header}>
        <h1 className={styles.name}>{content.personal.fullName || "Your Name"}</h1>
        {content.personal.headline && <p className={styles.headline}>{content.personal.headline}</p>}
        {parts.length > 0 && (
          <p className={styles.contact}>
            {parts.map((p, i) => (
              <span key={i}>
                {i > 0 && <span className={styles.contactSep}>·</span>}
                <ContactText part={p} />
              </span>
            ))}
          </p>
        )}
      </header>
      <StandardSections content={content} styles={styles as SectionStyles} />
    </div>
  );
}

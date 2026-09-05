import type { CSSProperties } from "react";
import type { Personal, TemplateSettings } from "@/lib/schemas/resume";
import { settingsToCssVars } from "@/templates/types";
import { contactParts, ContactText } from "@/templates/shared/helpers";
import { renderInline } from "@/templates/shared/inline";
import styles from "./styles.module.css";

export interface CoverLetterDocProps {
  personal: Personal | null;
  settings: TemplateSettings;
  body: string;
  date?: string;
}

export function CoverLetterDoc({ personal, settings, body, date }: CoverLetterDocProps) {
  const parts = personal ? contactParts(personal) : [];

  return (
    <div className={styles.page} style={settingsToCssVars(settings) as CSSProperties}>
      <header className={styles.header}>
        <h1 className={styles.name}>{personal?.fullName || "Your Name"}</h1>
        {personal?.headline && <p className={styles.headline}>{personal.headline}</p>}
        {parts.length > 0 && (
          <div className={styles.contact}>
            {parts.map((p, i) => (
              <span key={i}>
                <ContactText part={p} />
              </span>
            ))}
          </div>
        )}
      </header>
      {date && <p className={styles.meta}>{date}</p>}
      <div className={styles.body}>{body ? renderInline(body) : "Your cover letter will appear here…"}</div>
    </div>
  );
}

import type { ResumeContent, SectionId } from "@/lib/schemas/resume";
import {
  SECTION_TITLES,
  ContactText,
  formatDateRange,
  linkPart,
  nonEmptyBullets,
  visibleSections,
} from "@/templates/shared/helpers";

export type SectionStyles = Record<
  | "section"
  | "sectionTitle"
  | "item"
  | "itemHeader"
  | "itemTitle"
  | "itemSub"
  | "itemDate"
  | "bullets"
  | "skillRow"
  | "skillGroup"
  | "summary"
  | "inlineList",
  string
>;

function Bullets({ items, styles }: { items: string[]; styles: SectionStyles }) {
  const bullets = nonEmptyBullets(items);
  if (!bullets.length) return null;
  return (
    <ul className={styles.bullets}>
      {bullets.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

export function StandardSection({
  id,
  content,
  styles,
}: {
  id: SectionId;
  content: ResumeContent;
  styles: SectionStyles;
}) {
  const s = content.sections;

  const section = (title: string, key: string, children: React.ReactNode) => (
    <section key={key} className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );

  switch (id) {
    case "summary":
      return section(SECTION_TITLES.summary, id, <p className={styles.summary}>{s.summary}</p>);
    case "experience":
      return section(
        SECTION_TITLES.experience,
        id,
        s.experience.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span>
                <span className={styles.itemTitle}>{item.role}</span>
                {item.company && <span className={styles.itemSub}>, {item.company}</span>}
                {item.location && <span> — {item.location}</span>}
              </span>
              <span className={styles.itemDate}>
                {formatDateRange(item.startDate, item.endDate, item.current)}
              </span>
            </div>
            <Bullets items={item.bullets} styles={styles} />
          </div>
        ))
      );
    case "education":
      return section(
        SECTION_TITLES.education,
        id,
        s.education.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span>
                <span className={styles.itemTitle}>{item.degree}</span>
                {item.institution && <span className={styles.itemSub}>, {item.institution}</span>}
                {item.location && <span> — {item.location}</span>}
              </span>
              <span className={styles.itemDate}>{formatDateRange(item.startDate, item.endDate)}</span>
            </div>
            {item.details && <p>{item.details}</p>}
          </div>
        ))
      );
    case "skills":
      return section(
        SECTION_TITLES.skills,
        id,
        s.skills.map((group) => (
          <p key={group.id} className={styles.skillRow}>
            {group.group && <span className={styles.skillGroup}>{group.group}: </span>}
            {group.items.join(", ")}
          </p>
        ))
      );
    case "projects":
      return section(
        SECTION_TITLES.projects,
        id,
        s.projects.map((item) => {
          const link = linkPart(item.link);
          return (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span>
                  <span className={styles.itemTitle}>{item.name}</span>
                  {item.tech.length > 0 && <span className={styles.itemSub}> — {item.tech.join(", ")}</span>}
                </span>
                {link && (
                  <span className={styles.itemDate}>
                    <ContactText part={link} />
                  </span>
                )}
              </div>
              {item.description && <p>{item.description}</p>}
              <Bullets items={item.bullets} styles={styles} />
            </div>
          );
        })
      );
    case "certifications":
      return section(
        SECTION_TITLES.certifications,
        id,
        s.certifications.map((item) => (
          <div key={item.id} className={styles.itemHeader}>
            <span>
              <span className={styles.itemTitle}>{item.name}</span>
              {item.issuer && <span className={styles.itemSub}>, {item.issuer}</span>}
            </span>
            <span className={styles.itemDate}>{item.date}</span>
          </div>
        ))
      );
    case "languages":
      return section(
        SECTION_TITLES.languages,
        id,
        <div className={styles.inlineList}>
          {s.languages.map((item) => (
            <span key={item.id}>
              <span className={styles.itemTitle}>{item.name}</span>
              {item.level && <span> ({item.level})</span>}
            </span>
          ))}
        </div>
      );
    case "custom":
      return (
        <>
          {s.custom
            .filter((cs) => cs.items.length > 0)
            .map((cs) =>
              section(
                cs.title,
                cs.id,
                cs.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <span>
                        <span className={styles.itemTitle}>{item.heading}</span>
                        {item.subheading && <span className={styles.itemSub}>, {item.subheading}</span>}
                      </span>
                      <span className={styles.itemDate}>{item.date}</span>
                    </div>
                    <Bullets items={item.bullets} styles={styles} />
                  </div>
                ))
              )
            )}
        </>
      );
  }
}

export function StandardSections({
  content,
  styles,
  only,
}: {
  content: ResumeContent;
  styles: SectionStyles;
  only?: (id: SectionId) => boolean;
}) {
  const ids = visibleSections(content).filter((id) => (only ? only(id) : true));
  return (
    <>
      {ids.map((id) => (
        <StandardSection key={id} id={id} content={content} styles={styles} />
      ))}
    </>
  );
}

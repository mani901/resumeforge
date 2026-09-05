import { z } from "zod";

export const jdKeywordsSchema = z.object({
  hardSkills: z.array(z.object({ term: z.string(), synonyms: z.array(z.string()) })),
  titles: z.array(z.string()),
  qualifications: z.array(z.string()),
  softSkills: z.array(z.string()),
});

export type JdKeywords = z.infer<typeof jdKeywordsSchema>;

export interface CategoryResult {
  matched: string[];
  missing: string[];
}

export interface AtsScoreResult {
  score: number;
  hardSkills: CategoryResult;
  titles: CategoryResult;
  qualifications: CategoryResult;
  softSkills: CategoryResult;
}

const WEIGHTS = { hardSkills: 0.5, titles: 0.2, qualifications: 0.2, softSkills: 0.1 };

function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function termMatches(haystack: string, term: string): boolean {
  const t = normalize(term).trim();
  if (!t) return false;
  if (haystack.includes(` ${t} `)) return true;
  // light stemming: match plural/singular variants
  if (t.endsWith("s") && haystack.includes(` ${t.slice(0, -1)} `)) return true;
  return haystack.includes(` ${t}s `);
}

function scoreCategory(
  resumeText: string,
  terms: { display: string; variants: string[] }[]
): { result: CategoryResult; ratio: number } {
  const matched: string[] = [];
  const missing: string[] = [];
  for (const { display, variants } of terms) {
    if (variants.some((v) => termMatches(resumeText, v))) matched.push(display);
    else missing.push(display);
  }
  const total = matched.length + missing.length;
  return { result: { matched, missing }, ratio: total === 0 ? 1 : matched.length / total };
}

export function computeAtsScore(resumeText: string, keywords: JdKeywords): AtsScoreResult {
  const text = normalize(resumeText);

  const hard = scoreCategory(
    text,
    keywords.hardSkills.map((k) => ({ display: k.term, variants: [k.term, ...k.synonyms] }))
  );
  const titles = scoreCategory(text, keywords.titles.map((t) => ({ display: t, variants: [t] })));
  const quals = scoreCategory(
    text,
    keywords.qualifications.map((q) => ({ display: q, variants: [q] }))
  );
  const soft = scoreCategory(text, keywords.softSkills.map((s) => ({ display: s, variants: [s] })));

  const score = Math.round(
    100 *
      (hard.ratio * WEIGHTS.hardSkills +
        titles.ratio * WEIGHTS.titles +
        quals.ratio * WEIGHTS.qualifications +
        soft.ratio * WEIGHTS.softSkills)
  );

  return {
    score,
    hardSkills: hard.result,
    titles: titles.result,
    qualifications: quals.result,
    softSkills: soft.result,
  };
}

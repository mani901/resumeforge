import { z } from "zod";

export const tailorSuggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      kind: z.enum(["summary", "bullet"]),
      section: z.enum(["experience", "projects"]).optional(),
      itemId: z.string().optional(),
      bulletIndex: z.number().int().optional(),
      original: z.string(),
      proposed: z.string(),
      rationale: z.string(),
    })
  ),
});

export type TailorSuggestions = z.infer<typeof tailorSuggestionsSchema>;
export type TailorSuggestion = TailorSuggestions["suggestions"][number];

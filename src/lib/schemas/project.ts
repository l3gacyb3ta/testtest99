import { z } from "zod"
import { boundedText, httpsUrl, phaseSchema } from "@/lib/schemas/common"

export const projectUpdateSchema = z
  .object({
    title: boundedText(120, 1).optional(),
    description: boundedText(4000).optional(),
    githubRepo: httpsUrl.nullable().optional(),
    coverImageKey: z.string().max(500).nullable().optional(),
    artifactLinks: z.array(z.object({ label: boundedText(80, 1), url: httpsUrl })).max(10).optional(),
    /**
     * The tier the participant is ASKING for. Never the assigned one: that is
     * a reviewer's decision at design approval, because it is parts money.
     */
    requestedTier: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  })
  .strict()

export const submitSchema = z
  .object({
    phase: phaseSchema,
    notes: boundedText(4000).optional(),
  })
  .strict()

export const unsubmitSchema = z.object({ phase: phaseSchema }).strict()

export const hackatimeLinkSchema = z
  .object({
    hackatimeProject: boundedText(200, 1),
    phase: phaseSchema.default("BUILD"),
  })
  .strict()

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>

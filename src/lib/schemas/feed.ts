import { z } from "zod"
import { PostKind } from "@/app/generated/prisma/enums"
import { boundedText, cuid } from "@/lib/schemas/common"

/**
 * Object keys are shape-checked here and OWNERSHIP-checked in lib/feed.ts.
 * This only rejects the obviously malformed; whether the key belongs to the
 * person posting is a question the database has to answer, not a regex.
 */
const objectKey = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .regex(/^[A-Za-z0-9/_.-]+$/, "Not a valid object key")

export const createPostSchema = z
  .object({
    kind: z.enum(PostKind).default(PostKind.FREEFORM),
    caption: boundedText(2000),
    objectKey,
    thumbnailKey: objectKey.nullish(),
    themeProjectId: cuid.nullish(),
    contentType: boundedText(100).nullish(),
    byteSize: z.number().int().min(0).nullish(),
    durationSeconds: z.number().int().min(0).max(24 * 3600).nullish(),
    width: z.number().int().min(0).max(20000).nullish(),
    height: z.number().int().min(0).max(20000).nullish(),
  })
  .strict()

export const likeSchema = z.object({ liked: z.boolean() }).strict()

export const commentSchema = z.object({ body: boundedText(1000, 1) }).strict()

export const moderatePostSchema = z
  .object({ reason: boundedText(1000, 1) })
  .strict()

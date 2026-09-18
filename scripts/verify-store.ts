import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/app/generated/prisma/client"
import { Phase, PhaseStatus, PostKind, PostStatus, Theme } from "../src/app/generated/prisma/enums"

/**
 * End-to-end check of the seam between the database and the trail.
 *
 * The platform derives its whole shape from one map of checkpoint states. If
 * that map is built wrong, nothing throws and nothing fails to compile — the
 * trail just quietly tells someone they have not done work they have done, or
 * the reverse. So the mapping is asserted rather than trusted:
 *
 * 1. The Nth journal entry on the trail is the Nth session written, in order.
 * 2. A reel ticks the node it was posted for and NOT the others — the 10h and
 *    the 20h reel are both PROGRESS, so anything that counts by kind marks the
 *    20h node done the moment the 10h one lands.
 * 3. Hours that never passed through a journal entry (Hackatime, reviewer
 *    adjustments) reach the week's total without moving an entry node, because
 *    progress reels are placed where the JOURNAL crossed ten hours.
 * 4. A project nobody has named is not listed as one, but its id is still
 *    available to write to — the five rows exist from signup.
 *
 * Run with `pnpm verify:store` against a scratch database.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
})

let failures = 0
function check(label: string, actual: unknown, expected: unknown) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected)
  if (!pass) failures++
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
  )
}

async function main() {
  const { getStoreSnapshot } = await import("../src/lib/queries/store")
  const { materializeThemeProjects } = await import("../src/lib/provisioning")

  const stamp = Date.now()
  const user = await prisma.user.create({
    data: {
      email: `store-check-${stamp}@example.test`,
      name: "Store Check",
      verificationStatus: "verified",
      joinedProgramAt: new Date(),
    },
  })

  const made = await materializeThemeProjects(user.id)
  check("signup provisions every theme", made, 5)

  const pcb = await prisma.themeProject.findFirstOrThrow({
    where: { userId: user.id, theme: Theme.PCB },
  })

  // Nothing named yet: the row exists, but the trail must not claim it.
  const blank = await getStoreSnapshot(user.id)
  check("an unnamed project is not listed", blank.projects.length, 0)
  check("but its id is available to write to", blank.projectIdByWeek[1], pcb.id)
  check("no checkpoints are done", Object.keys(blank.progress).length, 0)

  await prisma.themeProject.update({
    where: { id: pcb.id },
    data: { title: "Macropad", description: "Three keys.", requestedTier: 2 },
  })

  // Three sessions, written in order. Their order IS the node order.
  for (const [index, hours] of [1.5, 2, 3].entries()) {
    await prisma.workSession.create({
      data: {
        themeProjectId: pcb.id,
        phase: Phase.DESIGN,
        title: `Session ${index + 1}`,
        content: `Body ${index + 1}`,
        hoursClaimed: hours,
        effectiveDate: "2026-09-10",
        createdAt: new Date(stamp + index * 1000),
      },
    })
  }

  // Two reels, on nodes that are ten hours apart. Only one has been earned,
  // and counting by kind would tick both.
  await prisma.post.create({
    data: {
      userId: user.id,
      themeProjectId: pcb.id,
      kind: PostKind.PROGRESS,
      caption: "Ten hours in.",
      objectKey: `posts/${user.id}/a.mp4`,
      checkpointKey: "w1-reel-1",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  })

  // Time that never passed through a journal entry.
  await prisma.hackatimeLink.create({
    data: {
      themeProjectId: pcb.id,
      phase: Phase.DESIGN,
      hackatimeProject: "macropad",
      cachedSeconds: 7200,
    },
  })

  const snap = await getStoreSnapshot(user.id)

  check("the named project is listed", snap.projects.length, 1)
  check("at the week its theme is designed in", snap.projects[0]?.weekId, 1)
  check("with the tier they asked for", snap.projects[0]?.tier, 2)

  check("entry 1 is the first session written", snap.progress["w1-entry-1"]?.minutes, 90)
  check("entry 2 is the second", snap.progress["w1-entry-2"]?.minutes, 120)
  check("entry 3 is the third", snap.progress["w1-entry-3"]?.minutes, 180)
  check("and there is no fourth", snap.progress["w1-entry-4"], undefined)

  check("the reel ticks its own node", snap.progress["w1-reel-1"]?.done, true)
  check("and not the next one", snap.progress["w1-reel-2"], undefined)
  check("nor the idea reel", snap.progress["w1-reel-idea"], undefined)

  // 2h of Hackatime, none of it in an entry.
  check("off-book hours reach the week", snap.offBookHours[1], 2)
  check("without inventing an entry", snap.progress["w1-entry-4"], undefined)

  check("the week is not submitted", snap.progress["w1-submit"], undefined)

  await prisma.phaseSubmission.create({
    data: { themeProjectId: pcb.id, phase: Phase.DESIGN },
  })
  await prisma.themeProject.update({
    where: { id: pcb.id },
    data: { designStatus: PhaseStatus.in_review },
  })

  const submitted = await getStoreSnapshot(user.id)
  check("submitting ticks the submit node", submitted.progress["w1-submit"]?.done, true)
  // The build half of the same theme is week 6 and must stay untouched: one
  // project, two weeks, and a design submission is not a build submission.
  check("but not the build week's", submitted.progress["w6-submit"], undefined)

  await prisma.user.delete({ where: { id: user.id } })

  console.log(failures === 0 ? "\nAll store checks passed." : `\n${failures} check(s) failed.`)
  process.exitCode = failures === 0 ? 0 : 1
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

import prisma from "@/lib/prisma"
import { requireSessionPage } from "@/lib/page-guards"
import { hasPermission, Permission } from "@/lib/permissions"
import { getFeed } from "@/lib/feed"
import { getThemeDef } from "@/lib/config/program"
import { isUploadConfigured } from "@/lib/uploads/r2"
import { Callout, PageHeader, Panel } from "@/app/components/ui"
import { Doomscroller, type Reel } from "@/app/components/forms/Doomscroller"
import { PostComposer } from "@/app/components/forms/PostComposer"

export const dynamic = "force-dynamic"

/**
 * Dates cross to the client as ISO strings rather than Date objects, so the
 * shape the component receives is the shape it would get back from /api/feed
 * when it pages. One type on the client, one code path for rendering.
 */
function serialize(item: Awaited<ReturnType<typeof getFeed>>["items"][number]): Reel {
  return { ...item, publishedAt: item.publishedAt?.toISOString() ?? null }
}

export default async function FeedPage() {
  const { user, roles } = await requireSessionPage()

  const [feed, projects] = await Promise.all([
    getFeed(user.id, { limit: 10 }),
    prisma.themeProject.findMany({
      where: { userId: user.id, deletedAt: null },
      select: { id: true, theme: true, title: true },
    }),
  ])

  const uploadsReady = isUploadConfigured()

  return (
    <div className="hl-stack">
      <PageHeader
        title="The Doomscroller"
        subtitle="Short videos from everyone building this season."
      />

      {!uploadsReady ? (
        <Callout tone="warning">
          Uploads are not configured on this deployment, so reels cannot be posted or played.
          Set the S3_* variables and run <code>pnpm verify:uploads</code>.
        </Callout>
      ) : (
        <Panel title="Post a reel">
          <PostComposer
            canAnnounce={hasPermission(roles, Permission.MANAGE_FEED)}
            projects={projects.map((project) => ({
              id: project.id,
              label: `${getThemeDef(project.theme).label} — ${project.title}`,
            }))}
          />
        </Panel>
      )}

      {feed.pinned.length > 0 ? (
        <Panel title="From HQ">
          <Doomscroller initial={feed.pinned.map(serialize)} initialCursor={null} />
        </Panel>
      ) : null}

      <Doomscroller
        initial={feed.items.map(serialize)}
        initialCursor={feed.nextCursor}
      />
    </div>
  )
}

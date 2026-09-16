import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSessionPage } from "@/lib/page-guards"
import { getDashboard } from "@/lib/queries/dashboard"
import { getCheckpointTrack } from "@/lib/checkpoints"
import { needsOnboarding } from "@/lib/onboarding"
import { CREDIT_NAME_PLURAL, TOTAL_WEEKS } from "@/lib/config/program"
import { Badge, Callout, Panel, PageHeader, Stat, statusLabel, statusTone } from "@/app/components/ui"
import { CheckpointPath } from "@/app/components/ui/CheckpointPath"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { user } = await requireSessionPage()

  // The first checkpoint runs before the dashboard, as the comp has it. This
  // is deliberately not a layout-level check: /onboarding lives under the same
  // layout, and a redirect there would loop.
  if (await needsOnboarding(user.id)) redirect("/onboarding")

  const [data, track] = await Promise.all([
    getDashboard(user.id),
    getCheckpointTrack(user.id),
  ])

  return (
    <div className="hl-stack">
      {/*
        The week banner and its path are the dashboard, as the comp has it —
        the stat row and project list sit underneath as reference. Outside the
        ten scheduled weeks there is no track, so the page falls back to the
        plain header.
      */}
      {track ? (
        <>
          <div className="hl-banner">
            <div className="hl-banner-copy">
              <p className="hl-banner-week">
                Week {track.week}/{TOTAL_WEEKS}:
              </p>
              <p className="hl-banner-title">{track.headline}</p>
            </div>
            {/* The week's own illustration, as the comp has it. Decorative —
                the headline already names the theme. */}
            <Image
              className="hl-banner-art"
              src={track.themeArt}
              alt=""
              width={139}
              height={139}
              priority
            />
          </div>
          <CheckpointPath checkpoints={track.checkpoints} />
        </>
      ) : (
        <PageHeader
          title={`Week ${data.currentWeek || "—"} of ${TOTAL_WEEKS}`}
          subtitle={
            data.currentWeek === 0
              ? "The program has not started yet."
              : "Outside the scheduled weeks. You can still work on anything."
          }
        />
      )}

      <div className="hl-row">
        <Stat label={`${CREDIT_NAME_PLURAL} to spend`} value={data.balances.spendable} />
        <Stat label="Printer fund" value={data.balances.banked} />
        <Stat label="Day streak" value={data.streak} />
        <Stat label={`${CREDIT_NAME_PLURAL} earned`} value={data.earned} />
        <Stat
          label="Themes shipped"
          value={`${data.printer.shippedCount} / ${data.printer.required}`}
        />
      </div>

      {data.printer.qualified ? (
        <Callout>
          You have shipped all {data.printer.required} themes. The 3D printer is yours — spend
          your {CREDIT_NAME_PLURAL} on upgrades in the <Link href="/shop">shop</Link>.
        </Callout>
      ) : null}

      <div className="hl-grid">
        {data.cards.map((card) => (
          <Panel
            key={card.id}
            title={<Link href={`/dashboard/${card.slug}`}>{card.label}</Link>}
            actions={card.tier ? <Badge tone="success">Tier {card.tier}</Badge> : null}
          >
            <p className="hl-muted" style={{ margin: 0 }}>
              {card.title || card.blurb}
            </p>
            <div className="hl-row hl-mono" style={{ gap: "0.5rem" }}>
              <span>
                Design (wk {card.designWeek}){" "}
                <Badge tone={statusTone(card.designStatus)}>
                  {statusLabel(card.designStatus)}
                </Badge>
              </span>
            </div>
            <div className="hl-row hl-mono" style={{ gap: "0.5rem" }}>
              <span>
                Build (wk {card.buildWeek}){" "}
                <Badge tone={statusTone(card.buildStatus)}>{statusLabel(card.buildStatus)}</Badge>
              </span>
            </div>
            <p className="hl-hint" style={{ margin: 0 }}>
              {card.designHours}h design · {card.buildHours}h build
              {card.grantUsd !== null ? ` · $${card.grantUsd} granted` : ""}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  )
}

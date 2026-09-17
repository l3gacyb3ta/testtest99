import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSessionPage } from "@/lib/page-guards"
import { getDashboard } from "@/lib/queries/dashboard"
import { getProgrammePath } from "@/lib/checkpoints"
import { needsOnboarding } from "@/lib/onboarding"
import { CREDIT_NAME_PLURAL, TOTAL_WEEKS } from "@/lib/config/program"
import { Badge, Callout, Panel, PageHeader, Stat, statusLabel, statusTone } from "@/app/components/ui"
import { ProgrammePath } from "@/app/components/ui/ProgrammePath"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { user } = await requireSessionPage()

  // The first checkpoint runs before the dashboard, as the comp has it. This
  // is deliberately not a layout-level check: /onboarding lives under the same
  // layout, and a redirect there would loop.
  if (await needsOnboarding(user.id)) redirect("/onboarding")

  const [data, programme] = await Promise.all([
    getDashboard(user.id),
    getProgrammePath(user.id),
  ])

  const thisWeek = programme.weeks.find((w) => w.state === "current")

  return (
    <div className="hl-stack">
      {/*
        The week banner and its path are the dashboard, as the comp has it —
        the stat row and project list sit underneath as reference. Outside the
        ten scheduled weeks there is no track, so the page falls back to the
        plain header.
      */}
      {/*
        The banner names the week you are in; the path below is the whole
        programme, so you can scroll ahead and see what is coming.
      */}
      {thisWeek ? (
        <div className="hl-banner">
          <div className="hl-banner-copy">
            <p className="hl-banner-week">
              Week {thisWeek.week}/{TOTAL_WEEKS}:
            </p>
            <p className="hl-banner-title">{thisWeek.headline}</p>
          </div>
          <Image
            className="hl-banner-art"
            src={thisWeek.themeArt}
            alt=""
            width={139}
            height={139}
            priority
          />
        </div>
      ) : (
        <PageHeader
          title="The programme"
          subtitle={
            programme.currentWeek === 0
              ? "Half Life has not started yet. Here is the whole ten weeks."
              : "Outside the scheduled weeks. You can still work on anything."
          }
        />
      )}

      <ProgrammePath weeks={programme.weeks} currentWeek={programme.currentWeek} />

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

import { requirePermissionPage } from "@/lib/page-guards"
import { Permission } from "@/lib/permissions"
import { getProgramSettings, currentWeekNumber } from "@/lib/program"
import { findUnsyncedApprovals } from "@/lib/airtable/sync"
import { THEMES, TOTAL_WEEKS } from "@/lib/config/program"
import { TIERS } from "@/lib/config/tiers"
import { PRINTERS, submitFloorFor } from "@/lib/config/printers"
import { EmptyState, PageHeader, Panel, Table } from "@/app/components/ui"
import { ProgramSettingsForm } from "@/app/components/forms/ProgramSettingsForm"
import { ActionButton } from "@/app/components/forms/ActionButton"

export const dynamic = "force-dynamic"

export default async function AdminProgramPage() {
  await requirePermissionPage(Permission.MANAGE_PROGRAM)

  const [settings, week, unsynced] = await Promise.all([
    getProgramSettings(),
    currentWeekNumber(),
    findUnsyncedApprovals(),
  ])

  return (
    <div className="hl-stack">
      <PageHeader title="Program settings" subtitle={`Currently week ${week} of ${TOTAL_WEEKS}.`} />

      <Panel title="Settings">
        {/* These live in the database rather than env vars on purpose: stasis
            put its submission gate in an env var, nobody flipped it, and
            submissions stayed open for two weeks after the event ended. */}
        <ProgramSettingsForm
          initial={{
            eventStartDate: settings.eventStartDate.toISOString().slice(0, 10),
            programTimezone: settings.programTimezone,
            submissionsOpen: settings.submissionsOpen,
            shopOpen: settings.shopOpen,
            shopGraceDays: settings.shopGraceDays,
            reviewClaimTtlMinutes: settings.reviewClaimTtlMinutes,
            airtableSyncEnabled: settings.airtableSyncEnabled,
          }}
        />
      </Panel>

      <Panel title="Grant rows that never reached Airtable">
        {unsynced.length === 0 ? (
          <EmptyState>Everything approved has been pushed upstream.</EmptyState>
        ) : (
          <Table head={["Project", "Phase", ""]}>
            {unsynced.map((item) => (
              <tr key={`${item.themeProjectId}-${item.phase}`}>
                <td className="hl-mono">{item.themeProjectId}</td>
                <td>{item.phase.toLowerCase()}</td>
                <td>
                  <ActionButton
                    url={`/api/admin/theme-projects/${item.themeProjectId}/sync-to-airtable`}
                    body={{ phase: item.phase }}
                    label="Retry"
                  />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Schedule">
        <Table head={["Theme", "Design week", "Build week"]}>
          {THEMES.map((theme) => (
            <tr key={theme.slug}>
              <td>{theme.label}</td>
              <td>{theme.designWeek}</td>
              <td>{theme.buildWeek}</td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Tiers">
        {/* Tier values are code, not data: editing them is a pull request, and
            every review freezes the numbers it used, so changing them never
            rewrites anyone's history. */}
        <Table head={["Tier", "Grant", "Funded hours", "Submit floor"]}>
          {TIERS.map((tier) => (
            <tr key={tier.id}>
              <td>{tier.name}</td>
              <td>${tier.grantUsd}</td>
              <td>{tier.fundingHours}h</td>
              <td>{submitFloorFor(tier.fundingHours)}h</td>
            </tr>
          ))}
        </Table>
        <p className="hl-hint">
          Edit these in <code>lib/config/tiers.ts</code>. Funded hours buy parts.
          The submit floor is the funded hours plus enough banking to keep the
          cheapest machine reachable — hand a week in under it and the season
          cannot end in a printer.
        </p>

        <h2>Printer goals</h2>
        <Table head={["Printer", "Coins", "Banked hours / design week", "Tier 1 ask"]}>
          {PRINTERS.map((printer) => (
            <tr key={printer.id}>
              <td>{printer.name}</td>
              <td>{printer.coins}</td>
              <td>{printer.bankedHours}h</td>
              <td>{printer.hoursPerWeek}h</td>
            </tr>
          ))}
        </Table>
        <p className="hl-hint">
          Banking is paced by the machine, not the tier: every tier banks the
          same hours for the same printer. Edit these in{" "}
          <code>lib/config/printers.ts</code>, which is the budget spreadsheet
          transcribed — the season lands exactly on each price.
        </p>
      </Panel>
    </div>
  )
}

import Image from "next/image"
import Link from "next/link"
import { requireSessionPage } from "@/lib/page-guards"
import { hasAnyPermission, Permission } from "@/lib/permissions"
import { getShell } from "@/lib/queries/shell"
import { CREDIT_NAME_PLURAL } from "@/lib/config/program"
import { Avatar } from "@/app/components/ui"
import { SidebarNav, type NavLink } from "@/app/components/ui/SidebarNav"
import { LogOutButton } from "@/app/components/forms/LogOutButton"
import { DoomscrollerRail } from "@/app/components/forms/DoomscrollerRail"
import { WobbleBorder } from "@/app/components/ui/Wobble"

export const dynamic = "force-dynamic"

/**
 * The app shell, built to the comp's [ MAIN PAGE ] frames.
 *
 * Three columns: the sidebar of outlined cards, the content well (separated by
 * the hairline the comp runs down the page), and the Doomscroller rail. The
 * rail is part of the chrome rather than a page, because the comp puts it on
 * every screen.
 *
 * The session gate stays here, in a server component. Doing it client-side (as
 * stasis does) means an unauthorised page renders first and then disappears.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, roles } = await requireSessionPage()
  const shell = await getShell(user.id)

  const canReview = hasAnyPermission(roles, [Permission.REVIEW_SUBMISSIONS])
  const canAdmin = hasAnyPermission(roles, [
    Permission.VIEW_USERS,
    Permission.MANAGE_SHOP,
    Permission.FULFILL_ORDERS,
    Permission.VIEW_AUDIT_LOG,
    Permission.MANAGE_PROGRAM,
  ])

  const links: NavLink[] = [
    { href: "/dashboard", label: "Home" },
    { href: "/feed", label: "Explore" },
    { href: "/shop", label: "Shop" },
    ...(canReview ? [{ href: "/review", label: "Review" }] : []),
    ...(canAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <div className="hl-app hl-app--with-rail">
      <aside className="hl-sidebar">
        <Link href="/dashboard" className="hl-brand" aria-label="Half-Life home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark.svg" alt="" width={56} height={50} />
        </Link>

        <nav className="hl-card hl-nav-card hl-wobbly" aria-label="Main">
          <WobbleBorder seed={1} />
          <span className="hl-nav-tab" aria-hidden="true" />
          <SidebarNav links={links} />
        </nav>

        <section
          className="hl-card hl-stack hl-stack--tight hl-wobbly hl-card--mascot"
          aria-label="Printer progress"
        >
          <WobbleBorder seed={2} />
          <Image
            className="hl-card-mascot"
            src="/brand/gato/boxx.png"
            alt=""
            width={108}
            height={129}
            aria-hidden="true"
          />
          <Link href="/shop" className="hl-label">
            View more
          </Link>
          <p style={{ margin: 0 }}>
            You&rsquo;re on track
            <br />
            to get a <strong>{shell.printer.label}</strong>!
          </p>
          <div
            className="hl-progress"
            role="progressbar"
            aria-valuenow={shell.printer.have}
            aria-valuemin={0}
            aria-valuemax={shell.printer.price}
            aria-label={`${shell.printer.have} of ${shell.printer.price} ${CREDIT_NAME_PLURAL} toward ${shell.printer.label}`}
          >
            <div className="hl-progress-fill" style={{ width: `${shell.printer.percent}%` }} />
          </div>
          <span className="hl-progress-label">
            {shell.printer.have}/{shell.printer.price}
          </span>
        </section>

        <section className="hl-card hl-row hl-wobbly" aria-label="Account">
          <WobbleBorder seed={3} />
          <Avatar src={shell.user.image} />
          <div className="hl-stack hl-stack--tight" style={{ gap: "0.35rem" }}>
            <strong className="hl-account-name">{shell.user.name ?? user.email}</strong>
            <LogOutButton />
          </div>
        </section>
      </aside>

      <main className="hl-main">
        <div className="hl-counters" style={{ justifyContent: "flex-end" }}>
          <span className="hl-counter hl-counter--coin" title={`${CREDIT_NAME_PLURAL} to spend`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/coin.svg" alt="" className="hl-counter-icon" />
            {shell.coins}
          </span>
          <span className="hl-counter hl-counter--flame" title="Day streak">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/flame.svg" alt="" className="hl-counter-icon" />
            {shell.streak}
          </span>
        </div>
        {children}
      </main>

      <DoomscrollerRail />
    </div>
  )
}

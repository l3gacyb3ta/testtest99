"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavLink {
  href: string
  label: string
}

/**
 * The sidebar's nav list.
 *
 * A client component only because the comp marks the current page by DIMMING
 * it — "Home" sits at 40% opacity on the Explore screen — which needs the
 * active path. Everything else in the sidebar stays on the server.
 */
export function SidebarNav({ links }: Readonly<{ links: readonly NavLink[] }>) {
  const pathname = usePathname()

  return (
    <ul className="hl-nav-list">
      {links.map((link) => {
        const current =
          pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={`hl-nav-item${current ? " hl-nav-item--current" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

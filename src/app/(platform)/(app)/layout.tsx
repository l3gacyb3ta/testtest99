import { requireSessionPage } from "@/lib/page-guards"
import { AppShell } from "@/components/platform/shell/AppShell"
import { StoreProvider } from "@/lib/store"

/**
 * Everything a participant sees: the trail, their projects, the shop, the
 * Doomscroller and the reference pages, all inside the one shell.
 *
 * The group exists to draw the line at the shell rather than at the design
 * system. `/login` wants the tokens and none of the chrome, and a reviewer
 * working through a queue wants neither the trail's sidebar nor a store
 * describing a programme they are not enrolled in.
 *
 * The session gate lives here, in a server component, and is the real one —
 * the cookie check in `proxy.ts` only decides which page to render at `/`.
 * Gating client-side would render the trail first and then take it away.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSessionPage()

  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  )
}

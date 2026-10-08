import { logout } from "@/app/actions";
import type { Session } from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { NavLink } from "./NavLink";
import { Logo } from "./ui";

export function AppShell({
  session,
  children,
  wide = false,
}: {
  session: Session;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const owner = session.role === "owner";
  const home = owner ? "/dashboard" : "/technician";
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Naar hoofdinhoud
      </a>
      <header className="border-b border-line bg-surface print:hidden">
        <div className={`mx-auto flex h-14 items-center justify-between gap-2 px-4 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <div className="flex min-w-0 items-center gap-5">
            <Logo href={home} />
            <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-1 md:flex">
              {owner ? (
                <>
                  <NavLink href="/dashboard" except={["/dashboard/agenda", "/dashboard/revenue", "/dashboard/settings"]}>
                    Aanvragen
                  </NavLink>
                  <NavLink href="/dashboard/agenda">Agenda</NavLink>
                  <NavLink href="/dashboard/revenue">Omzet</NavLink>
                  <NavLink href="/dashboard/settings">Instellingen</NavLink>
                </>
              ) : (
                <>
                  <NavLink href="/technician" except={["/technician/agenda"]}>
                    Mijn bezoeken
                  </NavLink>
                  <NavLink href="/technician/agenda">Agenda</NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <span className="hidden text-muted lg:inline">
              {owner ? "Eigenaar" : `${session.name} · Monteur`}
            </span>
            <form action={logout}>
              <button type="submit" className="min-h-11 rounded-md px-2.5 font-medium text-muted hover:bg-slate-100 hover:text-foreground">
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>
      <main
        id="main"
        className={`mx-auto w-full min-w-0 flex-1 px-4 py-6 sm:py-8 pb-24 md:pb-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}
      >
        {children}
      </main>
      <BottomNav role={owner ? "owner" : "technician"} />
    </>
  );
}

import { type ComponentType } from "react";
import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { FlaskConical, ScrollText, Warehouse } from "lucide-react";
import { missionDefinitions } from "@/lib/missions";
import { ShopPage } from "@/pages/shop-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { MissionsPage } from "@/pages/missions-page";
import { useMissionStage } from "@/lib/mission-stage";

const rootRoute = createRootRoute({
  component: RootLayout
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ShopPage
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage
});

const missionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/missions",
  component: MissionsPage
});

const routeTree = rootRoute.addChildren([shopRoute, dashboardRoute, missionsRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent"
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RootLayout() {
  const { stage, setStage } = useMissionStage();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(22,163,74,0.12),transparent_35%),radial-gradient(circle_at_100%_20%,rgba(245,158,11,0.2),transparent_35%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
        <header className="magic-panel rounded-2xl border border-border/70 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-2xl md:text-3xl">Moonroot & Ember - Potion Shop Control Room</p>
              <p className="text-sm text-muted-foreground">
                Mission-synced webshop for adventurers and inventory dashboard for potion masters.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mission</label>
              <select
                value={stage}
                onChange={(event) => setStage(Number.parseInt(event.target.value, 10))}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {missionDefinitions.map((mission) => (
                  <option key={mission.code} value={mission.stage}>
                    {mission.code} - {mission.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2">
            <NavPill to="/" label="Potion Shop" icon={FlaskConical} />
            <NavPill to="/dashboard" label="Inventory Dashboard" icon={Warehouse} />
            <NavPill to="/missions" label="Mission Progress" icon={ScrollText} />
          </nav>
        </header>

        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavPill({
  to,
  label,
  icon: Icon
}: {
  to: "/" | "/dashboard" | "/missions";
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{
        className: "bg-primary text-primary-foreground border-primary"
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

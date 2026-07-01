import { SignOutButton, useUser } from "@clerk/clerk-react";
import {
  ArrowClockwise,
  ChartBar,
  FilePlus,
  FileText,
  List,
  ListChecks,
  NotePencil,
  PresentationChart,
  SignOut,
  Sparkle,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { routes } from "../app/routes.js";
import { isTestAuthEnabled } from "../app/providers.js";
import { BrandLogo } from "../components/brand/brand-logo.js";
import { Button, buttonStyles } from "../components/ui/button.js";
import { useSyncCurrentUser } from "../features/auth/hooks/use-current-user.js";
import { cn } from "../lib/utils/cn.js";

const workspaceItems = [
  { label: "Forms", href: routes.dashboard, icon: FileText, end: true },
  { label: "Create with AI", href: routes.aiFormCreation, icon: Sparkle },
] as const;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const formId = getActiveFormId(location.pathname);
  const isEditor = location.pathname.endsWith("/editor");

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <UserBootstrap />
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-raised focus:px-4 focus:py-2 focus:shadow-panel"
        href="#app-main"
      >
        Skip to app content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border-subtle bg-sidebar lg:flex">
        <SidebarContent formId={formId} />
      </aside>

      <header className="sticky top-0 z-40 border-b border-border-subtle bg-raised/96 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <Link className={buttonStyles({ size: "sm" })} to={routes.aiFormCreation}>
              <FilePlus className="size-4" weight="regular" aria-hidden="true" />
              <span className="hidden sm:inline">Create form</span>
            </Link>
            <Button
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileOpen((open) => !open)}
              size="icon"
              type="button"
              variant="outline"
            >
              {mobileOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <List className="size-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
        {mobileOpen ? (
          <div className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border-subtle bg-sidebar p-3 shadow-panel">
            <SidebarNavigation formId={formId} />
            <div className="mt-3 border-t border-border-subtle pt-3">
              <SidebarAccount />
            </div>
          </div>
        ) : null}
      </header>

      <main
        className={cn(
          "w-full px-4 py-6 sm:px-6 sm:py-8 lg:ml-56 lg:w-[calc(100%-14rem)]",
          isEditor ? "lg:px-0 lg:py-0" : "mx-auto lg:px-8",
        )}
        id="app-main"
      >
        <div className={cn(!isEditor && "mx-auto w-full max-w-[90rem]")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ formId }: { formId?: string }) {
  return (
    <>
      <div className="flex h-[4.5rem] items-center border-b border-border-subtle px-4">
        <Brand />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <SidebarNavigation formId={formId} />
      </div>
      <div className="border-t border-border-subtle p-3">
        <SidebarAccount />
      </div>
    </>
  );
}

function SidebarNavigation({ formId }: { formId?: string }) {
  return (
    <nav aria-label="Application navigation">
      <p className="px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Workspace
      </p>
      <div className="mt-2 grid gap-1">
        {workspaceItems.map((item) => (
          <SidebarLink {...item} key={item.href} />
        ))}
      </div>

      {formId ? (
        <>
          <div className="my-5 border-t border-border-subtle" />
          <p className="px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Current form
          </p>
          <div className="mt-2 grid gap-1">
            <SidebarLink href={routes.formEditor(formId)} icon={NotePencil} label="Edit form" />
            <SidebarLink href={routes.responses(formId)} icon={ListChecks} label="Responses" />
            <SidebarLink href={routes.insights(formId)} icon={ChartBar} label="Insights" />
            <SidebarLink href={routes.reports(formId)} icon={PresentationChart} label="Reports" />
            <SidebarLink href={routes.ownerFormPreview(formId)} icon={FileText} label="Preview" />
          </div>
        </>
      ) : null}
    </nav>
  );
}

function SidebarLink({
  end,
  href,
  icon: IconComponent,
  label,
}: {
  end?: boolean;
  href: string;
  icon: Icon;
  label: string;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
          isActive
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )
      }
      end={end}
      to={href}
    >
      <IconComponent className="size-[1.125rem] shrink-0" weight="regular" aria-hidden="true" />
      {label}
    </NavLink>
  );
}

function Brand() {
  return (
    <Link aria-label="InsightForm dashboard" className="flex items-center" to={routes.dashboard}>
      <BrandLogo className="h-8 max-w-[9.25rem]" />
    </Link>
  );
}

function SidebarAccount() {
  const syncUser = useSyncCurrentUser();

  return (
    <div className="grid gap-1">
      <button
        className="flex min-h-10 items-center gap-3 rounded-md px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
        disabled={syncUser.isPending}
        onClick={() => syncUser.mutate()}
        type="button"
      >
        <ArrowClockwise
          className={cn("size-[1.125rem]", syncUser.isPending && "animate-spin")}
          aria-hidden="true"
        />
        Refresh workspace
      </button>
      {isTestAuthEnabled() ? null : (
        <SignOutButton>
          <button
            className="flex min-h-10 items-center gap-3 rounded-md px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            type="button"
          >
            <SignOut className="size-[1.125rem]" aria-hidden="true" />
            Sign out
          </button>
        </SignOutButton>
      )}
    </div>
  );
}

function getActiveFormId(pathname: string) {
  const match = pathname.match(/^\/app\/forms\/([^/]+)\//);
  return match?.[1] === "new" ? undefined : match?.[1];
}

function UserBootstrap() {
  if (isTestAuthEnabled()) {
    return <TestUserBootstrap />;
  }

  return <ClerkUserBootstrap />;
}

function ClerkUserBootstrap() {
  const syncUser = useSyncCurrentUser();
  const { isLoaded, isSignedIn } = useUser();
  const hasSyncedUser = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasSyncedUser.current) {
      return;
    }

    hasSyncedUser.current = true;
    syncUser.mutate();
  }, [isLoaded, isSignedIn, syncUser]);

  return null;
}

function TestUserBootstrap() {
  const syncUser = useSyncCurrentUser();
  const hasSyncedUser = useRef(false);

  useEffect(() => {
    if (hasSyncedUser.current) {
      return;
    }

    hasSyncedUser.current = true;
    syncUser.mutate();
  }, [syncUser]);

  return null;
}

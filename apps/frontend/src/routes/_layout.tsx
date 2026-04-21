import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/ThemeToggle";
import { History, Search, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  matchExact?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigationSections: NavSection[] = [
  {
    title: "Reddit Intelligence",
    items: [
      {
        title: "Tracker",
        url: "/tracker",
        icon: Search,
        matchExact: true,
      },
      {
        title: "History",
        url: "/history",
        icon: History,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

const AppSidebar = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (item: NavItem) => {
    if (item.matchExact) {
      return currentPath === item.url || currentPath === `${item.url}/`;
    }
    return currentPath.startsWith(item.url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Reddit Tracker</span>
            <span className="text-xs text-muted-foreground">by Decodo</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

function LayoutComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="max-h-svh min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

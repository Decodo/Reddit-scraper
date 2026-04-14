import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Activity, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_layout/dashboard")({
  component: DashboardPage,
});

const statCards = [
  { title: "Total Items", value: "0", icon: Package, description: "All items" },
  { title: "Active Users", value: "0", icon: Users, description: "This month" },
  { title: "Activity", value: "0", icon: Activity, description: "Last 7 days" },
  { title: "Growth", value: "0%", icon: TrendingUp, description: "vs last month" },
];

function DashboardPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome to your platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This is a boilerplate dashboard. Replace this content with your own.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add feature routes under <code className="text-foreground">src/routes/_layout/</code></li>
            <li>Add API hooks in <code className="text-foreground">src/features/&lt;feature&gt;/api/</code></li>
            <li>Add backend modules in <code className="text-foreground">apps/backend/src/features/</code></li>
            <li>Add shared types in <code className="text-foreground">apps/shared/src/types/</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

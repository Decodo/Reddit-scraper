import { createFileRoute } from "@tanstack/react-router";
import { ItemsList } from "@/features/items/components/ItemsList";

export const Route = createFileRoute("/_layout/items")({
  component: ItemsPage,
});

function ItemsPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Items</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your items</p>
      </div>
      <ItemsList />
    </div>
  );
}

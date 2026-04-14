import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useItemsQuery,
  useCreateItemMutation,
  useDeleteItemMutation,
} from "@/features/items/api/useItemsApi";

export const ItemsList = () => {
  const { data: items, isLoading } = useItemsQuery();
  const createItem = useCreateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const handleCreate = () => {
    createItem.mutate(
      { name: `Item ${Date.now()}`, description: "Example item" },
      { onSuccess: () => toast.success("Item created") }
    );
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id, {
      onSuccess: () => toast.success("Item deleted"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} disabled={createItem.isPending}>
          {createItem.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Item
        </Button>
      </div>

      {!items?.length ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            No items yet. Click "Add Item" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item._id)}
                  disabled={deleteItem.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

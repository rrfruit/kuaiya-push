import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { BulkActionsToolbar } from "@/components/data-table/bulk-actions";
import { ProxyWithCount, deleteProxies } from "@/api/proxy";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const queryClient = useQueryClient();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const deleteMutation = useMutation({
    mutationFn: deleteProxies,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
      table.resetRowSelection();
      toast.success(`已删除 ${data.count} 个代理`);
    },
    onError: (err) => {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误")
      );
    },
  });

  const handleBulkDelete = () => {
    const selectedProxies = selectedRows.map(
      (row) => row.original as ProxyWithCount
    );
    const ids = selectedProxies.map((proxy) => proxy.id);
    deleteMutation.mutate(ids);
  };

  return (
    <BulkActionsToolbar table={table} entityName="代理">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleBulkDelete}
            disabled={deleteMutation.isPending}
            className="size-8"
            aria-label="批量删除"
            title="批量删除"
          >
            <Trash2 />
            <span className="sr-only">批量删除</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>批量删除选中的代理</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  );
}

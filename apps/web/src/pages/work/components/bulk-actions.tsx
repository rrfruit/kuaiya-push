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
import { Work } from "@/types";
import { deleteWorks } from "@/api/work";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const queryClient = useQueryClient();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const deleteMutation = useMutation({
    mutationFn: deleteWorks,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      table.resetRowSelection();
      toast.success(`已删除 ${data.count} 个作品`);
    },
    onError: (err) => {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误")
      );
    },
  });

  const handleBulkDelete = () => {
    const selectedWorks = selectedRows.map((row) => row.original as Work);
    const ids = selectedWorks.map((work) => work.id);
    deleteMutation.mutate(ids);
  };

  return (
    <BulkActionsToolbar table={table} entityName="作品">
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
          <p>批量删除选中的作品</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  );
}

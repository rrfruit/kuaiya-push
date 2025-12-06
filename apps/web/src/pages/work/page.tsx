import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getWorks, deleteWork } from "@/api/work";
import { columns } from "./components/columns";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
import { PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { WorkDialog } from "./components/work-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { WorksProvider, useWorks } from "./components/works-provider";
import { DataTableBulkActions } from "./components/bulk-actions";

const QUERY_KEY = "works";

function WorkContent() {
  const queryClient = useQueryClient();
  const { open, setOpen, currentRow, setCurrentRow } = useWorks();

  // 获取作品列表
  const {
    data: works = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getWorks,
  });

  // 删除操作
  const deleteMutation = useMutation({
    mutationFn: deleteWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("作品已删除");
      setOpen(null);
      setCurrentRow(null);
    },
    onError: (err) => {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误"),
      );
    },
  });

  const filters = [
    {
      columnId: "type",
      title: "类型",
      options: [
        { label: "文本", value: "TEXT" },
        { label: "图片", value: "IMAGE" },
        { label: "视频", value: "VIDEO" },
      ],
    },
  ];

  // 客户端表格
  const table = useReactTable({
    data: works,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">作品管理</h2>
          <p className="text-muted-foreground">管理你的作品内容。</p>
        </div>
        <Button size="sm" onClick={() => setOpen("create")}>
          <PlusIcon className="h-4 w-4" />
          创建作品
        </Button>
      </div>

      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="title"
          searchPlaceholder="搜索作品..."
          filters={filters}
        />
        <DataTable
          table={table}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
        />
        <DataTablePagination table={table} />
        <DataTableBulkActions table={table} />
      </div>

      <WorkDialog
        open={open === "create" || open === "update"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        work={open === "update" ? currentRow : null}
      />

      <ConfirmDialog
        open={open === "delete"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        title="确认删除作品?"
        desc={`您确定要删除作品 "${currentRow?.title}" 吗？此操作无法撤销。`}
        confirmText="删除"
        destructive
        handleConfirm={() => currentRow && deleteMutation.mutate(currentRow.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function WorkPage() {
  return (
    <WorksProvider>
      <WorkContent />
    </WorksProvider>
  );
}

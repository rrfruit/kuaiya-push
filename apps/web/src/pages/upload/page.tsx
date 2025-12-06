import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { getUploadFiles, deleteUploadFile } from "@/api/upload";
import { columns } from "./components/columns";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
import { Upload } from "lucide-react";
import { FileTypeEnum } from "@/types/enum";
import { Button } from "@repo/ui/components/ui/button";
import { UploadDialog } from "./components/upload-dialog";
import { PreviewDialog } from "./components/preview-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { DataTableBulkActions } from "./components/bulk-actions";
import { TasksProvider, useTasks } from "./components/tasks-provider";

const QUERY_KEY = "uploadFiles";

function UploadContent() {
  const queryClient = useQueryClient();
  const { open, setOpen, currentRow, setCurrentRow } = useTasks();

  // 获取数据
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getUploadFiles,
  });

  // 删除操作
  const deleteMutation = useMutation({
    mutationFn: deleteUploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("文件已删除");
      setOpen(null);
      setCurrentRow(null);
    },
    onError: (err) => {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误"),
      );
    },
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filters = [
    {
      columnId: "type",
      title: "类型",
      options: [
        { label: "图片", value: FileTypeEnum.IMAGE },
        { label: "视频", value: FileTypeEnum.VIDEO },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">文件管理</h2>
          <p className="text-muted-foreground">管理上传的图片和视频文件。</p>
        </div>
        <Button size="sm" onClick={() => setOpen("create")}>
          <Upload className="mr-2 h-4 w-4" />
          上传文件
        </Button>
      </div>

      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder="搜索文件名..."
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

      <UploadDialog
        open={open === "create"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
          }
        }}
      />

      <PreviewDialog
        open={open === "preview"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        file={currentRow}
      />

      <ConfirmDialog
        open={open === "delete"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        title="确认删除文件?"
        desc={`您确定要删除文件 "${currentRow?.filename}" 吗？此操作无法撤销。`}
        confirmText="删除"
        destructive
        handleConfirm={() => currentRow && deleteMutation.mutate(currentRow.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function UploadPage() {
  return (
    <TasksProvider>
      <UploadContent />
    </TasksProvider>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUploadFiles, deleteUploadFile } from "@/api/upload";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Loader2, Upload } from "lucide-react";
import { FileTypeEnum } from "@/types/enum";
import { FileType } from "@/types";
import { Button } from "@repo/ui/components/ui/button";
import { UploadDialog } from "./upload-dialog";
import { PreviewDialog } from "./preview-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { UploadFile } from "@/types";
import { PaginationState, ColumnFiltersState } from "@tanstack/react-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [deleteFileData, setDeleteFileData] = useState<UploadFile | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  // 服务端搜索和过滤状态
  const [searchValue, setSearchValue] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // 防抖搜索值
  const debouncedSearchValue = useDebouncedValue(searchValue, 300);
  
  // 从 columnFilters 中提取 type 过滤值
  const typeFilter = columnFilters.find(f => f.id === "type");
  const typeValue = typeFilter?.value as string[] | undefined;
  const selectedType = typeValue && typeValue.length === 1 ? typeValue[0] as FileType : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["uploadFiles", pagination.pageIndex, pagination.pageSize, debouncedSearchValue, selectedType],
    queryFn: () => getUploadFiles({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      filename: debouncedSearchValue || undefined,
      type: selectedType,
    }),
  });

  const files = data?.list || [];
  const pageCount = data?.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteUploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadFiles"] });
      toast.success("文件已删除");
      setDeleteFileData(null);
    },
    onError: (error) => {
      toast.error("删除失败: " + (error instanceof Error ? error.message : "未知错误"));
    },
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

  const handlePreview = (file: UploadFile) => {
    setPreviewFile(file);
  };

  const handleDelete = (file: UploadFile) => {
    setDeleteFileData(file);
  };

  const columns = getColumns({
    onPreview: handlePreview,
    onDelete: handleDelete,
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-destructive">
        <p>加载文件列表失败</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "未知错误"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">文件管理</h2>
          <p className="text-muted-foreground">
            管理上传的图片和视频文件。
          </p>
        </div>
        <Button size="sm" onClick={() => setIsUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          上传文件
        </Button>
      </div>
      <DataTable
        data={files}
        columns={columns}
        searchKey="filename"
        searchPlaceholder="搜索文件名..."
        filters={filters}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualFiltering
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
      />

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />

      <PreviewDialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        file={previewFile}
      />

      <ConfirmDialog
        open={!!deleteFileData}
        onOpenChange={(open) => !open && setDeleteFileData(null)}
        title="确认删除文件?"
        desc={`您确定要删除文件 "${deleteFileData?.filename}" 吗？此操作无法撤销。`}
        confirmText="删除"
        destructive
        handleConfirm={() => deleteFileData && deleteMutation.mutate(deleteFileData.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

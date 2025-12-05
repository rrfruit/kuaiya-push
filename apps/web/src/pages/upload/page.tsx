import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUploadFiles, deleteUploadFile } from "@/api/upload";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Loader2, Upload } from "lucide-react";
import { FileTypeEnum } from "@/types/enum";
import { Button } from "@repo/ui/components/ui/button";
import { UploadDialog } from "./upload-dialog";
import { PreviewDialog } from "./preview-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { UploadFile } from "@/types";

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [deleteFileData, setDeleteFileData] = useState<UploadFile | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["uploadFiles"],
    queryFn: () => getUploadFiles(),
  });

  const files = data?.data || [];

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
    <div className="hidden h-full flex-1 flex-col space-y-4 p-8 md:flex">
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

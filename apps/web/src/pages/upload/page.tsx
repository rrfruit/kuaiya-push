import { useState, useCallback, useRef } from "react";
import { getUploadFiles, deleteUploadFile } from "@/api/upload";
import { getColumns } from "./columns";
import { ServerDataTable, type ServerParams } from "@/components/data-table";
import { Upload } from "lucide-react";
import { FileTypeEnum } from "@/types/enum";
import { FileType } from "@/types";
import { Button } from "@repo/ui/components/ui/button";
import { UploadDialog } from "./upload-dialog";
import { PreviewDialog } from "./preview-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { UploadFile } from "@/types";
import useRequest from "@/hooks/useRequest";

export default function UploadPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [deleteFileData, setDeleteFileData] = useState<UploadFile | null>(null);

  // 表格刷新函数引用
  const refreshRef = useRef<(() => void) | null>(null);

  // 数据获取函数
  const fetchData = useCallback((params: ServerParams) => {
    // 从 filters 中提取 type
    const typeFilter = params.filters?.type;
    const selectedType = Array.isArray(typeFilter)
      ? typeFilter.length === 1
        ? (typeFilter[0] as FileType)
        : undefined
      : (typeFilter as FileType | undefined);

    return getUploadFiles({
      page: params.page,
      pageSize: params.pageSize,
      filename: params.search,
      type: selectedType,
    });
  }, []);

  // 删除操作
  const { execute: executeDelete, isLoading: isDeleting } = useRequest(
    deleteUploadFile,
    {
      manual: true,
      onSuccess: () => {
        toast.success("文件已删除");
        setDeleteFileData(null);
        refreshRef.current?.();
      },
      onError: (error) => {
        toast.error(
          "删除失败: " + (error?.message || "未知错误")
        );
      },
    }
  );

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

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">文件管理</h2>
          <p className="text-muted-foreground">管理上传的图片和视频文件。</p>
        </div>
        <Button size="sm" onClick={() => setIsUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          上传文件
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        fetchData={fetchData}
        searchPlaceholder="搜索文件名..."
        filters={filters}
        onRefreshRef={(fn) => {
          refreshRef.current = fn;
        }}
      />

      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={() => refreshRef.current?.()}
      />

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
        handleConfirm={() => deleteFileData && executeDelete(deleteFileData.id)}
        isLoading={isDeleting}
      />
    </div>
  );
}

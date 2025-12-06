import { ColumnDef } from "@tanstack/react-table";
import { UploadFile, FileType } from "@/types";
import { FileTypeEnum } from "@/types/enum";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { MoreHorizontal, Image, Video, Eye, Trash2, Copy } from "lucide-react";

interface GetColumnsProps {
  onPreview: (file: UploadFile) => void;
  onDelete: (file: UploadFile) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const getColumns = ({
  onPreview,
  onDelete,
}: GetColumnsProps): ColumnDef<UploadFile>[] => [
  {
    accessorKey: "filename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="文件名" />
    ),
    cell: ({ row }) => {
      const file = row.original;
      const isImage = file.type === FileTypeEnum.IMAGE;
      return (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-500"
          onClick={() => onPreview(file)}
        >
          {isImage ? (
            <Image className="h-4 w-4 text-blue-500" />
          ) : (
            <Video className="h-4 w-4 text-purple-500" />
          )}
          <span
            className="max-w-[200px] truncate font-medium"
            title={file.filename}
          >
            {file.filename}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="类型" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as FileType;
      return (
        <Badge variant={type === FileTypeEnum.IMAGE ? "default" : "secondary"}>
          {type === FileTypeEnum.IMAGE ? "图片" : "视频"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="大小" />
    ),
    cell: ({ row }) => {
      const size = row.getValue("size") as number;
      return (
        <span className="text-muted-foreground">{formatFileSize(size)}</span>
      );
    },
  },
  {
    accessorKey: "mimeType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MIME 类型" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-xs text-muted-foreground">
          {row.getValue("mimeType")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="上传时间" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground text-xs">
          {date.toLocaleString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const file = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onPreview(file)}>
              <Eye className="mr-2 h-4 w-4" />
              预览
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(file.path)}
            >
              <Copy className="mr-2 h-4 w-4" />
              复制路径
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(file)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

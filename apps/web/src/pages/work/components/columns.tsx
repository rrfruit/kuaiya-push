import { ColumnDef } from "@tanstack/react-table";
import { Work, WorkType } from "@/types";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Image, Video, Copy } from "lucide-react";
import { useWorks } from "./works-provider";

const workTypeConfig: Record<WorkType, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  TEXT: { label: "文本", icon: <FileText className="h-4 w-4" />, variant: "outline" },
  IMAGE: { label: "图片", icon: <Image className="h-4 w-4" />, variant: "default" },
  VIDEO: { label: "视频", icon: <Video className="h-4 w-4" />, variant: "secondary" },
};

function DataTableRowActions({ row }: { row: { original: Work } }) {
  const { setOpen, setCurrentRow } = useWorks();
  const work = row.original;

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
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(work.id)}
        >
          <Copy className="mr-2 h-4 w-4" />
          复制 ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(work);
            setOpen("update");
          }}
        >
          编辑作品
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            setCurrentRow(work);
            setOpen("delete");
          }}
        >
          删除作品
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Work>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="全选"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="选择行"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="标题" />
    ),
    cell: ({ row }) => {
      const work = row.original;
      const config = workTypeConfig[work.type];
      return (
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="max-w-[200px] truncate font-medium" title={work.title}>
            {work.title}
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
      const type = row.getValue("type") as WorkType;
      const config = workTypeConfig[type];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="描述" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <span className="max-w-[300px] truncate text-muted-foreground" title={description}>
          {description || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
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
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="更新时间" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return (
        <div className="text-muted-foreground text-xs">
          {date.toLocaleString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

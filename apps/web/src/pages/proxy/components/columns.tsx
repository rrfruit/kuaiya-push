import { ColumnDef } from "@tanstack/react-table";
import { ProxyType } from "@/types";
import { ProxyWithCount } from "@/api/proxy";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Copy,
  Globe,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { useProxies } from "./proxies-provider";

const proxyTypeConfig: Record<
  ProxyType,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }
> = {
  HTTP: { label: "HTTP", icon: <Globe className="h-4 w-4" />, variant: "outline" },
  HTTPS: { label: "HTTPS", icon: <Shield className="h-4 w-4" />, variant: "default" },
  SOCKS5: { label: "SOCKS5", icon: <ShieldCheck className="h-4 w-4" />, variant: "secondary" },
};

function DataTableRowActions({ row }: { row: { original: ProxyWithCount } }) {
  const { setOpen, setCurrentRow } = useProxies();
  const proxy = row.original;

  const copyProxyUrl = () => {
    const auth = proxy.username ? `${proxy.username}:${proxy.password || ""}@` : "";
    const url = `${proxy.type.toLowerCase()}://${auth}${proxy.host}:${proxy.port}`;
    navigator.clipboard.writeText(url);
  };

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
        <DropdownMenuItem onClick={copyProxyUrl}>
          <Copy className="mr-2 h-4 w-4" />
          复制代理地址
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(proxy);
            setOpen("update");
          }}
        >
          编辑代理
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            setCurrentRow(proxy);
            setOpen("delete");
          }}
        >
          删除代理
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<ProxyWithCount>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="名称" />
    ),
    cell: ({ row }) => {
      const proxy = row.original;
      return (
        <span className="font-medium">
          {proxy.name || `${proxy.host}:${proxy.port}`}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="类型" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as ProxyType;
      const config = proxyTypeConfig[type];
      return (
        <Badge variant={config.variant} className="gap-1">
          {config.icon}
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="地址" />
    ),
    cell: ({ row }) => {
      const proxy = row.original;
      return (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {proxy.host}:{proxy.port}
        </code>
      );
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="位置" />
    ),
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return <span className="text-muted-foreground">{location || "-"}</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="状态" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return isActive ? (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          启用
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          禁用
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) as boolean;
      return value.includes(isActive ? "1" : "0");
    },
  },
  {
    id: "accounts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="关联账号" />
    ),
    cell: ({ row }) => {
      const count = row.original._count.accounts;
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "expireAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="过期时间" />
    ),
    cell: ({ row }) => {
      const expireAt = row.getValue("expireAt") as string | null;
      if (!expireAt) return <span className="text-muted-foreground">-</span>;

      const date = new Date(expireAt);
      const isExpired = date < new Date();
      return (
        <span className={isExpired ? "text-destructive" : "text-muted-foreground"}>
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

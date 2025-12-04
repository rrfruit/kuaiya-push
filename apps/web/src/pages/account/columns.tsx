import { ColumnDef } from "@tanstack/react-table";
import { Account, AccountStatus } from "@/types";
import { AccountStatusEnum } from "@/types/enum";
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
import { MoreHorizontal } from "lucide-react";

export interface AccountWithRelations extends Account {
  platform?: {
    name: string;
    code: string;
  };
  proxy?: {
    host: string;
    port: number;
  };
}

export const columns: ColumnDef<AccountWithRelations>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Display Name" />
    ),
  },
  {
    accessorKey: "platform.name",
    id: "platform",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Platform" />
    ),
    cell: ({ row }) => {
      const platform = row.original.platform;
      return platform ? (
        <div className="flex items-center gap-2">
          <span className="font-medium">{platform.name}</span>
        </div>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as AccountStatus;
      return (
        <Badge
          variant={
            status === AccountStatusEnum.LOGGED_IN
              ? "default"
              : status === AccountStatusEnum.LOGIN_EXPIRED
              ? "destructive"
              : "secondary"
          }
        >
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "proxy.host",
    id: "proxy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proxy" />
    ),
    cell: ({ row }) => {
      const proxy = row.original.proxy;
      return proxy ? `${proxy.host}:${proxy.port}` : "Direct";
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return <div className="text-muted-foreground text-xs">{date.toLocaleString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(account.id)}
            >
              Copy Account ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Account</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

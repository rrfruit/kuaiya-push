import { ColumnDef } from "@tanstack/react-table";
import { AccountWithRelations } from "@/types";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
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

interface GetColumnsProps {
  onEdit: (account: AccountWithRelations) => void;
  onDelete: (account: AccountWithRelations) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<AccountWithRelations>[] => [
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
            <DropdownMenuItem onClick={() => onEdit(account)}>
              Edit Account
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(account)}
            >
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getAccounts, deleteAccount } from "@/api/account";
import { getColumns } from "./components/columns";
import { AccountWithRelations } from "@/types";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
import { PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { AccountDialog } from "./components/account-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export default function AccountPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<AccountWithRelations | null>(null);
  const [deleteAccountData, setDeleteAccountData] =
    useState<AccountWithRelations | null>(null);

  // 获取账号列表
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
  });

  // 删除操作
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("账号已删除");
      setDeleteAccountData(null);
    },
    onError: (err) => {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误"),
      );
    },
  });

  const filters = [
    {
      columnId: "isLoggedIn",
      title: "登录状态",
      options: [
        { label: "是", value: "1" },
        { label: "否", value: "0" },
      ],
    },
  ];

  const handleCreate = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (account: AccountWithRelations) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = (account: AccountWithRelations) => {
    setDeleteAccountData(account);
  };

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // 客户端表格
  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="hidden h-full flex-1 flex-col space-y-4 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">账号管理</h2>
          <p className="text-muted-foreground">
            管理你的社交媒体账号及其状态。
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <PlusIcon className="h-4 w-4" />
          添加账号
        </Button>
      </div>

      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="displayName"
          searchPlaceholder="搜索账号..."
          filters={filters}
        />
        <DataTable
          table={table}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
        />
        <DataTablePagination table={table} />
      </div>

      <AccountDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        account={editingAccount}
      />

      <ConfirmDialog
        open={!!deleteAccountData}
        onOpenChange={(open) => !open && setDeleteAccountData(null)}
        title="确认删除账号?"
        desc={`您确定要删除账号 "${deleteAccountData?.displayName}" 吗？此操作无法撤销。`}
        confirmText="删除"
        destructive
        handleConfirm={() =>
          deleteAccountData && deleteMutation.mutate(deleteAccountData.id)
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
